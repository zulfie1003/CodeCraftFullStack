import test from "node:test";
import assert from "node:assert/strict";

import { parseResumeForStudentProfile } from "./resumeAutofill.service.js";

const SAMPLE_RESUME_TEXT = `
Rahul Sharma
rahul.sharma@example.com
+91 9876543210
linkedin.com/in/rahulsharma
github.com/rahul-dev
rahul-portfolio.vercel.app

Education
B.Tech in Computer Science
CodeCraft Institute of Technology
2026

Skills
React, Node.js, MongoDB, Express, JavaScript, Git, REST API

Experience
Frontend Developer Intern
BrightSoft Technologies
May 2025 - July 2025
Built dashboard components, integrated REST APIs, and improved performance.

Projects
CodeCraft Jobs Platform
Built a MERN job recommendation platform with skill matching and resume upload.
https://github.com/rahul-dev/codecraft-jobs

Portfolio Website
Personal portfolio with projects and contact links.
https://rahul-portfolio.vercel.app
`;

const LABELED_PROFILE_RESUME_TEXT = `
Aisha Khan
aisha.khan@example.com
GitHub: aisha-dev
LeetCode ID: algo_aisha
GeeksforGeeks: aisha_codes
Portfolio: aisha-portfolio.vercel.app
LinkedIn: linkedin.com/in/aishakhan

Education
B.Tech in Information Technology
Metro College of Engineering
2022 - 2026

Projects
Inventory Intelligence
Built an inventory analytics dashboard for campus stores.
https://inventory-intelligence-demo.vercel.app
`;

test("parseResumeForStudentProfile autofills key student profile fields from text resumes", async () => {
  const result = await parseResumeForStudentProfile({
    resume: {
      fileName: "resume.txt",
      dataUrl: `data:text/plain;base64,${Buffer.from(SAMPLE_RESUME_TEXT, "utf8").toString("base64")}`,
    },
    currentProfile: {
      name: "",
      email: "",
      phone: "",
      college: "",
      degree: "",
      year: "",
      experienceLevel: "fresher",
      skills: [],
      projects: [],
      experiences: [],
      githubUrl: "",
      leetcodeUrl: "",
      gfgUrl: "",
      portfolioUrl: "",
      linkedinUrl: "",
    },
  });

  assert.equal(result.mergedProfile.name, "Rahul Sharma");
  assert.equal(result.mergedProfile.email, "rahul.sharma@example.com");
  assert.equal(result.mergedProfile.phone, "+91 9876543210");
  assert.equal(result.mergedProfile.degree, "B.Tech");
  assert.equal(result.mergedProfile.college, "CodeCraft Institute of Technology");
  assert.ok(result.mergedProfile.skills.includes("React"));
  assert.ok(result.mergedProfile.skills.includes("Node.js"));
  assert.ok(result.mergedProfile.projects.length >= 1);
  assert.ok(result.mergedProfile.experiences.length >= 1);
  assert.equal(result.mergedProfile.githubUrl, "https://github.com/rahul-dev");
  assert.equal(result.mergedProfile.linkedinUrl, "https://linkedin.com/in/rahulsharma");
  assert.equal(result.mergedProfile.portfolioUrl, "https://rahul-portfolio.vercel.app");
});

test("parseResumeForStudentProfile preserves the current profile email during autofill", async () => {
  const result = await parseResumeForStudentProfile({
    resume: {
      fileName: "resume.txt",
      dataUrl: `data:text/plain;base64,${Buffer.from(SAMPLE_RESUME_TEXT, "utf8").toString("base64")}`,
    },
    currentProfile: {
      name: "Rahul Sharma",
      email: "student.account@example.com",
      phone: "",
      college: "",
      degree: "",
      year: "",
      experienceLevel: "fresher",
      skills: [],
      projects: [],
      experiences: [],
      githubUrl: "",
      leetcodeUrl: "",
      gfgUrl: "",
      portfolioUrl: "",
      linkedinUrl: "",
    },
  });

  assert.equal(result.extractedProfile.email, "rahul.sharma@example.com");
  assert.equal(result.mergedProfile.email, "student.account@example.com");
});

test("parseResumeForStudentProfile extracts labeled coding profiles and course duration ranges", async () => {
  const result = await parseResumeForStudentProfile({
    resume: {
      fileName: "resume.txt",
      dataUrl: `data:text/plain;base64,${Buffer.from(
        LABELED_PROFILE_RESUME_TEXT,
        "utf8"
      ).toString("base64")}`,
    },
    currentProfile: {
      name: "",
      email: "",
      phone: "",
      college: "",
      degree: "",
      year: "",
      experienceLevel: "fresher",
      skills: [],
      projects: [],
      experiences: [],
      githubUrl: "",
      leetcodeUrl: "",
      gfgUrl: "",
      portfolioUrl: "",
      linkedinUrl: "",
    },
  });

  assert.equal(result.mergedProfile.githubUrl, "https://github.com/aisha-dev");
  assert.equal(result.mergedProfile.leetcodeUrl, "https://leetcode.com/u/algo_aisha");
  assert.equal(
    result.mergedProfile.gfgUrl,
    "https://www.geeksforgeeks.org/user/aisha_codes/"
  );
  assert.equal(result.mergedProfile.portfolioUrl, "https://aisha-portfolio.vercel.app");
  assert.equal(result.mergedProfile.linkedinUrl, "https://linkedin.com/in/aishakhan");
  assert.equal(result.mergedProfile.year, "2022 - 2026");
});
