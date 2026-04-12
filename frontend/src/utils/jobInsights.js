const SKILL_ALIASES = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  react: "React",
  reactjs: "React",
  "react.js": "React",
  redux: "Redux",
  next: "Next.js",
  nextjs: "Next.js",
  "next.js": "Next.js",
  node: "Node.js",
  nodejs: "Node.js",
  "node.js": "Node.js",
  express: "Express",
  expressjs: "Express",
  "express.js": "Express",
  mongodb: "MongoDB",
  mongo: "MongoDB",
  mysql: "MySQL",
  postgresql: "PostgreSQL",
  postgres: "PostgreSQL",
  sql: "SQL",
  aws: "AWS",
  azure: "Azure",
  gcp: "Google Cloud",
  docker: "Docker",
  kubernetes: "Kubernetes",
  k8s: "Kubernetes",
  terraform: "Terraform",
  python: "Python",
  java: "Java",
  spring: "Spring Boot",
  springboot: "Spring Boot",
  "spring boot": "Spring Boot",
  oop: "OOPs",
  oops: "OOPs",
  dsa: "DSA",
  "data structures": "DSA",
  "data structures and algorithms": "DSA",
  git: "Git",
  github: "GitHub",
  rest: "REST API",
  restapi: "REST API",
  "rest api": "REST API",
  graphql: "GraphQL",
  testing: "Testing",
  jest: "Jest",
  cypress: "Cypress",
  microservices: "Microservices",
  "system design": "System Design",
  systemdesign: "System Design",
  redis: "Redis",
  ai: "AI Engineering",
  llm: "LLMs",
  openai: "OpenAI API",
};

const KNOWN_SKILL_KEYWORDS = Object.entries(SKILL_ALIASES).map(([keyword, canonical]) => ({
  keyword,
  canonical,
}));

