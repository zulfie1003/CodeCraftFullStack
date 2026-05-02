import { useState } from "react";
import api from "../../api/axios";
import { LANGUAGES, getCodeTemplate, validateCode } from "../../utils/practiceRuntime";
import {
  CATEGORY_COUNTS,
  DEFAULT_PRACTICE_PROBLEM,
  MODULE_CATEGORIES,
  PROBLEMS_BY_CATEGORY,
} from "./practiceData";
import {
  buildExecutionRequest,
  buildSubmissionRecord,
  createErrorExecutionState,
  loadSubmittedProblems,
  saveSubmittedProblems,
} from "./practiceHelpers";

export const usePracticeWorkspace = () => {
  const [selectedProblem, setSelectedProblem] = useState(DEFAULT_PRACTICE_PROBLEM);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(() => getCodeTemplate("javascript", DEFAULT_PRACTICE_PROBLEM));
  const [executionState, setExecutionState] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showProblemList, setShowProblemList] = useState(false);
  const [selectedModule, setSelectedModule] = useState(MODULE_CATEGORIES[0]);
  const [submittedProblems, setSubmittedProblems] = useState(() => loadSubmittedProblems());
  const [isDirtySinceRun, setIsDirtySinceRun] = useState(false);

  const moduleProblems = PROBLEMS_BY_CATEGORY[selectedModule] || [];
  const selectedLanguage = LANGUAGES[language];
  const isProblemSubmitted = Boolean(submittedProblems[selectedProblem.id]);
  const canSubmit =
    Boolean(executionState?.summary?.passedAllTests) &&
    !isDirtySinceRun &&
    !isRunning &&
    !isProblemSubmitted;
  const passedTests = executionState?.summary?.passedCount || 0;
  const totalTests = executionState?.summary?.totalCount || 0;

  const clearExecutionFeedback = () => {
    setExecutionState(null);
    setIsDirtySinceRun(false);
  };

  const handleSelectProblem = (problem) => {
    setSelectedProblem(problem);
    setCode(getCodeTemplate(language, problem));
    clearExecutionFeedback();
    setShowProblemList(false);
  };

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    setCode(getCodeTemplate(nextLanguage, selectedProblem));
    clearExecutionFeedback();
    setShowLanguageMenu(false);
  };

  const handleCodeChange = (event) => {
    setCode(event.target.value);
    setIsDirtySinceRun(true);
  };

  const runCode = async () => {
    const validationErrors = validateCode(code, language);

    if (validationErrors.length > 0) {
      setExecutionState(createErrorExecutionState(validationErrors[0]));
      return;
    }

    setIsRunning(true);

    try {
      const response = await api.post(
        "/practice/execute",
        buildExecutionRequest({
          code,
          language,
          languageId: selectedLanguage.judge0Id,
          problem: selectedProblem,
        })
      );

      setExecutionState(response.data.data);
      setIsDirtySinceRun(false);
    } catch (error) {
      setExecutionState(
        createErrorExecutionState(
          error.response?.data?.message ||
            "Unable to run code right now. Check your backend Judge0 configuration.",
          "runtime_error"
        )
      );
      setIsDirtySinceRun(false);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = () => {
    if (!canSubmit) {
      return;
    }

    const nextSubmissions = {
      ...submittedProblems,
      [selectedProblem.id]: buildSubmissionRecord({ problem: selectedProblem, language }),
    };

    setSubmittedProblems(nextSubmissions);
    saveSubmittedProblems(nextSubmissions);
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      window.setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy code:", error);
    }
  };

  const resetCode = () => {
    setCode(getCodeTemplate(language, selectedProblem));
    clearExecutionFeedback();
  };

  return {
    canSubmit,
    categoryCounts: CATEGORY_COUNTS,
    categories: MODULE_CATEGORIES,
    code,
    copyCode,
    executionState,
    handleCodeChange,
    handleLanguageChange,
    handleSelectProblem,
    isCopied,
    isProblemSubmitted,
    isRunning,
    language,
    moduleProblems,
    passedTests,
    resetCode,
    runCode,
    selectedLanguage,
    selectedModule,
    selectedProblem,
    setSelectedModule,
    setShowLanguageMenu,
    setShowProblemList,
    showLanguageMenu,
    showProblemList,
    submitCode,
    totalTests,
  };
};
