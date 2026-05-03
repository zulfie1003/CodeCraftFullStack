import { fetchAdzunaJobs } from './jobProviders/adzuna.provider.js';
import { fetchRapidApiJobs } from './jobProviders/rapidapi.provider.js';
import { getJobSkills } from './jobProfile.service.js';
import { extractApplyUrl, isCareerPortalLink } from '../utils/jobLinks.js';
import {
  computeMatchBreakdown,
  normalizeSkillToken,
  normalizeSkills,
} from '../utils/jobMatching.js';

const RECENT_JOB_WINDOW_DAYS = 7;

const PROVIDERS = [
  { name: 'adzuna', fetchJobs: fetchAdzunaJobs },
  { name: 'rapidapi', fetchJobs: fetchRapidApiJobs },
];

const normalizeText = (value = '') =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const buildTitleCompanyKey = (job = {}) =>
  [job.title, job.company].map(normalizeText).join('::');

const isWithinLastSevenDays = (value) => {
  if (!value) {
    return false;
  }

  const postedAt = new Date(value);
  if (Number.isNaN(postedAt.getTime())) {
    return false;
  }

  const now = Date.now();
  const ageMs = now - postedAt.getTime();
  return ageMs >= 0 && ageMs <= RECENT_JOB_WINDOW_DAYS * 24 * 60 * 60 * 1000;
};

export const filterRecentJobs = (jobs = []) =>
  jobs.filter((job) => isWithinLastSevenDays(job.postedAt || job.createdAt));

const normalizeAggregatedJob = (job = {}, index = 0) => {
  const applyUrl = extractApplyUrl(job);
  const source = String(job.source || 'other').trim().toLowerCase() || 'other';

  return {
    ...job,
    _id: job._id || `external-${source}-${job.sourceJobId || index}`,
    title: String(job.title || '').trim(),
    company: String(job.company || '').trim(),
    location: String(job.location || 'Remote').trim(),
    applyUrl,
    isDirectCompanyApply:
      job.isDirectCompanyApply === true || isCareerPortalLink(applyUrl),
    source,
  };
};

export const aggregateJobsFromProviders = async (providerNames = []) => {
  const requestedProviders = normalizeSkills(providerNames).map((name) => normalizeText(name));
  const activeProviders = requestedProviders.length
    ? PROVIDERS.filter((provider) => requestedProviders.includes(provider.name))
    : PROVIDERS;
  const providerResults = await Promise.allSettled(
    activeProviders.map(async ({ name, fetchJobs }) => ({
      provider: name,
      jobs: await fetchJobs(),
    }))
  );

  const jobs = [];
  const providers = [];

  providerResults.forEach((result, index) => {
    const providerName = activeProviders[index]?.name || 'unknown';

    if (result.status !== 'fulfilled') {
      providers.push({
        name: providerName,
        status: 'failed',
        error: result.reason?.message || 'Provider fetch failed',
      });
      return;
    }

    const providerJobs = Array.isArray(result.value.jobs) ? result.value.jobs : [];
    providers.push({
      name: result.value.provider || providerName,
      status: 'ok',
      received: providerJobs.length,
    });
    jobs.push(...providerJobs);
  });

  const seen = new Set();
  const dedupedJobs = [];

  jobs.forEach((job, index) => {
    const normalizedJob = normalizeAggregatedJob(job, index);
    const key = buildTitleCompanyKey(normalizedJob);

    if (!normalizedJob.title || !normalizedJob.company || !key || seen.has(key)) {
      return;
    }

    seen.add(key);
    dedupedJobs.push(normalizedJob);
  });

  return {
    jobs: dedupedJobs,
    providers,
  };
};

const countKeywordMatches = (needles = [], haystack = '') => {
  const normalizedHaystack = ` ${normalizeSkillToken(haystack)} `;

  return needles.filter((needle) => {
    const normalizedNeedle = normalizeSkillToken(needle);
    return normalizedNeedle && normalizedHaystack.includes(` ${normalizedNeedle} `);
  }).length;
};

export const rankJobs = (jobs = [], userProfile = {}) => {
  const userSkills = normalizeSkills(userProfile.skills);
  const role = String(userProfile.role || '').trim();
  const location = String(userProfile.location || '').trim();

  return jobs
    .map((job) => {
      const jobSkills = getJobSkills(job);
      const text = [job.title, job.description, ...(job.requirements || []), ...jobSkills]
        .filter(Boolean)
        .join(' ');
      const skillMatches = countKeywordMatches(userSkills, text);
      const skillBreakdown = computeMatchBreakdown(userSkills, jobSkills);
      const skillScore = userSkills.length
        ? Math.round((skillMatches / userSkills.length) * 55)
        : 0;
      const titleScore = role && normalizeText(job.title).includes(normalizeText(role)) ? 20 : 0;
      const locationScore =
        location && normalizeText(job.location).includes(normalizeText(location)) ? 10 : 0;
      const directApplyBoost = job.isDirectCompanyApply ? 8 : 0;
      const recentBoost = isWithinLastSevenDays(job.postedAt || job.createdAt) ? 7 : 0;
      const fallbackScore = userSkills.length || role || location ? 0 : 35;
      const matchScore = Math.min(
        100,
        skillScore + titleScore + locationScore + directApplyBoost + recentBoost + fallbackScore
      );

      return {
        ...job,
        skills: jobSkills,
        skillMatchScore: skillBreakdown.skillMatchScore,
        matchedSkills: skillBreakdown.matchedSkills,
        missingSkills: skillBreakdown.missingSkills,
        experienceMatchScore: job.experienceMatchScore ?? 100,
        experienceMatched: job.experienceMatched ?? true,
        matchScore,
      };
    })
    .sort((left, right) => {
      if (right.matchScore !== left.matchScore) {
        return right.matchScore - left.matchScore;
      }

      return (
        new Date(right.postedAt || right.createdAt || 0).getTime() -
        new Date(left.postedAt || left.createdAt || 0).getTime()
      );
    });
};
