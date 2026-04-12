import Application from "../models/Application.model.js";
import Job from "../models/Job.model.js";
import { sendError, sendSuccess } from "../utils/response.js";
import { ensureStudentProfile, normalizeStringArray } from "../utils/studentProfile.js";

const APPLICATION_POPULATE = [
  {
    path: "job",
    populate: {
      path: "postedBy",
      select: "name email role",
    },
  },
  {
    path: "student",
    populate: {
      path: "user",
      select: "name email role",
    },
  },
];

const matchesSearch = (application, search = "") => {
  if (!search) {
    return true;
  }

  const haystack = [
    application.job?.title,
    application.job?.company,
    application.student?.name,
    application.student?.email,
    application.student?.college,
    application.student?.degree,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(search.toLowerCase());
};

export const createApplication = async (req, res, next) => {
  try {
    const { jobId, coverLetter = "" } = req.body;

    if (!jobId) {
      return sendError(res, "jobId is required", 400);
    }

    const job = await Job.findById(jobId);

    if (!job) {
      return sendError(res, "Job not found", 404);
    }

    if (job.status !== "active") {
      return sendError(res, "This job is not accepting applications", 400);
    }

    if (job.expiresAt && new Date(job.expiresAt).getTime() < Date.now()) {
      return sendError(res, "This job posting has expired", 400);
    }

    const studentProfile = await ensureStudentProfile(req.user.id);

    if (!studentProfile) {
      return sendError(res, "Student profile not found", 404);
    }

    const existingApplication = await Application.findOne({
      job: job._id,
      student: studentProfile._id,
    });

    if (existingApplication) {
      return sendError(res, "You have already applied for this job", 400);
    }

    const application = await Application.create({
      job: job._id,
      student: studentProfile._id,
      coverLetter: String(coverLetter || "").trim(),
    });

    const populatedApplication = await Application.findById(application._id).populate(
      APPLICATION_POPULATE
    );

    sendSuccess(res, { application: populatedApplication }, "Application submitted successfully", 201);
  } catch (error) {
    next(error);
  }
};

export const getMyApplications = async (req, res, next) => {
  try {
    const studentProfile = await ensureStudentProfile(req.user.id);

    if (!studentProfile) {
      return sendError(res, "Student profile not found", 404);
    }

    const applications = await Application.find({ student: studentProfile._id })
      .populate(APPLICATION_POPULATE)
      .sort({ createdAt: -1 });

    sendSuccess(res, { applications }, "Applications retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const getRecruiterApplications = async (req, res, next) => {
  try {
    const { jobId, skills, experienceLevel, year, status, search } = req.query;
    const recruiterJobs = await Job.find({ postedBy: req.user.id }).select("_id");
    const recruiterJobIds = recruiterJobs.map((job) => job._id);

    if (!recruiterJobIds.length) {
      return sendSuccess(res, { applications: [] }, "Applications retrieved successfully");
    }

    const filter = { job: { $in: recruiterJobIds } };

    if (jobId) {
      const requestedJobId = recruiterJobIds.find((id) => String(id) === String(jobId));

      if (!requestedJobId) {
        return sendError(res, "Not authorized to view applications for this job", 403);
      }

      filter.job = requestedJobId;
    }

    if (status) {
      filter.status = String(status).trim().toLowerCase();
    }

    const applications = await Application.find(filter)
      .populate(APPLICATION_POPULATE)
      .sort({ createdAt: -1 });

    const skillFilters = normalizeStringArray(skills).map((skill) => skill.toLowerCase());

    const filteredApplications = applications.filter((application) => {
      const profile = application.student;
      const profileSkills = Array.isArray(profile?.skills)
        ? profile.skills.map((skill) => String(skill).toLowerCase())
        : [];

      if (skillFilters.length && !skillFilters.every((skill) => profileSkills.includes(skill))) {
        return false;
      }

      if (
        experienceLevel &&
        String(profile?.experienceLevel || "").toLowerCase() !==
          String(experienceLevel).toLowerCase()
      ) {
        return false;
      }

      if (year && String(profile?.year || "").toLowerCase() !== String(year).toLowerCase()) {
        return false;
      }

      return matchesSearch(application, search);
    });

    sendSuccess(res, { applications: filteredApplications }, "Applications retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const nextStatus = String(status || "").trim().toLowerCase();

    if (!["shortlisted", "rejected", "applied"].includes(nextStatus)) {
      return sendError(res, "Status must be applied, shortlisted, or rejected", 400);
    }

    const application = await Application.findById(req.params.id).populate("job");

    if (!application) {
      return sendError(res, "Application not found", 404);
    }

    if (String(application.job?.postedBy) !== String(req.user.id) && req.user.role !== "admin") {
      return sendError(res, "Not authorized to update this application", 403);
    }

    application.status = nextStatus;
    await application.save();

    const populatedApplication = await Application.findById(application._id).populate(
      APPLICATION_POPULATE
    );

    sendSuccess(res, { application: populatedApplication }, "Application status updated successfully");
  } catch (error) {
    next(error);
  }
};
