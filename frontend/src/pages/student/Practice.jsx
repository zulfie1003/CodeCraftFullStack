import { useContext } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/practice.css";
import PracticeEditorPanel from "../../components/practice/PracticeEditorPanel";
import PracticeNavbar from "../../components/practice/PracticeNavbar";
import PracticeProblemDetails from "../../components/practice/PracticeProblemDetails";
import PracticeProblemDrawer from "../../components/practice/PracticeProblemDrawer";
import { ThemeContext } from "../../context/ThemeContext";
import { INTERVIEW_PREP_RESOURCE } from "../../features/practice/practiceData";
import { getDifficultyColor, humanizeExecutionState } from "../../features/practice/practiceHelpers";
import { usePracticeWorkspace } from "../../features/practice/usePracticeWorkspace";
import { LANGUAGES } from "../../utils/practiceRuntime";

function PracticeContent() {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const {
    canSubmit,
    categoryCounts,
    categories,
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
  } = usePracticeWorkspace();

  return (
    <div className={`leetcode-container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <PracticeProblemDrawer
        isOpen={showProblemList}
        onClose={() => setShowProblemList(false)}
        categories={categories}
        categoryCounts={categoryCounts}
        selectedModule={selectedModule}
        onSelectModule={setSelectedModule}
        problems={moduleProblems}
        selectedProblemId={selectedProblem.id}
        onSelectProblem={handleSelectProblem}
        getDifficultyColor={getDifficultyColor}
      />

      <PracticeNavbar
        canSubmit={canSubmit}
        getDifficultyColor={getDifficultyColor}
        isDarkMode={isDarkMode}
        isProblemSubmitted={isProblemSubmitted}
        onOpenProblemList={() => setShowProblemList(true)}
        onSubmit={submitCode}
        onToggleTheme={toggleTheme}
        selectedProblem={selectedProblem}
      />

      <div className="leetcode-main">
        <PracticeProblemDetails problem={selectedProblem} resource={INTERVIEW_PREP_RESOURCE} />

        <PracticeEditorPanel
          code={code}
          executionState={executionState}
          humanizeExecutionState={humanizeExecutionState}
          isCopied={isCopied}
          isRunning={isRunning}
          language={language}
          languages={LANGUAGES}
          onCodeChange={handleCodeChange}
          onCopyCode={copyCode}
          onLanguageChange={handleLanguageChange}
          onResetCode={resetCode}
          onRunCode={runCode}
          onToggleLanguageMenu={() => setShowLanguageMenu((current) => !current)}
          passedTests={passedTests}
          selectedLanguage={selectedLanguage}
          showLanguageMenu={showLanguageMenu}
          totalTests={totalTests}
        />
      </div>
    </div>
  );
}

function Practice() {
  return (
    <StudentLayout>
      <PracticeContent />
    </StudentLayout>
  );
}

export default Practice;
