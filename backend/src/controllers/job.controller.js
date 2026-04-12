// controllers/job.controller.js
import Job from '../models/Job.model.js';
import User from '../models/User.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const buildJobPayload = (payload = {}) => {
  const normalizedPayload = {};

  if ('title' in payload) normalizedPayload.title = String(payload.title || '').trim();
  if ('company' in payload) normalizedPayload.company = String(payload.company || '').trim();
  if ('type' in payload) normalizedPayload.type = String(payload.type || '').trim().toLowerCase();
  if ('experienceLevel' in payload) {
    normalizedPayload.experienceLevel = String(payload.experienceLevel || '').trim().toLowerCase();
  }
  if ('location' in payload) normalizedPayload.location = String(payload.location || '').trim();
  if ('description' in payload) normalizedPayload.description = String(payload.description || '').trim();
  if ('applyUrl' in payload) normalizedPayload.applyUrl = String(payload.applyUrl || '').trim();
  if ('remote' in payload) normalizedPayload.remote = Boolean(payload.remote);
  if ('requirements' in payload) normalizedPayload.requirements = normalizeStringArray(payload.requirements);
  if ('skills' in payload) normalizedPayload.skills = normalizeStringArray(payload.skills);
  if ('status' in payload) normalizedPayload.status = String(payload.status || '').trim().toLowerCase();

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

// Create job (Admin only)
export const createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...buildJobPayload(req.body),
      postedBy: req.user.id
    };

    const job = await Job.create(jobData);
    
    sendSuccess(res, { job }, 'Job posted successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getMyJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.id })
      .sort({ createdAt: -1 });

    sendSuccess(res, { jobs }, 'Recruiter jobs retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// Get all jobs
export const getAllJobs = async (req, res, next) => {
  try {
    const { type, location, remote, search, experienceLevel, page = 1, limit = 10 } = req.query;
    
    const filter = { status: 'active' };
    
    if (type) filter.type = type;
    if (experienceLevel) filter.experienceLevel = experienceLevel;
    if (location) filter.location = new RegExp(location, 'i');
    if (remote !== undefined) filter.remote = remote === 'true';
    if (search) {
      filter.$text = { $search: search };
    }

    // Only show non-expired jobs
    filter.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gte: new Date() } }
    ];

    const skip = (page - 1) * limit;

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Job.countDocuments(filter);

    sendSuccess(res, {
      jobs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get job by ID
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email');

    if (!job) {
      return sendError(res, 'Job not found', 404);
    }

    sendSuccess(res, { job });
  } catch (error) {
    next(error);
  }
};

// Match jobs based on user skills
export const matchJobs = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.skills || user.skills.length === 0) {
      return sendError(res, 'Please add skills to your profile first', 400);
    }

    const matchedJobs = await Job.find({
      status: 'active',
      skills: { $in: user.skills },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } }
      ]
    })
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

    sendSuccess(res, {
      jobs: matchedJobs,
      matchCount: matchedJobs.length
    });
  } catch (error) {
    next(error);
  }
};

// Update job (Admin only)
export const updateJob = async (req, res, next) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return sendError(res, 'Job not found', 404);
    }

    if (req.user.role === 'recruiter' && String(job.postedBy) !== String(req.user.id)) {
      return sendError(res, 'Not authorized to update this job', 403);
    }

    job = await Job.findByIdAndUpdate(
      req.params.id,
      buildJobPayload(req.body),
      { new: true, runValidators: true }
    );

    sendSuccess(res, { job }, 'Job updated successfully');
  } catch (error) {
    next(error);
  }
};

// Delete job (Admin only)
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
