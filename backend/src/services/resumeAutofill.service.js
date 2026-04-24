import Groq from "groq-sdk";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import {
  extractSkillsFromText,
  isValidHttpUrl,
  normalizeExperienceLevel,
  normalizeSkills,
  normalizeStringArray,
} from "../utils/jobMatching.js";
import { normalizeExperiences, normalizeProjects } from "../utils/studentProfile.js";

const MAX_RESUME_BYTES = 6 * 1024 * 1024;
const MAX_PROMPT_CHARS = 18000;

const TEXT_MIME_PREFIX = "text/";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const DOC_MIME = "application/msword";
const PDF_MIME = "application/pdf";

const SOCIAL_DOMAINS = {
  github: ["github.com"],
  linkedin: ["linkedin.com"],
  leetcode: ["leetcode.com"],
  gfg: ["geeksforgeeks.org"],
};

const readString = (value = "") => String(value ?? "").trim();
const unique = (items = []) => [...new Set(items.filter(Boolean))];

const normalizeWhitespace = (value = "") =>
  readString(value)
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[ \u00A0]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const stripCodeFence = (value = "") =>
  value.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();

const getGroqClient = () => {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return new Groq({ apiKey });
};

const getGroqModel = () => process.env.GROQ_MODEL?.trim() || "llama-3.3-70b-versatile";

const parseDataUrl = (dataUrl = "") => {
  const match = String(dataUrl || "").match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);

  if (!match) {
    return null;
  }

  const [, mimeType = "", base64Flag = "", payload = ""] = match;
  const buffer = base64Flag
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf8");

  return {
    mimeType,
    buffer,
  };
};

const toPublicUrl = (value = "") => {
  const trimmed = readString(value).replace(/[),.;]+$/, "");

  if (!trimmed) {
    return "";
  }

  if (isValidHttpUrl(trimmed)) {
    return trimmed;
  }

  if (/^(www\.|github\.com|linkedin\.com|leetcode\.com|geeksforgeeks\.org)/i.test(trimmed)) {
    const withProtocol = `https://${trimmed}`;
    return isValidHttpUrl(withProtocol) ? withProtocol : "";
  }

  if (/^(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/\S*)?$/i.test(trimmed) && !trimmed.includes("@")) {
    const withProtocol = `https://${trimmed}`;
    return isValidHttpUrl(withProtocol) ? withProtocol : "";
  }

  return "";
};

const getHeaderText = (text = "") =>
  normalizeWhitespace(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 12)
    .join("\n");

const readLabeledValue = (text = "", patterns = []) => {
  const lines = normalizeWhitespace(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    for (const pattern of patterns) {
      const match = line.match(pattern);

      if (match?.[1]) {
        return readString(match[1]);
      }
    }
  }

  return "";
};

const isSocialUrl = (url = "") => {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return Object.values(SOCIAL_DOMAINS).some((domains) => domains.includes(hostname));
  } catch {
    return false;
  }
};