const SKILL_RESOURCES = {
  "JavaScript": {
    docsLabel: "MDN",
    docsUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=javascript+tutorial+2025",
  },
  "TypeScript": {
    docsLabel: "TypeScript Docs",
    docsUrl: "https://www.typescriptlang.org/docs/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=typescript+tutorial+2025",
  },
  React: {
    docsLabel: "React Docs",
    docsUrl: "https://react.dev/learn",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=react+tutorial+2025",
  },
  "Next.js": {
    docsLabel: "Next.js Docs",
    docsUrl: "https://nextjs.org/docs",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=next.js+tutorial+2025",
  },
  "Node.js": {
    docsLabel: "Node.js Learn",
    docsUrl: "https://nodejs.org/en/learn",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=node.js+tutorial+2025",
  },
  Express: {
    docsLabel: "Express Docs",
    docsUrl: "https://expressjs.com/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=express+js+tutorial+2025",
  },
  MongoDB: {
    docsLabel: "MongoDB Docs",
    docsUrl: "https://www.mongodb.com/docs/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=mongodb+tutorial+2025",
  },
  SQL: {
    docsLabel: "SQLBolt",
    docsUrl: "https://sqlbolt.com/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=sql+tutorial+2025",
  },
  PostgreSQL: {
    docsLabel: "Postgres Docs",
    docsUrl: "https://www.postgresql.org/docs/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=postgresql+tutorial+2025",
  },
  MySQL: {
    docsLabel: "MySQL Docs",
    docsUrl: "https://dev.mysql.com/doc/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=mysql+tutorial+2025",
  },
  AWS: {
    docsLabel: "AWS Skill Builder",
    docsUrl: "https://skillbuilder.aws/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=aws+for+developers+2025",
  },
  Azure: {
    docsLabel: "Microsoft Learn",
    docsUrl: "https://learn.microsoft.com/azure/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=azure+tutorial+2025",
  },
  "Google Cloud": {
    docsLabel: "Google Cloud Skills",
    docsUrl: "https://www.cloudskillsboost.google/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=google+cloud+tutorial+2025",
  },
  Docker: {
    docsLabel: "Docker Docs",
    docsUrl: "https://docs.docker.com/get-started/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=docker+tutorial+2025",
  },
  Kubernetes: {
    docsLabel: "Kubernetes Docs",
    docsUrl: "https://kubernetes.io/docs/home/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=kubernetes+tutorial+2025",
  },
  Terraform: {
    docsLabel: "HashiCorp Docs",
    docsUrl: "https://developer.hashicorp.com/terraform/docs",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=terraform+tutorial+2025",
  },
  Python: {
    docsLabel: "Python Docs",
    docsUrl: "https://docs.python.org/3/tutorial/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=python+tutorial+2025",
  },
  Java: {
    docsLabel: "Dev Java",
    docsUrl: "https://dev.java/learn/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=java+tutorial+2025",
  },
  "Spring Boot": {
    docsLabel: "Spring Guides",
    docsUrl: "https://spring.io/guides",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=spring+boot+tutorial+2025",
  },
  DSA: {
    docsLabel: "GeeksforGeeks",
    docsUrl: "https://www.geeksforgeeks.org/learn-data-structures-and-algorithms-dsa-tutorial/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=data+structures+and+algorithms+tutorial+2025",
  },
  "System Design": {
    docsLabel: "roadmap.sh",
    docsUrl: "https://roadmap.sh/system-design",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=system+design+tutorial+2025",
  },
  Microservices: {
    docsLabel: "microservices.io",
    docsUrl: "https://microservices.io/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=microservices+tutorial+2025",
  },
  Testing: {
    docsLabel: "Testing Library",
    docsUrl: "https://testing-library.com/docs/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=software+testing+tutorial+2025",
  },
  Redis: {
    docsLabel: "Redis Learn",
    docsUrl: "https://redis.io/learn/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=redis+tutorial+2025",
  },
  "REST API": {
    docsLabel: "MDN APIs",
    docsUrl: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/First_steps",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=rest+api+tutorial+2025",
  },
  GraphQL: {
    docsLabel: "GraphQL Learn",
    docsUrl: "https://graphql.org/learn/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=graphql+tutorial+2025",
  },
  "GitHub": {
    docsLabel: "GitHub Docs",
    docsUrl: "https://docs.github.com/",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=github+tutorial+2025",
  },
  Git: {
    docsLabel: "Git Book",
    docsUrl: "https://git-scm.com/book/en/v2",
    videoLabel: "YouTube",
    videoUrl: "https://www.youtube.com/results?search_query=git+tutorial+2025",
  },
};

const normalizeSkillToken = (value = "") =>
  value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const canonicalizeSkill = (value = "") => {
  const normalized = normalizeSkillToken(value);

  if (!normalized) {
    return "";
  }

  return SKILL_ALIASES[normalized] || value.trim();
};

export const extractPortfolioSkills = () => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const profile = JSON.parse(localStorage.getItem("studentProfile") || "{}");
    const rawSkills = Array.isArray(profile?.skills) ? profile.skills : [];

    return rawSkills
      .map((skill) => {
        if (typeof skill === "string") {
          return canonicalizeSkill(skill);
        }

        return canonicalizeSkill(skill?.name || "");
      })
      .filter(Boolean)
      .filter((skill, index, list) => list.indexOf(skill) === index);
  } catch (error) {
    console.error("Unable to read studentProfile skills:", error);
    return [];
  }
};

export const mergeSkills = (...skillGroups) =>
  [...new Set(skillGroups.flat().map((skill) => canonicalizeSkill(skill)).filter(Boolean))];

export const inferSkillsFromJob = (job) => {
  const explicitSkills = Array.isArray(job?.skills)
    ? job.skills.map((skill) => canonicalizeSkill(skill)).filter(Boolean)
    : [];

  if (explicitSkills.length > 0) {
    return [...new Set(explicitSkills)];
  }

  const haystack = normalizeSkillToken(
    [job?.title, job?.description, ...(job?.requirements || [])].filter(Boolean).join(" ")
  );

  const inferredSkills = KNOWN_SKILL_KEYWORDS.filter(({ keyword }) => haystack.includes(keyword)).map(
    ({ canonical }) => canonical
  );

  return [...new Set(inferredSkills)];
};

