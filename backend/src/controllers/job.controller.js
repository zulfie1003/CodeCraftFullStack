import Job from '../models/Job.model.js';
import User from '../models/User.model.js';
import { resolveUserJobProfile, serializeRecommendedJob } from '../services/jobProfile.service.js';
import { syncExternalJobs } from '../services/jobSync.service.js';
import {
  buildJobDedupeKey,
  extractSkillsFromText,
  isValidHttpUrl,
  normalizeJobDescription,
  normalizeExperienceLevel,
  normalizeExperienceText,
  normalizeSkills,
  normalizeStringArray,
} from '../utils/jobMatching.js';
import { sendError, sendSuccess } from '../utils/response.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePaginationValue = (value, fallback) => {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

const buildJobPayload = (payload = {}) => {
  const normalizedPayload = {};

  if ('title' in payload) normalizedPayload.title = String(payload.title || '').trim();
  if ('company' in payload) normalizedPayload.company = String(payload.company || '').trim();
  if ('source' in payload) normalizedPayload.source = String(payload.source || '').trim().toLowerCase();
  if ('sourceJobId' in payload) normalizedPayload.sourceJobId = String(payload.sourceJobId || '').trim();
  if ('type' in payload) normalizedPayload.type = String(payload.type || '').trim().toLowerCase();
  if ('experienceLevel' in payload) {
    const normalizedExperienceLevel = normalizeExperienceLevel(payload.experienceLevel);
    if (normalizedExperienceLevel) {
      normalizedPayload.experienceLevel = normalizedExperienceLevel;
    }
  }
  if ('experience' in payload || 'experienceLevel' in payload) {
    normalizedPayload.experience = normalizeExperienceText(
      payload.experience,
      payload.experienceLevel
    );
  }
  if ('location' in payload) normalizedPayload.location = String(payload.location || '').trim();
  if ('description' in payload) {
    normalizedPayload.description = normalizeJobDescription(payload.description);
  }
  if ('applyUrl' in payload) normalizedPayload.applyUrl = String(payload.applyUrl || '').trim();
  if ('remote' in payload) normalizedPayload.remote = payload.remote === true || payload.remote === 'true';
  if ('requirements' in payload) normalizedPayload.requirements = normalizeStringArray(payload.requirements);
  if ('skills' in payload) normalizedPayload.skills = normalizeSkills(payload.skills);
  if ('status' in payload) normalizedPayload.status = String(payload.status || '').trim().toLowerCase();
  if ('salaryText' in payload) normalizedPayload.salaryText = String(payload.salaryText || '').trim();
  if ('lastSyncedAt' in payload) {
    normalizedPayload.lastSyncedAt = payload.lastSyncedAt ? new Date(payload.lastSyncedAt) : undefined;
  }

  if (
    (!normalizedPayload.skills || normalizedPayload.skills.length === 0) &&
    [payload.title, payload.description, ...(normalizeStringArray(payload.requirements) || [])]
      .filter(Boolean)
      .length
  ) {
    normalizedPayload.skills = extractSkillsFromText(
      [payload.title, payload.description, ...(normalizeStringArray(payload.requirements) || [])]
        .filter(Boolean)
        .join(' ')
    );
  }

  if ('expiresAt' in payload) {
    normalizedPayload.expiresAt = payload.expiresAt ? new Date(payload.expiresAt) : undefined;
  }

  if ('salary' in payload && payload.salary && typeof payload.salary === 'object') {
    normalizedPayload.salary = {
      min: payload.salary.min ? Number(payload.salary.min) : undefined,
      max: payload.salary.max ? Number(payload.salary.max) : undefined,
      currency: String(payload.salary.currency || 'USD').trim().toUpperCase(),
    };
  }

  return normalizedPayload;
};

const buildActiveJobFilter = () => ({
  status: 'active',
  $or: [
    { expiresAt: { $exists: false } },
    { expiresAt: null },
    { expiresAt: { $gte: new Date() } },
  ],
});