const normalizeProfileReference = (value = "", platform = "") => {
  const trimmed = readString(value)
    .replace(/^[|:•\-\s]+/, "")
    .replace(/[),.;]+$/, "");

  if (!trimmed) {
    return "";
  }

  const publicUrl = toPublicUrl(trimmed);

  if (publicUrl) {
    return platform && platform !== "portfolio"
      ? normalizeSocialProfileUrl(publicUrl, platform)
      : publicUrl;
  }

  const normalizedHandle = trimmed
    .replace(/^@/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "")
    .trim();

  if (!normalizedHandle || /\s/.test(normalizedHandle)) {
    return platform === "portfolio" ? toPublicUrl(normalizedHandle) : "";
  }

  if (platform === "github" && /^[a-z\d](?:[a-z\d-]{0,38})$/i.test(normalizedHandle)) {
    return `https://github.com/${normalizedHandle}`;
  }

  if (platform === "leetcode") {
    const leetcodeHandle = normalizedHandle
      .replace(/^(?:u|profile)\//i, "")
      .replace(/\/.*$/, "");

    if (/^[a-z0-9_.-]{1,100}$/i.test(leetcodeHandle)) {
      return `https://leetcode.com/u/${leetcodeHandle}/`;
    }
  }

  if (platform === "gfg") {
    const gfgHandle = normalizedHandle
      .replace(/^user\//i, "")
      .replace(/\/.*$/, "");

    if (/^[a-z0-9_.-]{1,100}$/i.test(gfgHandle)) {
      return `https://www.geeksforgeeks.org/user/${gfgHandle}/`;
    }
  }

  if (platform === "linkedin") {
    const linkedinPath = normalizedHandle
      .replace(/^www\.linkedin\.com\//i, "")
      .replace(/^linkedin\.com\//i, "");

    if (/^(?:in|company|school)\/[a-z0-9-_%]+$/i.test(linkedinPath)) {
      return normalizeSocialProfileUrl(`https://linkedin.com/${linkedinPath}`, "linkedin");
    }
  }

  return platform === "portfolio" ? toPublicUrl(trimmed) : "";
};

const classifyExperienceType = (value = "") => {
  const normalized = readString(value).toLowerCase();

  if (!normalized) return "other";
  if (normalized.includes("intern")) return "internship";
  if (normalized.includes("full")) return "fulltime";
  if (normalized.includes("part")) return "parttime";
  if (normalized.includes("contract")) return "contract";
  if (normalized.includes("freelance")) return "freelance";
  if (normalized.includes("lead")) return "leadership";

  return "other";
};

const normalizeSocialProfileUrl = (url = "", platform = "") => {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/").filter(Boolean);

    if (!segments.length) {
      return url;
    }

    if (platform === "github") {
      return `${parsed.origin}/${segments[0]}`;
    }

    if (platform === "linkedin") {
      if (["in", "company", "school"].includes(segments[0]) && segments[1]) {
        return `${parsed.origin}/${segments[0]}/${segments[1]}`;
      }

      return `${parsed.origin}/${segments[0]}`;
    }

    if (platform === "leetcode") {
      if (segments[0] === "u" && segments[1]) {
        return `${parsed.origin}/u/${segments[1]}`;
      }

      return `${parsed.origin}/${segments[0]}`;
    }

    if (platform === "gfg") {
      if (segments[0] === "user" && segments[1]) {
        return `${parsed.origin}/user/${segments[1]}/`;
      }

      return `${parsed.origin}/${segments[0]}`;
    }

    return url;
  } catch {
    return url;
  }
};

const findUrls = (text = "") => {
  const directMatches = text.match(/https?:\/\/[^\s<>"')]+/gi) || [];
  const hostMatches =
    text.match(
      /\b(?:www\.)?(?:github\.com|linkedin\.com|leetcode\.com|geeksforgeeks\.org)\/[^\s<>"')]+/gi
    ) || [];
  const domainMatches = [
    ...text.matchAll(/(?<!@)\b(?:www\.)?(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"')]+)?/gi),
  ]
    .map((match) => {
      const nextCharacter = text[(match.index || 0) + match[0].length] || "";
      return nextCharacter === "@" ? "" : match[0];
    })
    .filter(Boolean);

  return unique([...directMatches, ...hostMatches, ...domainMatches].map(toPublicUrl));
};

const findSocialLinks = (text = "") => {
  const headerText = getHeaderText(text);
  const headerUrls = findUrls(headerText);
  const urls = unique([...headerUrls, ...findUrls(text)]);
  const matches = {
    githubUrl: "",
    linkedinUrl: "",
    leetcodeUrl: "",
    gfgUrl: "",
    portfolioUrl: "",
  };
  const labeledValues = {
    github: readLabeledValue(headerText, [
      /github(?:\s+(?:profile|username|handle|id))?\s*(?:[:|\-])?\s*(.+)$/i,
    ]) || readLabeledValue(text, [/github(?:\s+(?:profile|username|handle|id))?\s*(?:[:|\-])?\s*(.+)$/i]),
    linkedin:
      readLabeledValue(headerText, [
        /linkedin(?:\s+(?:profile|url|id))?\s*(?:[:|\-])?\s*(.+)$/i,
      ]) || readLabeledValue(text, [/linkedin(?:\s+(?:profile|url|id))?\s*(?:[:|\-])?\s*(.+)$/i]),
    leetcode:
      readLabeledValue(headerText, [
        /(?:leetcode|leet\s*code)(?:\s+(?:profile|username|handle|id))?\s*(?:[:|\-])?\s*(.+)$/i,
      ]) ||
      readLabeledValue(text, [
        /(?:leetcode|leet\s*code)(?:\s+(?:profile|username|handle|id))?\s*(?:[:|\-])?\s*(.+)$/i,
      ]),
    gfg:
      readLabeledValue(headerText, [
        /(?:geeksforgeeks|gfg)(?:\s+(?:profile|username|handle|id))?\s*(?:[:|\-])?\s*(.+)$/i,
      ]) ||
      readLabeledValue(text, [
        /(?:geeksforgeeks|gfg)(?:\s+(?:profile|username|handle|id))?\s*(?:[:|\-])?\s*(.+)$/i,
      ]),
    portfolio:
      readLabeledValue(headerText, [
        /(?:portfolio|website|personal website|site)(?:\s+(?:url|link))?\s*(?:[:|\-])?\s*(.+)$/i,
      ]) ||
      readLabeledValue(text, [
        /(?:portfolio|website|personal website|site)(?:\s+(?:url|link))?\s*(?:[:|\-])?\s*(.+)$/i,
      ]),
  };

  urls.forEach((url) => {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, "");

      if (!matches.githubUrl && SOCIAL_DOMAINS.github.includes(hostname)) {
        matches.githubUrl = normalizeSocialProfileUrl(url, "github");
        return;
      }

      if (!matches.linkedinUrl && SOCIAL_DOMAINS.linkedin.includes(hostname)) {
        matches.linkedinUrl = normalizeSocialProfileUrl(url, "linkedin");
        return;
      }

      if (!matches.leetcodeUrl && SOCIAL_DOMAINS.leetcode.includes(hostname)) {
        matches.leetcodeUrl = normalizeSocialProfileUrl(url, "leetcode");
        return;
      }

      if (!matches.gfgUrl && SOCIAL_DOMAINS.gfg.includes(hostname)) {
        matches.gfgUrl = normalizeSocialProfileUrl(url, "gfg");
        return;
      }

      if (!matches.portfolioUrl) {
        matches.portfolioUrl = url;
      }
    } catch {
      return;
    }
  });

  if (!matches.githubUrl) {
    matches.githubUrl = normalizeProfileReference(labeledValues.github, "github");
  }

  if (!matches.linkedinUrl) {
    matches.linkedinUrl = normalizeProfileReference(labeledValues.linkedin, "linkedin");
  }

  if (!matches.leetcodeUrl) {
    matches.leetcodeUrl = normalizeProfileReference(labeledValues.leetcode, "leetcode");
  }

  if (!matches.gfgUrl) {
    matches.gfgUrl = normalizeProfileReference(labeledValues.gfg, "gfg");
  }

  if (!matches.portfolioUrl) {
    matches.portfolioUrl = normalizeProfileReference(labeledValues.portfolio, "portfolio");
  }

  if (!matches.portfolioUrl) {
    matches.portfolioUrl =
      headerUrls.find((url) => !isSocialUrl(url)) || urls.find((url) => !isSocialUrl(url)) || "";
  }

  return matches;
};

const extractEmail = (text = "") => text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";

const extractPhone = (text = "") => {
  const phoneMatch = text.match(/(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,6}/);
  return readString(phoneMatch?.[0]);
};

const detectSectionBlocks = (text = "") => {
  const lines = normalizeWhitespace(text).split("\n");
  const sections = {};
  let activeSection = "header";

  const headingMap = {
    skills: ["skills", "technical skills", "core competencies", "tech stack"],
    projects: ["projects", "personal projects", "academic projects", "key projects"],
    experience: ["experience", "work experience", "internship", "internships", "professional experience"],
    education: ["education", "academic background", "academics"],
  };

  const resolveHeading = (line) => {
    const normalized = readString(line).toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();

    return Object.entries(headingMap).find(([, labels]) => labels.includes(normalized))?.[0] || "";
  };

  lines.forEach((line) => {
    const heading = resolveHeading(line);

    if (heading) {
      activeSection = heading;
      sections[activeSection] = sections[activeSection] || [];
      return;
    }

    sections[activeSection] = sections[activeSection] || [];
    sections[activeSection].push(line);
  });

  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [key, normalizeWhitespace(value.join("\n"))])
  );
};

const detectName = (text = "", email = "") => {
  const lines = normalizeWhitespace(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8);

  return (
    lines.find((line) => {
      if (line.includes("@")) return false;
      if (/https?:\/\//i.test(line)) return false;
      if (/\d{3,}/.test(line)) return false;
      const words = line.split(/\s+/).filter(Boolean);
      return words.length >= 2 && words.length <= 5;
    }) || email.split("@")[0] || ""
  );
};

const detectEducation = (educationText = "", fullText = "") => {
  const source = `${educationText}\n${fullText}`;
  const lines = normalizeWhitespace(source)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const degreeMatch =
    source.match(
      /\b(B\.?Tech|B\.?E\.?|BCA|BSc|B\.?Sc|M\.?Tech|MCA|MSc|M\.?Sc|Bachelor(?:'s)?(?: of [A-Za-z ]+)?|Master(?:'s)?(?: of [A-Za-z ]+)?|Diploma)\b/i
    ) || [];
  const collegeLine =
    lines.find((line) =>
      /\b(?:University|College|Institute|School|Academy|Campus)\b/i.test(line)
    ) || "";
  const durationMatch = source.match(
    /\b((?:19|20)\d{2})\s*(?:-|–|—|to)\s*((?:19|20)\d{2}|present|current)\b/i
  );
  const yearMatch = source.match(/\b(20\d{2}|19\d{2})\b/g) || [];

  return {
    degree: readString(degreeMatch[0]),
    college: readString(collegeLine),
    year: durationMatch
      ? `${durationMatch[1]} - ${
          /present|current/i.test(durationMatch[2]) ? "Present" : durationMatch[2]
        }`
      : readString(yearMatch[yearMatch.length - 1] || ""),
  };
};

const detectExperienceLevel = (text = "", experiences = []) => {
  const normalized = text.toLowerCase();
  const yearMatch = normalized.match(/(\d+)\+?\s*(?:years|yrs)/);
  const years = Number.parseInt(yearMatch?.[1] || "0", 10);

  if (years >= 5) return "senior";
  if (years >= 3) return "mid";
  if (years >= 1) return "junior";
  if (experiences.some((item) => classifyExperienceType(item.type) === "internship")) {
    return "fresher";
  }

  return "fresher";
};

const buildFallbackProjects = (projectText = "", text = "") => {
  const sourceText = projectText || text;
  const blocks = sourceText
    .split(/\n{2,}/)
    .map((block) => normalizeWhitespace(block))
    .filter(Boolean)
    .slice(0, 5);

  const urls = findUrls(sourceText);

  return normalizeProjects(
    blocks.map((block, index) => {
      const lines = block.split("\n").filter(Boolean);
      const titleLine = lines[0] || `Project ${index + 1}`;
      const link = urls.find((url) => block.includes(url)) || "";

      return {
        title: titleLine.replace(/^[•\-*]\s*/, ""),
        description: lines.slice(1).join(" ") || titleLine,
        link,
      };
    })
  );
};

const buildFallbackExperiences = (experienceText = "") =>
  normalizeExperiences(
    experienceText
      .split(/\n{2,}/)
      .map((block) => normalizeWhitespace(block))
      .filter(Boolean)
      .slice(0, 5)
      .map((block) => {
        const lines = block.split("\n").filter(Boolean);
        const titleLine = lines[0] || "";
        const secondLine = lines[1] || "";

        return {
          title: titleLine.replace(/^[•\-*]\s*/, ""),
          company: secondLine,
          duration: lines.find((line) => /\b(20\d{2}|Present|present|Month|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/.test(line)) || "",
          description: lines.slice(1).join(" "),
          type: classifyExperienceType(block),
          link: findUrls(block)[0] || "",
        };
      })
  );

const normalizeProjectsFromModel = (projects = []) =>
  normalizeProjects(projects).slice(0, 8);

const normalizeExperiencesFromModel = (experiences = []) =>
  normalizeExperiences(
    experiences.map((experience) => ({
      ...experience,
      type: classifyExperienceType(experience.type || experience.title || ""),
    }))
  ).slice(0, 8);

const sanitizeStructuredProfile = (payload = {}, fallbackText = "") => {
  const sectionBlocks = detectSectionBlocks(fallbackText);
  const heuristicSkills = normalizeSkills([
    ...extractSkillsFromText(fallbackText),
    ...normalizeStringArray(sectionBlocks.skills || ""),
  ]);
  const socialLinks = findSocialLinks(fallbackText);
  const email = readString(payload.email || extractEmail(fallbackText));

  const experiences = normalizeExperiencesFromModel(
    Array.isArray(payload.experiences) ? payload.experiences : buildFallbackExperiences(sectionBlocks.experience || "")
  );

  const education = detectEducation(sectionBlocks.education || "", fallbackText);
  const projects = normalizeProjectsFromModel(
    Array.isArray(payload.projects) && payload.projects.length
      ? payload.projects
      : buildFallbackProjects(sectionBlocks.projects || "", fallbackText)
  );

  const skills = normalizeSkills([
    ...heuristicSkills,
    ...(Array.isArray(payload.skills) ? payload.skills : []),
  ]);

  const experienceLevel =
    normalizeExperienceLevel(payload.experienceLevel) || detectExperienceLevel(fallbackText, experiences);

  return {
    name: readString(payload.name || detectName(fallbackText, email)),
    email,
    phone: readString(payload.phone || extractPhone(fallbackText)),
    college: readString(payload.college || education.college),
    degree: readString(payload.degree || education.degree),
    year: readString(payload.year || education.year),
    experienceLevel,
    skills,
    projects,
    experiences,
    githubUrl: normalizeProfileReference(payload.githubUrl || socialLinks.githubUrl, "github"),
    leetcodeUrl: normalizeProfileReference(payload.leetcodeUrl || socialLinks.leetcodeUrl, "leetcode"),
    gfgUrl: normalizeProfileReference(payload.gfgUrl || socialLinks.gfgUrl, "gfg"),
    portfolioUrl: normalizeProfileReference(payload.portfolioUrl || socialLinks.portfolioUrl, "portfolio"),
    linkedinUrl: normalizeProfileReference(payload.linkedinUrl || socialLinks.linkedinUrl, "linkedin"),
  };
};

const extractStructuredProfileWithAI = async (resumeText = "") => {
  const groq = getGroqClient();

  if (!groq || !resumeText.trim()) {
    return null;
  }

  const promptText = resumeText.slice(0, MAX_PROMPT_CHARS);

  const completion = await groq.chat.completions.create({
    model: getGroqModel(),
    temperature: 0.2,
    max_tokens: 1400,
    messages: [
      {
        role: "system",
        content:
          "Extract structured student profile data from a resume. Return strict JSON only with these keys: name, email, phone, college, degree, year, experienceLevel, skills, projects, experiences, githubUrl, leetcodeUrl, gfgUrl, portfolioUrl, linkedinUrl. skills must be an array of strings. projects must be an array of objects with title, description, link. experiences must be an array of objects with title, company, type, duration, location, description, link. Use only information present in the resume. If a value is unknown, return an empty string or empty array. Do not invent missing details.",
      },
      {
        role: "user",
        content: promptText,
      },
    ],
  });

  const content = completion?.choices?.[0]?.message?.content?.trim();

  if (!content) {
    return null;
  }

  return JSON.parse(stripCodeFence(content));
};

const decodeTextData = ({ mimeType = "", buffer }) => {
  if (mimeType.startsWith(TEXT_MIME_PREFIX)) {
    return buffer.toString("utf8");
  }

  return "";
};

export const extractResumeText = async (resume = {}) => {
  const fileName = readString(resume.fileName);
  const rawText = readString(resume.text);

  if (rawText) {
    return normalizeWhitespace(rawText);
  }

  const parsedDataUrl = parseDataUrl(resume.dataUrl);

  if (!parsedDataUrl) {
    throw new Error("Resume data is missing or invalid");
  }

  const { mimeType = "", buffer } = parsedDataUrl;

  if (buffer.length > MAX_RESUME_BYTES) {
    const error = new Error("Resume file is too large to parse");
    error.status = 413;
    throw error;
  }

  const lowerFileName = fileName.toLowerCase();

  if (mimeType === PDF_MIME || lowerFileName.endsWith(".pdf")) {
    const parser = new PDFParse({ data: buffer });
    const parsedPdf = await parser.getText();
    await parser.destroy();
    return normalizeWhitespace(parsedPdf.text || "");
  }

  if (mimeType === DOCX_MIME || lowerFileName.endsWith(".docx")) {
    const extractedDocx = await mammoth.extractRawText({ buffer });
    return normalizeWhitespace(extractedDocx.value || "");
  }

  if (mimeType === DOC_MIME || lowerFileName.endsWith(".doc")) {
    const error = new Error("Legacy .doc resumes are not supported yet. Please upload PDF or DOCX.");
    error.status = 415;
    throw error;
  }

  const decodedText = decodeTextData({ mimeType, buffer });

  if (decodedText) {
    return normalizeWhitespace(decodedText);
  }

  const error = new Error("Unsupported resume format. Please upload PDF, DOCX, or TXT.");
  error.status = 415;
  throw error;
};

const mergeCollectionByKey = (existingItems = [], nextItems = [], getKey) => {
  const mergedMap = new Map();

  [...existingItems, ...nextItems].forEach((item) => {
    const key = getKey(item);
    if (!key) {
      return;
    }

    const current = mergedMap.get(key) || {};
    mergedMap.set(key, {
      ...current,
      ...item,
    });
  });

  return [...mergedMap.values()];
};

export const mergeResumeIntoProfile = (currentProfile, extractedProfile, resume, resumeText) => {
  const nextProjects = mergeCollectionByKey(
    currentProfile?.projects || [],
    extractedProfile.projects || [],
    (project) => `${readString(project.title).toLowerCase()}::${readString(project.link).toLowerCase()}`
  );

  const nextExperiences = mergeCollectionByKey(
    currentProfile?.experiences || [],
    extractedProfile.experiences || [],
    (experience) =>
      `${readString(experience.title).toLowerCase()}::${readString(experience.company).toLowerCase()}`
  );

  return {
    name: extractedProfile.name || currentProfile?.name || "",
    // Keep the student's existing account email as the source of truth during autofill.
    email: currentProfile?.email || extractedProfile.email || "",
    phone: extractedProfile.phone || currentProfile?.phone || "",
    college: extractedProfile.college || currentProfile?.college || "",
    degree: extractedProfile.degree || currentProfile?.degree || "",
    year: extractedProfile.year || currentProfile?.year || "",
    experienceLevel: extractedProfile.experienceLevel || currentProfile?.experienceLevel || "fresher",
    skills: unique([...(currentProfile?.skills || []), ...(extractedProfile.skills || [])]),
    projects: nextProjects,
    experiences: nextExperiences,
    githubUrl: extractedProfile.githubUrl || currentProfile?.githubUrl || "",
    leetcodeUrl: extractedProfile.leetcodeUrl || currentProfile?.leetcodeUrl || "",
    gfgUrl: extractedProfile.gfgUrl || currentProfile?.gfgUrl || "",
    portfolioUrl: extractedProfile.portfolioUrl || currentProfile?.portfolioUrl || "",
    linkedinUrl: extractedProfile.linkedinUrl || currentProfile?.linkedinUrl || "",
    resume: {
      fileName: readString(resume.fileName),
      dataUrl: readString(resume.dataUrl),
      text: resumeText,
      uploadedAt: new Date(),
    },
  };
};

export const parseResumeForStudentProfile = async ({ resume, currentProfile }) => {
  const resumeText = await extractResumeText(resume);

  if (!resumeText) {
    const error = new Error("Unable to extract readable text from the uploaded resume");
    error.status = 422;
    throw error;
  }

  let aiProfile = null;

  try {
    aiProfile = await extractStructuredProfileWithAI(resumeText);
  } catch (error) {
    aiProfile = null;
  }

  const extractedProfile = sanitizeStructuredProfile(aiProfile || {}, resumeText);
  const mergedProfile = mergeResumeIntoProfile(currentProfile, extractedProfile, resume, resumeText);

  return {
    resumeText,
    extractedProfile,
    mergedProfile,
    usedAI: Boolean(aiProfile),
  };
};
