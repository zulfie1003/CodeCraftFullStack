const SUBMISSIONS_STORAGE_KEY = "practice-submissions-v1";

export const loadSubmittedProblems = () => {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(localStorage.getItem(SUBMISSIONS_STORAGE_KEY) || "{}");
  } catch (error) {
    console.error("Unable to load stored submissions:", error);
    return {};
  }
};

export const saveSubmittedProblems = (submissions) => {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(submissions));
};

export const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case "Easy":
      return "#22c55e";
    case "Medium":
      return "#f59e0b";
    case "Hard":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
};

export const humanizeExecutionState = (executionState) => {
  switch (executionState) {
    case "accepted":
      return "Accepted";
    case "wrong_answer":
      return "Wrong Answer";
    case "runtime_error":
      return "Runtime Error";
    case "compilation_error":
      return "Compilation Error";
    case "validation_error":
      return "Validation Error";
    default:
      return "Execution Result";
  }
};

export const createErrorExecutionState = (message, type = "validation_error") => ({
  summary: {
    passedCount: 0,
    totalCount: 1,
    passedAllTests: false,
    executionState: type,
    averageTime: "N/A",
    bestTime: "N/A",
    maxMemory: "N/A",
  },
  results: [
    {
      id: 0,
      name: type === "validation_error" ? "Validation" : "Execution",
      input: "",
      expected: "",
      actual: "",
      status: humanizeExecutionState(type),
      passed: false,
      time: "N/A",
      memory: "N/A",
      error: message,
    },
  ],
  analysis: null,
});

export const buildExecutionRequest = ({ code, language, languageId, problem }) => ({
  code,
  language,
  languageId,
  problem: {
    title: problem.title,
    description: problem.description,
    constraints: problem.constraints,
    examples: problem.examples,
  },
});

export const buildSubmissionRecord = ({ problem, language }) => ({
  title: problem.title,
  language,
  submittedAt: new Date().toISOString(),
});
