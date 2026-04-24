const STORAGE_KEY = "studentProfile";
export const STUDENT_PROFILE_UPDATED_EVENT = "student-profile-updated";

const readExistingProfile = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

const extractUsername = (value = "") => {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return "";
  }

  try {
    const parsedUrl = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const segments = parsedUrl.pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || "";
  } catch {
    return trimmed.replace(/\/+$/, "").split("/").pop() || trimmed;
  }
};

const readTextValue = (value, fallback = "") =>
  value === undefined || value === null ? fallback : String(value);

export const syncStudentProfileCache = (studentProfile) => {
  if (!studentProfile || typeof window === "undefined") {
    return;
  }

  const existingProfile = readExistingProfile();
  const githubUrl = readTextValue(
    studentProfile.githubUrl,
    existingProfile.githubUrl || existingProfile.github || ""
  );
  const leetcodeUrl = readTextValue(
    studentProfile.leetcodeUrl,
    existingProfile.leetcodeUrl || existingProfile.leetcode || ""
  );
  const gfgUrl = readTextValue(studentProfile.gfgUrl, existingProfile.gfgUrl || existingProfile.gfg || "");
  const linkedinUrl = readTextValue(
    studentProfile.linkedinUrl,
    existingProfile.linkedinUrl || existingProfile.linkedin || ""
  );
  const portfolioUrl = readTextValue(
    studentProfile.portfolioUrl,
    existingProfile.portfolioUrl || existingProfile.website || ""
  );
  const nextProfile = {
    ...existingProfile,
    name: readTextValue(studentProfile.name, existingProfile.name || ""),
    email: readTextValue(studentProfile.email, existingProfile.email || ""),
    github: githubUrl,
    githubUrl,
    githubUsername: extractUsername(githubUrl),
    leetcode: leetcodeUrl,
    leetcodeUrl,
    leetcodeUsername: extractUsername(leetcodeUrl),
    gfg: gfgUrl,
    gfgUrl,
    gfgUsername: extractUsername(gfgUrl),
    linkedin: linkedinUrl,
    linkedinUrl,
    website: portfolioUrl,
    portfolioUrl,
    phone: readTextValue(studentProfile.phone, existingProfile.phone || ""),
    college: readTextValue(studentProfile.college, existingProfile.college || ""),
    degree: readTextValue(studentProfile.degree, existingProfile.degree || ""),
    year: readTextValue(studentProfile.year, existingProfile.year || ""),
    experienceLevel: readTextValue(
      studentProfile.experienceLevel,
      existingProfile.experienceLevel || "fresher"
    ),
    skills: Array.isArray(studentProfile.skills)
      ? studentProfile.skills.map((skill, index) => ({
          id: `${skill}-${index}`,
          name: skill,
          level: 75,
        }))
      : [],
    projects: Array.isArray(studentProfile.projects)
      ? studentProfile.projects.map((project, index) => ({
          id: project._id || `${project.title}-${index}`,
          title: project.title,
          desc: project.description,
          link: project.link,
          tags: [],
        }))
      : [],
    experiences: Array.isArray(studentProfile.experiences)
      ? studentProfile.experiences.map((experience, index) => ({
          id: experience._id || `${experience.title}-${index}`,
          title: experience.title,
          company: experience.company,
          type: experience.type,
          duration: experience.duration,
          location: experience.location,
          description: experience.description,
          link: experience.link,
        }))
      : [],
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProfile));
  window.dispatchEvent(
    new CustomEvent(STUDENT_PROFILE_UPDATED_EVENT, {
      detail: nextProfile,
    })
  );

  return nextProfile;
};
