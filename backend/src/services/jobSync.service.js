import Job from '../models/Job.model.js';
import { buildJobDedupeKey } from '../utils/jobMatching.js';
import { fetchAdzunaJobs } from './jobProviders/adzuna.provider.js';
import { fetchRapidApiJobs } from './jobProviders/rapidapi.provider.js';

const EXTERNAL_PROVIDERS = [
  { name: 'adzuna', fetchJobs: fetchAdzunaJobs },
  { name: 'rapidapi', fetchJobs: fetchRapidApiJobs },
];

let isSyncRunning = false;

const normalizeExistingDedupeKeys = async () => {
  const jobsWithoutDedupeKey = await Job.find({
    $or: [{ dedupeKey: { $exists: false } }, { dedupeKey: '' }],
  }).select('_id title company location');

  if (!jobsWithoutDedupeKey.length) {
    return 0;
  }

  await Promise.all(
    jobsWithoutDedupeKey.map((job) =>
      Job.updateOne(
        { _id: job._id },
        { $set: { dedupeKey: buildJobDedupeKey(job) } },
        { runValidators: false }
      )
    )
  );

  return jobsWithoutDedupeKey.length;
};

const removeDuplicateJobs = async () => {
  const jobs = await Job.find({})
    .select('_id title company location dedupeKey createdAt')
    .sort({ createdAt: -1 });

  const seenKeys = new Set();
  const duplicateIds = [];

  jobs.forEach((job) => {
    const dedupeKey = job.dedupeKey || buildJobDedupeKey(job);

    if (!dedupeKey) {
      return;
    }

    if (seenKeys.has(dedupeKey)) {
      duplicateIds.push(job._id);
      return;
    }

    seenKeys.add(dedupeKey);
  });

  if (duplicateIds.length) {
    await Job.deleteMany({ _id: { $in: duplicateIds } });
  }

  return duplicateIds.length;
};

const upsertExternalJob = async (jobPayload = {}) => {
  const dedupeKey = buildJobDedupeKey(jobPayload);

  if (!dedupeKey) {
    return 'skipped';
  }

  const existingJob = await Job.findOne({ dedupeKey });

  if (
    existingJob?.postedBy &&
    ['manual', 'company', 'naukri', 'other'].includes(existingJob.source)
  ) {
    await Job.updateOne(
      { _id: existingJob._id },
      { $set: { lastSyncedAt: new Date() } }
    );

    return 'skipped_manual';
  }

  await Job.findOneAndUpdate(
    { dedupeKey },
    {
      ...jobPayload,
      dedupeKey,
      status: 'active',
      lastSyncedAt: new Date(),
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  return existingJob ? 'updated' : 'created';
};

export const syncExternalJobs = async () => {
  if (isSyncRunning) {
    return {
      skipped: true,
      reason: 'sync already in progress',
    };
  }

  isSyncRunning = true;

  try {
    const normalizedCount = await normalizeExistingDedupeKeys();
    const providerResults = await Promise.allSettled(
      EXTERNAL_PROVIDERS.map(async ({ name, fetchJobs }) => ({
        provider: name,
        jobs: await fetchJobs(),
      }))
    );

    const syncSummary = {
      normalizedCount,
      created: 0,
      updated: 0,
      skipped: 0,
      duplicateRemovals: 0,
      providers: [],
    };

    for (const [index, result] of providerResults.entries()) {
      if (result.status !== 'fulfilled') {
        syncSummary.providers.push({
          name: EXTERNAL_PROVIDERS[index]?.name || 'unknown',
          status: 'failed',
          error: result.reason?.message || 'Provider sync failed',
        });
        continue;
      }

      const { provider, jobs } = result.value;
      syncSummary.providers.push({
        name: provider,
        status: 'ok',
        received: jobs.length,
      });

      for (const job of jobs) {
        const action = await upsertExternalJob(job);

        if (action === 'created') syncSummary.created += 1;
        if (action === 'updated') syncSummary.updated += 1;
        if (action.startsWith('skipped')) syncSummary.skipped += 1;
      }
    }

    syncSummary.duplicateRemovals = await removeDuplicateJobs();
    return syncSummary;
  } finally {
    isSyncRunning = false;
  }
};
