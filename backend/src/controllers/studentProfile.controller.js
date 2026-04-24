import StudentProfile from "../models/StudentProfile.model.js";
import User from "../models/User.model.js";
import { parseResumeForStudentProfile } from "../services/resumeAutofill.service.js";
import { sendError, sendSuccess } from "../utils/response.js";
import {
  ensureStudentProfile,
  normalizeExperiences,
  normalizeProjects,
  normalizeStringArray,
} from "../utils/studentProfile.js";

const buildStudentProfilePayload = (payload = {}) => {
  const nextPayload = {};

  if ("name" in payload) nextPayload.name = String(payload.name || "").trim();
  if ("email" in payload) nextPayload.email = String(payload.email || "").trim().toLowerCase();
  if ("phone" in payload) nextPayload.phone = String(payload.phone || "").trim();
  if ("college" in payload) nextPayload.college = String(payload.college || "").trim();
  if ("degree" in payload) nextPayload.degree = String(payload.degree || "").trim();
  if ("year" in payload) nextPayload.year = String(payload.year || "").trim();
  if ("experienceLevel" in payload) {
    nextPayload.experienceLevel = String(payload.experienceLevel || "").trim().toLowerCase();
  }
  if ("skills" in payload) nextPayload.skills = normalizeStringArray(payload.skills);
  if ("projects" in payload) nextPayload.projects = normalizeProjects(payload.projects);
  if ("experiences" in payload) nextPayload.experiences = normalizeExperiences(payload.experiences);
  if ("githubUrl" in payload) nextPayload.githubUrl = String(payload.githubUrl || "").trim();
  if ("leetcodeUrl" in payload) nextPayload.leetcodeUrl = String(payload.leetcodeUrl || "").trim();
  if ("gfgUrl" in payload) nextPayload.gfgUrl = String(payload.gfgUrl || "").trim();
  if ("portfolioUrl" in payload) nextPayload.portfolioUrl = String(payload.portfolioUrl || "").trim();
  if ("linkedinUrl" in payload) nextPayload.linkedinUrl = String(payload.linkedinUrl || "").trim();

  if ("resume" in payload && payload.resume && typeof payload.resume === "object") {
    nextPayload.resume = {
      fileName: String(payload.resume.fileName || "").trim(),
      dataUrl: String(payload.resume.dataUrl || "").trim(),
      text: String(payload.resume.text || "").trim(),
      uploadedAt: payload.resume.dataUrl || payload.resume.text ? new Date() : undefined,
    };
  }

  return nextPayload;
};

const syncUserFromStudentProfile = async (userId, studentProfile) => {
  await User.findByIdAndUpdate(
    userId,
    {
      name: studentProfile.name,
      email: studentProfile.email,
      skills: studentProfile.skills,
      phone: studentProfile.phone,
      github: studentProfile.githubUrl,
      leetcode: studentProfile.leetcodeUrl,
      gfg: studentProfile.gfgUrl,
      linkedin: studentProfile.linkedinUrl,
      portfolio: studentProfile.portfolioUrl,
      resume: {
        fileName: studentProfile.resume?.fileName || "",
        dataUrl: studentProfile.resume?.dataUrl || "",
        text: studentProfile.resume?.text || "",
        uploadedAt: studentProfile.resume?.uploadedAt,
      },
    },
    { new: true, runValidators: true }
  );
};

export const getMyStudentProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return sendError(res, "Only students can access a student profile workspace", 403);
    }

    const studentProfile = await ensureStudentProfile(req.user.id);

    if (!studentProfile) {
      return sendError(res, "Student profile not found", 404);
    }

    sendSuccess(res, { studentProfile }, "Student profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const upsertMyStudentProfile = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return sendError(res, "Only students can update a student profile", 403);
    }

    const currentProfile = await ensureStudentProfile(req.user.id);

    if (!currentProfile) {
      return sendError(res, "Student profile not found", 404);
    }

    const updates = buildStudentProfilePayload(req.body);

    if (updates.email && updates.email !== req.user.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return sendError(res, "Email already registered with another account", 400);
      }
    }

    const studentProfile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    await syncUserFromStudentProfile(req.user.id, studentProfile);

    sendSuccess(res, { studentProfile }, "Student profile updated successfully");
  } catch (error) {
    next(error);
  }
};

export const autofillMyStudentProfileFromResume = async (req, res, next) => {
  try {
    if (req.user.role !== "student") {
      return sendError(res, "Only students can update a student profile", 403);
    }

    const currentProfile = await ensureStudentProfile(req.user.id);

    if (!currentProfile) {
      return sendError(res, "Student profile not found", 404);
    }

    const resume = req.body?.resume;

    if (!resume || typeof resume !== "object" || !String(resume.dataUrl || "").trim()) {
      return sendError(res, "Resume file is required for autofill", 400);
    }

    const { mergedProfile, usedAI, resumeText, extractedProfile } = await parseResumeForStudentProfile({
      resume,
      currentProfile,
    });

    mergedProfile.email = currentProfile.email || req.user.email;

    const studentProfile = await StudentProfile.findOneAndUpdate(
      { user: req.user.id },
      buildStudentProfilePayload(mergedProfile),
      { new: true, runValidators: true }
    );

    await syncUserFromStudentProfile(req.user.id, studentProfile);

    sendSuccess(
      res,
      {
        studentProfile,
        autofill: {
          usedAI,
          extractedSkills: extractedProfile.skills.length,
          extractedProjects: extractedProfile.projects.length,
          extractedExperiences: extractedProfile.experiences.length,
          resumeTextLength: resumeText.length,
        },
      },
      "Student profile autofilled from resume successfully"
    );
  } catch (error) {
    if (error.status) {
      return sendError(res, error.message, error.status);
    }

    next(error);
  }
};

export const getStudentProfileById = async (req, res, next) => {
  try {
    const studentProfile = await StudentProfile.findById(req.params.id).populate("user", "role");

    if (!studentProfile) {
      return sendError(res, "Student profile not found", 404);
    }

    if (
      req.user?.role === "student" &&
      String(studentProfile.user?._id || studentProfile.user) !== String(req.user.id)
    ) {
      return sendError(res, "Students can only view their own profile", 403);
    }

    sendSuccess(res, { studentProfile }, "Student profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};
