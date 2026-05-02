import { ChevronDown, Copy, Play, RefreshCw } from "lucide-react";
import PracticeExecutionResults from "./PracticeExecutionResults";

function PracticeEditorPanel({
  code,
  executionState,
  humanizeExecutionState,
  isCopied,
  isRunning,
  language,
  languages,
  onCodeChange,
  onCopyCode,
  onLanguageChange,
  onResetCode,
  onRunCode,
  onToggleLanguageMenu,
  passedTests,
  selectedLanguage,
  showLanguageMenu,
  totalTests,
}) {
  return (
    <div className="right-panel">
      <div className="editor-section">
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <div className="language-dropdown">
              <button type="button" className="lang-btn" onClick={onToggleLanguageMenu}>
                {selectedLanguage.icon} {selectedLanguage.name}
                <ChevronDown size={14} />
              </button>
              {showLanguageMenu && (
                <div className="lang-menu">
                  {Object.entries(languages).map(([key, currentLanguage]) => (
                    <button
                      key={key}
                      type="button"
                      className={`lang-menu-item ${language === key ? "active" : ""}`}
                      onClick={() => onLanguageChange(key)}
                    >
                      {currentLanguage.icon} {currentLanguage.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="editor-status-chip">
              {isRunning ? "Judge0 is compiling and running..." : "Judge0 sample execution"}
            </span>
          </div>

          <div className="toolbar-right">
            <button type="button" className="editor-action-btn" onClick={onCopyCode} title="Copy">
              <Copy size={14} /> {isCopied ? "Copied!" : "Copy"}
            </button>
            <button type="button" className="editor-action-btn" onClick={onResetCode} title="Reset">
              <RefreshCw size={14} /> Reset
            </button>
          </div>
        </div>

        <textarea
          className="code-editor"
          value={code}
          onChange={onCodeChange}
          spellCheck="false"
        />

        <PracticeExecutionResults
          executionState={executionState}
          passedTests={passedTests}
          totalTests={totalTests}
          humanizeExecutionState={humanizeExecutionState}
        />
      </div>

      <button type="button" className="run-tests-btn" onClick={onRunCode} disabled={isRunning}>
        <Play size={16} />
        {isRunning ? "Running on Judge0..." : "Run Code"}
      </button>
    </div>
  );
}

export default PracticeEditorPanel;
