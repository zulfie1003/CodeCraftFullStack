import StudentProfile from '../models/StudentProfile.model.js';
import User from '../models/User.model.js';
import {
  computeWeightedMatchBreakdown,
  extractSkillsFromText,
  inferExperienceRequirement,
  normalizeExperienceText,
  normalizeSkills,
} from '../utils/jobMatching.js';
import { isCareerPortalLink } from '../utils/jobLinks.js';

const toPlainObject = (value) => (typeof value?.toObject === 'function' ? value.toObject() : value);

export const resolveUserJobProfile = async (userId) => {
  const [user, studentProfile] = await Promise.all([
    User.findById(userId).select('skills bookmarkedJobs resume role location'),
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
    role: user?.role || '',
    location: user?.location || '',
    userExperienceLevel: studentProfile?.experienceLevel || '',
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

export const serializeRecommendedJob = (
  job,
  userSkills = [],
  bookmarkSet = new Set(),
  userExperienceLevel = ''
) => {
  const plainJob = toPlainObject(job);
  const normalizedJobSkills = getJobSkills(plainJob);
  const inferredExperience = inferExperienceRequirement(
    plainJob.description,
    plainJob.requirements,
    plainJob.title
  );
  const experience =
    inferredExperience.experience ||
    normalizeExperienceText(plainJob.experience, plainJob.experienceLevel);
  const requiredExperienceLevel = inferredExperience.experienceLevel || plainJob.experienceLevel;
  const match = computeWeightedMatchBreakdown(userSkills, normalizedJobSkills, {
    userExperienceLevel,
    requiredExperienceLevel,
  });

  return {
    ...plainJob,
    isDirectCompanyApply:
      plainJob.isDirectCompanyApply === true || isCareerPortalLink(plainJob.applyUrl),
    skills: normalizedJobSkills,
    experience,
    experienceLevel: requiredExperienceLevel,
    userExperienceLevel,
    bookmarked: bookmarkSet.has(String(plainJob._id)),
    ...match,
  };
};
