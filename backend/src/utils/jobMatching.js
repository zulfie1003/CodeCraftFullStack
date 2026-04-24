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
  vue: "Vue.js",
  angular: "Angular",
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
  nosql: "NoSQL",
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
  c: "C",
  "c++": "C++",
  cpp: "C++",
  "c#": "C#",
  golang: "Go",
  go: "Go",
  php: "PHP",
  laravel: "Laravel",
  html: "HTML",
  css: "CSS",
  sass: "Sass",
  tailwind: "Tailwind CSS",
  bootstrap: "Bootstrap",
  figma: "Figma",
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
  selenium: "Selenium",
  microservices: "Microservices",
  "system design": "System Design",
  systemdesign: "System Design",
  redis: "Redis",
  kafka: "Kafka",
  rabbitmq: "RabbitMQ",
  linux: "Linux",
  api: "API Integration",
  apis: "API Integration",
  ai: "AI Engineering",
  llm: "LLMs",
  openai: "OpenAI API",
  promptengineering: "Prompt Engineering",
  "prompt engineering": "Prompt Engineering",
};

const EXPERIENCE_LABELS = {
  fresher: "0-1 years",
  junior: "1-3 years",
  mid: "3-5 years",
  senior: "5+ years",
};

export const MAX_JOB_DESCRIPTION_CHARS = 4000;

const KNOWN_SKILLS = Object.entries(SKILL_ALIASES).map(([keyword, canonical]) => ({
  keyword,
  canonical,
}));

const AMBIGUOUS_EXTRACTION_KEYWORDS = new Set(["api", "apis", "c"]);

const SKILL_EXTRACTION_KEYWORDS = KNOWN_SKILLS
  .filter(({ keyword }) => !AMBIGUOUS_EXTRACTION_KEYWORDS.has(keyword))
  .sort((left, right) => right.keyword.length - left.keyword.length);

const unique = (items = []) => [...new Set(items)];

const escapeRegExp = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toTitleCase = (value = "") =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

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

export const normalizeSkillToken = (value = "") =>
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

  if (SKILL_ALIASES[normalized]) {
    return SKILL_ALIASES[normalized];
  }

  return toTitleCase(normalized);
};

export const normalizeSkills = (value) =>
  unique(normalizeStringArray(value).map(canonicalizeSkill).filter(Boolean));

export const normalizeExperienceLevel = (value = "") => {
  const normalized = String(value || "").trim().toLowerCase();

  if (EXPERIENCE_LABELS[normalized]) {
    return normalized;
  }

  return "";
};

export const normalizeExperienceText = (value = "", fallbackLevel = "") => {
  const explicitValue = String(value || "").trim();

  if (explicitValue) {
    return explicitValue;
  }

  const normalizedLevel = normalizeExperienceLevel(fallbackLevel);
  return EXPERIENCE_LABELS[normalizedLevel] || "Not specified";
};

export const shortenText = (value = "", maxLength = 280) => {
  const cleaned = String(value || "").replace(/\s+/g, " ").trim();

  if (!cleaned) {
    return "";
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trim()}...`;
};

export const normalizeJobDescription = (
  value = "",
  maxLength = MAX_JOB_DESCRIPTION_CHARS
) => {
  const cleaned = String(value || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!cleaned) {
    return "";
  }

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 1).trim()}...`;
};

export const buildJobDedupeKey = ({ title = "", company = "", location = "" } = {}) =>
  [title, company, location]
    .map((item) =>
      String(item || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .join("::");

export const computeMatchBreakdown = (userSkills = [], jobSkills = []) => {
  const normalizedUserSkills = normalizeSkills(userSkills);
  const normalizedJobSkills = normalizeSkills(jobSkills);
  const userSkillSet = new Set(normalizedUserSkills.map(normalizeSkillToken));

  const matchedSkills = normalizedJobSkills.filter((skill) =>
    userSkillSet.has(normalizeSkillToken(skill))
  );
  const missingSkills = normalizedJobSkills.filter(
    (skill) => !userSkillSet.has(normalizeSkillToken(skill))
  );

  const matchScore = normalizedJobSkills.length
    ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100)
    : 0;

  return {
    matchScore,
    matchedSkills,
    missingSkills,
  };
};

export const extractSkillsFromText = (input = "") => {
  const haystack = ` ${normalizeSkillToken(input)} `;

  if (!haystack.trim()) {
    return [];
  }

  const detected = SKILL_EXTRACTION_KEYWORDS.filter(({ keyword }) =>
    new RegExp(`(^|\\s)${escapeRegExp(keyword)}(?=\\s|$)`, "i").test(haystack)
  ).map(({ canonical }) => canonical);

  return unique(detected);
};

const isMostlyReadableText = (value = "") => {
  if (!value) {
    return false;
  }

  const printableCharacters = value.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "").length;
  return printableCharacters / value.length > 0.75;
};

export const decodeResumeDataUrl = (dataUrl = "") => {
  const match = String(dataUrl || "").match(/^data:([^;,]+)?(;base64)?,(.*)$/);

  if (!match) {
    return "";
  }

  const [, mimeType = "", base64Flag = "", payload = ""] = match;

  if (mimeType && !mimeType.startsWith("text/")) {
    return "";
  }

  const decodedValue = base64Flag
    ? Buffer.from(payload, "base64").toString("utf8")
    : decodeURIComponent(payload);

  return isMostlyReadableText(decodedValue) ? decodedValue : "";
};

export const isValidHttpUrl = (value = "") => {
  try {
    const target = new URL(value);
    return ["http:", "https:"].includes(target.protocol);
  } catch {
    return false;
  }
};
