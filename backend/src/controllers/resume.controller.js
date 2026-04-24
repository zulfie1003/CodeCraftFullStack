import StudentProfile from '../models/StudentProfile.model.js';
import User from '../models/User.model.js';
import {
  decodeResumeDataUrl,
  extractSkillsFromText,
  normalizeSkills,
} from '../utils/jobMatching.js';
import { sendError, sendSuccess } from '../utils/response.js';

const MAX_RESUME_TEXT_LENGTH = 50000;

const readStoredResumeText = async (userId) => {
  const [user, studentProfile] = await Promise.all([
    User.findById(userId).select('resume'),
    StudentProfile.findOne({ user: userId }).select('resume'),
  ]);

  const candidates = [
    user?.resume?.text,
    decodeResumeDataUrl(user?.resume?.dataUrl || ''),
    studentProfile?.resume?.text,
    decodeResumeDataUrl(studentProfile?.resume?.dataUrl || ''),
  ];

  return candidates.find((candidate) => String(candidate || '').trim()) || '';
};

const saveExtractedSkillsToProfiles = async (userId, extractedSkills = []) => {
  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  const mergedSkills = normalizeSkills([...(user.skills || []), ...extractedSkills]);

  await User.findByIdAndUpdate(userId, {
    $set: { skills: mergedSkills },
  });

  await StudentProfile.findOneAndUpdate(
    { user: userId },
    { $set: { skills: mergedSkills } },
    { new: true }
  );

  return mergedSkills;
};

export const extractResumeSkills = async (req, res, next) => {
  try {
    const requestedText = String(req.body.resumeText || req.body.text || '').trim();
    const requestedDataUrl = String(req.body.resumeDataUrl || req.body.dataUrl || '').trim();
    const fallbackText = requestedDataUrl ? decodeResumeDataUrl(requestedDataUrl) : '';
    const storedResumeText = requestedText || fallbackText ? '' : await readStoredResumeText(req.user.id);
    const resumeText = requestedText || fallbackText || storedResumeText;

    if (!resumeText) {
      return sendError(
        res,
        'Provide resumeText or a text-based resumeDataUrl for keyword extraction',
        400
      );
    }

    if (resumeText.length > MAX_RESUME_TEXT_LENGTH) {
      return sendError(res, 'Resume text is too large for basic keyword extraction', 413);
    }

    const extractedSkills = extractSkillsFromText(resumeText);
    const mergedSkills = req.body.saveToProfile
      ? await saveExtractedSkillsToProfiles(req.user.id, extractedSkills)
      : null;

    sendSuccess(res, {
      extractedSkills,
      totalExtracted: extractedSkills.length,
      savedSkills: mergedSkills,
    });
  } catch (error) {
    next(error);
  }
};