const buildJobFilters = (query = {}, options = {}) => {
  const filter = buildActiveJobFilter();
  const andConditions = [];
  const requestedSkills = normalizeSkills(query.skills);

  if (query.location) {
    andConditions.push({
      location: {
        $regex: escapeRegExp(String(query.location).trim()),
        $options: 'i',
      },
    });
  }

  if (requestedSkills.length) {
    andConditions.push({
      skills: { $in: requestedSkills },
    });
  }

  if (query.source) {
    andConditions.push({
      source: String(query.source).trim().toLowerCase(),
    });
  }

  if (query.experience) {
    andConditions.push({
      experience: {
        $regex: escapeRegExp(String(query.experience).trim()),
        $options: 'i',
      },
    });
  }

  if (query.experienceLevel) {
    const experienceLevel = normalizeExperienceLevel(query.experienceLevel);

    if (experienceLevel) {
      andConditions.push({ experienceLevel });
    }
  }

  if (query.search) {
    const searchExpression = {
      $regex: escapeRegExp(String(query.search).trim()),
      $options: 'i',
    };

    andConditions.push({
      $or: [
        { title: searchExpression },
        { company: searchExpression },
        { location: searchExpression },
        { description: searchExpression },
        { skills: searchExpression },
      ],
    });
  }

  if (options.bookmarkedOnly) {
    const bookmarkedJobIds = options.bookmarkedJobIds || [];

    andConditions.push({
      _id: bookmarkedJobIds.length ? { $in: bookmarkedJobIds } : { $in: [] },
    });
  }

  if (andConditions.length) {
    filter.$and = andConditions;
  }

  return filter;
};

const validateJobPayload = (jobPayload = {}) => {
  if (!jobPayload.title) return 'Job title is required';
  if (!jobPayload.company) return 'Company is required';
  if (!jobPayload.location) return 'Location is required';
  if (!jobPayload.description) return 'Job description is required';
  if (!jobPayload.applyUrl) return 'External apply URL is required';
  if (!isValidHttpUrl(jobPayload.applyUrl)) return 'applyUrl must be a valid http(s) URL';
  return '';
};

const sortRecommendedJobs = (left, right) => {
  if (right.matchScore !== left.matchScore) {
    return right.matchScore - left.matchScore;
  }

  if (right.matchedSkills.length !== left.matchedSkills.length) {
    return right.matchedSkills.length - left.matchedSkills.length;
  }

  return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
};

