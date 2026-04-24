import StudentProfile from '../models/StudentProfile.model.js';
import User from '../models/User.model.js';
import { normalizeSkills } from '../utils/jobMatching.js';
import { sendError, sendSuccess } from '../utils/response.js';
import { ensureStudentProfile } from '../utils/studentProfile.js';

const hasOwn = (payload, key) => Object.prototype.hasOwnProperty.call(payload, key);

const hasResumeContent = (resume = {}) =>
  Boolean(resume?.fileName || resume?.dataUrl || resume?.text);

const buildResumePayload = (payload = {}, currentResume = {}) => {
  const nextResume = payload.resume && typeof payload.resume === 'object' ? payload.resume : {};

  const fileName = hasOwn(payload, 'resumeFileName') ? payload.resumeFileName : nextResume.fileName;
  const dataUrl = hasOwn(payload, 'resumeDataUrl') ? payload.resumeDataUrl : nextResume.dataUrl;
  const text = hasOwn(payload, 'resumeText') ? payload.resumeText : nextResume.text;

  return {
    fileName: String(fileName ?? currentResume.fileName ?? '').trim(),
    dataUrl: String(dataUrl ?? currentResume.dataUrl ?? '').trim(),
    text: String(text ?? currentResume.text ?? '').trim(),
    uploadedAt:
      fileName || dataUrl || text
        ? new Date()
        : currentResume.uploadedAt,
  };
};

const buildUserProfilePayload = (payload = {}, currentUser = {}) => {
  const updates = {};

  if (hasOwn(payload, 'name')) updates.name = String(payload.name || '').trim();
  if (hasOwn(payload, 'email')) updates.email = String(payload.email || '').trim().toLowerCase();
  if (hasOwn(payload, 'skills')) updates.skills = normalizeSkills(payload.skills);
  if (hasOwn(payload, 'bio')) updates.bio = String(payload.bio || '').trim();
  if (hasOwn(payload, 'avatar')) updates.avatar = String(payload.avatar || '').trim();
  if (hasOwn(payload, 'github')) updates.github = String(payload.github || '').trim();
  if (hasOwn(payload, 'linkedin')) updates.linkedin = String(payload.linkedin || '').trim();
  if (hasOwn(payload, 'portfolio')) updates.portfolio = String(payload.portfolio || '').trim();
  if (hasOwn(payload, 'phone')) updates.phone = String(payload.phone || '').trim();
  if (hasOwn(payload, 'location')) updates.location = String(payload.location || '').trim();
  if (hasOwn(payload, 'website')) updates.website = String(payload.website || '').trim();

  if (
    hasOwn(payload, 'resume') ||
    hasOwn(payload, 'resumeText') ||
    hasOwn(payload, 'resumeDataUrl') ||
    hasOwn(payload, 'resumeFileName')
  ) {
    updates.resume = buildResumePayload(payload, currentUser.resume || {});
  }

  return updates;
};

const syncStudentProfileFromUser = async (user) => {
  if (!user || user.role !== 'student') {
    return;
  }

  await ensureStudentProfile(user._id);

  const baseUpdate = {
    name: user.name,
    email: user.email,
    skills: Array.isArray(user.skills) ? user.skills : [],
    githubUrl: user.github || '',
    linkedinUrl: user.linkedin || '',
    portfolioUrl: user.portfolio || '',
  };

  if (hasResumeContent(user.resume)) {
    baseUpdate.resume = {
      fileName: user.resume.fileName || '',
      dataUrl: user.resume.dataUrl || '',
      text: user.resume.text || '',
      uploadedAt: user.resume.uploadedAt,
    };
  }

  await StudentProfile.findOneAndUpdate(
    { user: user._id },
    baseUpdate,
    { new: true, runValidators: true }
  );
};

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return sendError(res, 'User not found', 404);
    }

    const updates = buildUserProfilePayload(req.body, currentUser);

    if (updates.email && updates.email !== currentUser.email) {
      const existingUser = await User.findOne({
        email: updates.email,
        _id: { $ne: req.user.id },
      });

      if (existingUser) {
        return sendError(res, 'Email already registered with another account', 400);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    );

    await syncStudentProfileFromUser(user);

    sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const saveProfile = updateProfile;

export const getPublicUserStats = async (req, res, next) => {
  try {
    const [result] = await User.aggregate([
      {
        $match: {
          role: 'student',
          email: { $type: 'string', $ne: '' },
        },
      },
      {
        $group: {
          _id: { $toLower: '$email' },
        },
      },
      {
        $count: 'learners',
      },
    ]);

    sendSuccess(
      res,
      {
        learners: result?.learners || 0,
      },
      'Public user stats fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
};
