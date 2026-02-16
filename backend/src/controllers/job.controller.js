// controllers/job.controller.js
import Job from '../models/job.model.js';
import User from '../models/user.model.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Create job (Admin only)
export const createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    const job = await Job.create(jobData);
    
    sendSuccess(res, { job }, 'Job posted successfully', 201);
  } catch (error) {
    next(error);
  }
};

// Get all jobs
export const getAllJobs = async (req, res, next) => {
  try {
    const { type, location, remote, search, page = 1, limit = 10 } = req.query;
    
    const filter = { status: 'active' };
    
    if (type) filter.type = type;
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

    job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
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

    await job.deleteOne();

    sendSuccess(res, null, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};