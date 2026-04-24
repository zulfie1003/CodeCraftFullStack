import StudentProfile from "../models/StudentProfile.model.js";
import User from "../models/User.model.js";

export const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

export const normalizeProjects = (projects = []) =>
  Array.isArray(projects)
    ? projects
        .map((project) => ({
          title: String(project?.title || "").trim(),
          description: String(project?.description || project?.desc || "").trim(),
          link: String(project?.link || "").trim(),
        }))
        .filter((project) => project.title && project.description)
    : [];

export const normalizeExperiences = (experiences = []) =>
  Array.isArray(experiences)
    ? experiences
        .map((experience) => ({
          title: String(experience?.title || experience?.role || "").trim(),
          company: String(experience?.company || experience?.organization || "").trim(),
          type: String(experience?.type || "other")
            .trim()
            .toLowerCase(),
          duration: String(experience?.duration || "").trim(),
          location: String(experience?.location || "").trim(),
          description: String(experience?.description || experience?.summary || "").trim(),
          link: String(experience?.link || "").trim(),
        }))
        .filter((experience) => experience.title)
    : [];

export const ensureStudentProfile = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    return null;
  }

  let studentProfile = await StudentProfile.findOne({ user: userId });

  if (!studentProfile) {
    studentProfile = await StudentProfile.create({
      user: user._id,
      name: user.name,
      email: user.email,
      skills: Array.isArray(user.skills) ? user.skills : [],
      githubUrl: user.github || "",
      leetcodeUrl: user.leetcode || "",
      gfgUrl: user.gfg || "",
      linkedinUrl: user.linkedin || "",
      portfolioUrl: user.portfolio || "",
    });
  }

  return studentProfile;
};
