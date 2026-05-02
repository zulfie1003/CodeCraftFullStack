import { Check, X } from "lucide-react";

function PracticeExecutionResults({
  executionState,
  passedTests,
  totalTests,
  humanizeExecutionState,
}) {
  if (!executionState) {
    return null;
  }

  return (
    <div className="test-results-panel">
      <div className="test-header execution-header">
        <div>
          <h3 className="test-title">
            {executionState.summary?.passedAllTests
              ? "All sample tests passed"
              : humanizeExecutionState(executionState.summary?.executionState)}
          </h3>
          <p className="execution-subtitle">
            {passedTests}/{totalTests} sample tests passed
          </p>
        </div>
        <div className="execution-metrics">
          <span className="metric-pill">Avg Time: {executionState.summary?.averageTime}</span>
          <span className="metric-pill">Best Time: {executionState.summary?.bestTime}</span>
          <span className="metric-pill">Max Memory: {executionState.summary?.maxMemory}</span>
        </div>
      </div>

      {executionState.analysis && (
        <div className="analysis-panel">
          <div className="analysis-grid">
            <div className="analysis-stat">
              <span className="analysis-label">Time Complexity</span>
              <strong>{executionState.analysis.timeComplexity || "Not available"}</strong>
            </div>
            <div className="analysis-stat">
              <span className="analysis-label">Space Complexity</span>
              <strong>{executionState.analysis.spaceComplexity || "Not available"}</strong>
            </div>
          </div>
          <div className="analysis-card">
            <span className="analysis-card-title">Groq Hint</span>
            <p>{executionState.analysis.hint || "No additional hint available."}</p>
          </div>
          {executionState.analysis.improvedApproach && (
            <div className="analysis-card secondary">
              <span className="analysis-card-title">Improvement Suggestion</span>
              <p>{executionState.analysis.improvedApproach}</p>
            </div>
          )}
        </div>
      )}

      <div className="test-cases">
        {executionState.results.map((result) => (
          <div key={result.id} className={`test-case-item ${result.passed ? "passed" : "failed"}`}>
            <div className="test-case-header">
              <span className="test-case-icon">
                {result.passed ? (
                  <Check size={14} className="icon-pass" />
                ) : (
                  <X size={14} className="icon-fail" />
                )}
              </span>
              <span className="test-case-name">{result.name}</span>
              <span className={`test-status-badge ${result.passed ? "pass" : "fail"}`}>
                {result.status}
              </span>
            </div>

            <div className="test-case-details">
              {result.input && (
                <div className="test-io">
                  <span className="io-label">Input</span>
                  <code className="io-code">{result.input}</code>
                </div>
              )}
              {result.expected && (
                <div className="test-io">
                  <span className="io-label">Expected</span>
                  <code className="io-code">{result.expected}</code>
                </div>
              )}
              {(result.actual || result.actual === "") && (
                <div className="test-io">
                  <span className="io-label">Got</span>
                  <code className={`io-code ${result.passed ? "success" : "error"}`}>
                    {result.actual || "(no output)"}
                  </code>
                </div>
              )}
              {result.error && (
                <div className="test-io error">
                  <span className="io-label">Error</span>
                  <code className="io-code">{result.error}</code>
                </div>
              )}
              <div className="metric-inline-row">
                <span className="mini-metric">Time: {result.time}</span>
                <span className="mini-metric">Memory: {result.memory}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PracticeExecutionResults;
