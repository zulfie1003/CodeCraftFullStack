import test from "node:test";
import assert from "node:assert/strict";

import {
  computeMatchBreakdown,
  computeWeightedMatchBreakdown,
  extractSkillsFromText,
  normalizeSkills,
} from "./jobMatching.js";

test("computeMatchBreakdown uses matchedSkills / totalJobSkills * 100", () => {
  const result = computeMatchBreakdown(
    ["React", "Node.js", "MongoDB"],
    ["React", "Node.js", "TypeScript", "MongoDB"]
  );

  assert.equal(result.matchScore, 75);
  assert.deepEqual(result.matchedSkills, ["React", "Node.js", "MongoDB"]);
  assert.deepEqual(result.missingSkills, ["TypeScript"]);
});

test("computeWeightedMatchBreakdown lowers a full skill match when experience is below requirement", () => {
  const result = computeWeightedMatchBreakdown(
    ["React", "Node.js"],
    ["React", "Node.js"],
    {
      userExperienceLevel: "fresher",
      requiredExperienceLevel: "mid",
    }
  );

  assert.equal(result.skillMatchScore, 100);
  assert.equal(result.experienceMatchScore, 20);
  assert.equal(result.matchScore, 80);
  assert.equal(result.experienceMatched, false);
});

test("computeWeightedMatchBreakdown allows higher user experience to fully satisfy requirement", () => {
  const result = computeWeightedMatchBreakdown(
    ["React", "Node.js"],
    ["React", "Node.js"],
    {
      userExperienceLevel: "senior",
      requiredExperienceLevel: "mid",
    }
  );

  assert.equal(result.skillMatchScore, 100);
  assert.equal(result.experienceMatchScore, 100);
  assert.equal(result.matchScore, 100);
  assert.equal(result.experienceMatched, true);
});

test("normalizeSkills deduplicates aliases before match scoring", () => {
  const normalized = normalizeSkills(["reactjs", "React", "node", "Node.js"]);
  assert.deepEqual(normalized, ["React", "Node.js"]);
});

test("extractSkillsFromText avoids substring false positives", () => {
  const extracted = extractSkillsFromText(
    "Built dashboards with MongoDB, Express, React and Node.js for a company portal."
  );

  assert.ok(extracted.includes("MongoDB"));
  assert.ok(extracted.includes("React"));
  assert.ok(extracted.includes("Node.js"));
  assert.ok(!extracted.includes("Go"));
  assert.ok(!extracted.includes("C"));
  assert.ok(!extracted.includes("API Integration"));
});