export const createJob = async (req, res, next) => {
  try {
    const jobPayload = buildJobPayload(req.body);
    const validationMessage = validateJobPayload(jobPayload);

    if (validationMessage) {
      return sendError(res, validationMessage, 400);
    }

    const dedupeKey = buildJobDedupeKey(jobPayload);
    const existingJob = await Job.findOne({ dedupeKey });

    if (
      existingJob &&
      req.user.role === 'recruiter' &&
      String(existingJob.postedBy || '') !== String(req.user.id)
    ) {
      return sendError(res, 'A similar job already exists and cannot be overwritten', 403);
    }

    const savedJob = await Job.findOneAndUpdate(
      { dedupeKey },
      {
        ...jobPayload,
        dedupeKey,
        postedBy: req.user.id,
        source: jobPayload.source || 'manual',
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    sendSuccess(
      res,
      { job: savedJob },
      existingJob ? 'Job updated successfully' : 'Job created successfully',
      existingJob ? 200 : 201
    );
  } catch (error) {
    next(error);
  }
};

export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id }).sort({ createdAt: -1 });

    sendSuccess(res, { jobs }, 'Recruiter jobs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getAllJobs = async (req, res, next) => {
  try {
    const page = parsePaginationValue(req.query.page, 1);
    const limit = Math.min(parsePaginationValue(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const filter = buildJobFilters(req.query);

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('postedBy', 'name role')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Job.countDocuments(filter),
    ]);

    sendSuccess(res, {
      jobs: jobs.map((job) => serializeRecommendedJob(job)),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecommendedJobs = async (req, res, next) => {
  try {
    const page = parsePaginationValue(req.query.page, 1);
    const limit = Math.min(parsePaginationValue(req.query.limit, DEFAULT_LIMIT), MAX_LIMIT);
    const profile = await resolveUserJobProfile(req.user.id);
    const userSkills = profile.userSkills;

    const filter = buildJobFilters(req.query, {
      bookmarkedOnly: req.query.bookmarked === 'true',
      bookmarkedJobIds: [...profile.bookmarkSet],
    });

    const jobs = await Job.find(filter).populate('postedBy', 'name role');
    const recommendedJobs = jobs
      .map((job) => serializeRecommendedJob(job, userSkills, profile.bookmarkSet))
      .sort(sortRecommendedJobs);

    const paginatedJobs = recommendedJobs.slice((page - 1) * limit, page * limit);
    const averageMatch = recommendedJobs.length
      ? Math.round(
          recommendedJobs.reduce((total, job) => total + job.matchScore, 0) / recommendedJobs.length
        )
      : 0;

    sendSuccess(res, {
      userSkills,
      jobs: paginatedJobs,
      summary: {
        totalJobs: recommendedJobs.length,
        averageMatch,
        bookmarkedCount: profile.bookmarkSet.size,
      },
      pagination: {
        total: recommendedJobs.length,
        page,
        pages: Math.ceil(recommendedJobs.length / limit) || 1,
        limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const matchJobs = getRecommendedJobs;

export const getBookmarkedJobs = async (req, res, next) => {
  try {
    const profile = await resolveUserJobProfile(req.user.id);
    const jobs = await Job.find({
      _id: { $in: [...profile.bookmarkSet] },
    })
      .populate('postedBy', 'name role')
      .sort({ createdAt: -1 });

    sendSuccess(res, {
      jobs: jobs.map((job) => serializeRecommendedJob(job, profile.userSkills, profile.bookmarkSet)),
    });
  } catch (error) {
    next(error);
  }
};

export const bookmarkJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 'Job not found', 404);
    }

    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { bookmarkedJobs: job._id },
    });

    sendSuccess(res, { jobId: job._id, bookmarked: true }, 'Job bookmarked successfully');
  } catch (error) {
    next(error);
  }
};

export const removeBookmarkedJob = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { bookmarkedJobs: req.params.id },
    });

    sendSuccess(res, { jobId: req.params.id, bookmarked: false }, 'Bookmark removed successfully');
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name email role');

    if (!job) {
      return sendError(res, 'Job not found', 404);
    }

    sendSuccess(res, { job: serializeRecommendedJob(job) });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const currentJob = await Job.findById(req.params.id);

    if (!currentJob) {
      return sendError(res, 'Job not found', 404);
    }

    if (req.user.role === 'recruiter' && String(currentJob.postedBy) !== String(req.user.id)) {
      return sendError(res, 'Not authorized to update this job', 403);
    }

    const nextPayload = buildJobPayload(req.body);
    const mergedJob = {
      ...currentJob.toObject(),
      ...nextPayload,
    };
    const dedupeKey = buildJobDedupeKey(mergedJob);

    const conflictJob = await Job.findOne({
      _id: { $ne: currentJob._id },
      dedupeKey,
    });

    if (conflictJob) {
      return sendError(res, 'Another job already exists with the same title, company, and location', 409);
    }

    const validationMessage = validateJobPayload(mergedJob);

    if (validationMessage) {
      return sendError(res, validationMessage, 400);
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      {
        ...nextPayload,
        dedupeKey,
      },
      { new: true, runValidators: true }
    );

    sendSuccess(res, { job: updatedJob }, 'Job updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 'Job not found', 404);
    }

    if (req.user.role === 'recruiter' && String(job.postedBy) !== String(req.user.id)) {
      return sendError(res, 'Not authorized to delete this job', 403);
    }

    await job.deleteOne();

    sendSuccess(res, null, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const syncJobsNow = async (req, res, next) => {
  try {
    const summary = await syncExternalJobs();
    sendSuccess(res, { summary }, 'Job sync completed successfully');
  } catch (error) {
    next(error);
  }
};
