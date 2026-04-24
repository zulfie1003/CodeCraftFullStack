import StudentProfile from '../models/StudentProfile.model.js';
import User from '../models/User.model.js';
import {
  computeMatchBreakdown,
  extractSkillsFromText,
  normalizeExperienceText,
  normalizeSkills,
} from '../utils/jobMatching.js';

const toPlainObject = (value) => (typeof value?.toObject === 'function' ? value.toObject() : value);

export const resolveUserJobProfile = async (userId) => {
  const [user, studentProfile] = await Promise.all([
    User.findById(userId).select('skills bookmarkedJobs resume role'),
    StudentProfile.findOne({ user: userId }).select('skills resume experienceLevel'),
  ]);

  const userSkills = normalizeSkills([
    ...(Array.isArray(user?.skills) ? user.skills : []),
    ...(Array.isArray(studentProfile?.skills) ? studentProfile.skills : []),
  ]);

  return {
    user,
    studentProfile,
    userSkills,
    bookmarkSet: new Set((user?.bookmarkedJobs || []).map((jobId) => String(jobId))),
  };
};

export const getJobSkills = (job = {}) => {
  const explicitSkills = normalizeSkills(job.skills);

  if (explicitSkills.length) {
    return explicitSkills;
  }

  return extractSkillsFromText(
    [job.title, job.description, ...(Array.isArray(job.requirements) ? job.requirements : [])]
      .filter(Boolean)
      .join(' ')
  );
};

export const serializeRecommendedJob = (job, userSkills = [], bookmarkSet = new Set()) => {
  const plainJob = toPlainObject(job);
  const normalizedJobSkills = getJobSkills(plainJob);
  const match = computeMatchBreakdown(userSkills, normalizedJobSkills);

  return {
    ...plainJob,
    skills: normalizedJobSkills,
    experience: normalizeExperienceText(plainJob.experience, plainJob.experienceLevel),
    bookmarked: bookmarkSet.has(String(plainJob._id)),
    ...match,
  };
};