export const formatSalary = (job) => {
  if (job?.salaryText) {
    return job.salaryText;
  }

  if (typeof job?.salary === "string" && job.salary.trim()) {
    return job.salary.trim();
  }

  const salary = job?.salary;

  if (!salary || (!salary.min && !salary.max)) {
    return "Not disclosed";
  }

  const currency = salary.currency || "USD";

  if (salary.min && salary.max) {
    return `${currency} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
  }

  if (salary.max) {
    return `Up to ${currency} ${salary.max.toLocaleString()}`;
  }

  return `${currency} ${salary.min.toLocaleString()}+`;
};

export const formatRelativeDate = (value) => {
  if (!value) {
    return "Recently posted";
  }

  const targetDate = new Date(value);

  if (Number.isNaN(targetDate.getTime())) {
    return "Recently posted";
  }

  const diffInMs = Date.now() - targetDate.getTime();
  const diffInDays = Math.max(0, Math.floor(diffInMs / (1000 * 60 * 60 * 24)));

  if (diffInDays === 0) {
    return "Today";
  }

  if (diffInDays === 1) {
    return "1 day ago";
  }

  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);

  if (diffInWeeks === 1) {
    return "1 week ago";
  }

  return `${diffInWeeks} weeks ago`;
};

export const getCompanyInitials = (company = "") =>
  company
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "CO";

export const getLearningResource = (skill) => {
  const canonicalSkill = canonicalizeSkill(skill);
  const mapped = SKILL_RESOURCES[canonicalSkill];

  if (mapped) {
    return {
      skill: canonicalSkill,
      ...mapped,
    };
  }

  const searchQuery = encodeURIComponent(`${canonicalSkill} tutorial 2025`);

  return {
    skill: canonicalSkill,
    docsLabel: "Search Docs",
    docsUrl: `https://www.google.com/search?q=${encodeURIComponent(`${canonicalSkill} official docs`)}`,
    videoLabel: "YouTube",
    videoUrl: `https://www.youtube.com/results?search_query=${searchQuery}`,
  };
};

export const buildMatchedJob = (job, studentSkills = []) => {
  const normalizedStudentSkills = mergeSkills(studentSkills);
  const requiredSkills = inferSkillsFromJob(job);
  const studentSkillSet = new Set(normalizedStudentSkills.map((skill) => normalizeSkillToken(skill)));
  const matchedSkills = requiredSkills.filter((skill) =>
    studentSkillSet.has(normalizeSkillToken(skill))
  );
  const missingSkills = requiredSkills.filter(
    (skill) => !studentSkillSet.has(normalizeSkillToken(skill))
  );

  const matchPercentage = requiredSkills.length
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  return {
    ...job,
    displaySkills: requiredSkills,
    matchedSkills,
    missingSkills,
    matchPercentage,
    learningResources: missingSkills.slice(0, 3).map(getLearningResource),
    salaryLabel: formatSalary(job),
    postedLabel: formatRelativeDate(job?.createdAt),
    remoteLabel: job?.remote ? "Remote" : job?.location || "Location not specified",
  };
};

export const buildMatchedJobs = (jobs, studentSkills = []) =>
  jobs
    .map((job) => buildMatchedJob(job, studentSkills))
    .sort((left, right) => {
      if (right.matchPercentage !== left.matchPercentage) {
        return right.matchPercentage - left.matchPercentage;
      }

      return right.matchedSkills.length - left.matchedSkills.length;
    });

export const buildLearningPriorities = (jobs) => {
  const gapMap = new Map();

  jobs.forEach((job) => {
    job.missingSkills.forEach((skill) => {
      gapMap.set(skill, (gapMap.get(skill) || 0) + 1);
    });
  });

  return [...gapMap.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([skill, count]) => ({
      skill,
      count,
      resource: getLearningResource(skill),
    }));
};
