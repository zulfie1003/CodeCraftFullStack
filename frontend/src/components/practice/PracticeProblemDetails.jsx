import { createElement } from "react";
import { ExternalLink } from "lucide-react";

const renderIcon = (Icon, size = 18) => createElement(Icon, { size });

function PracticeProblemDetails({ problem, resource }) {
  return (
    <div className="left-panel">
      <div className="description-content">
        <div className="description-section">
          <h2 className="section-title">Description</h2>
          <p className="description-text">{problem.description}</p>
        </div>

        <div className="description-section">
          <h2 className="section-title">Constraints</h2>
          <ul className="constraints-list">
            {problem.constraints.map((constraint, index) => (
              <li key={index}>{constraint}</li>
            ))}
          </ul>
        </div>

        <div className="description-section">
          <h2 className="section-title">Examples</h2>
          {problem.examples.map((example, index) => (
            <div key={index} className="example-card">
              <p className="example-header">Example {index + 1}</p>
              <div className="example-content">
                <div className="example-line">
                  <span className="example-key">Input</span>
                  <code className="example-value">{example.input}</code>
                </div>
                <div className="example-line">
                  <span className="example-key">Output</span>
                  <code className="example-value">{example.output}</code>
                </div>
                <div className="example-line">
                  <span className="example-key">Explanation</span>
                  <p className="example-value">{example.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="description-section">
          <h2 className="section-title">Execution Format</h2>
          <div className="format-card">
            <p className="description-text">
              The editor now uses a GFG-style <code className="inline-code">solve(input)</code>{" "}
              template. Judge0 runs your code against the sample inputs shown above.
            </p>
            <ul className="constraints-list">
              <li>Edit only the logic inside the template.</li>
              <li>Use the sample input format exactly as shown in the problem examples.</li>
              <li>Return or print the final output in the same format as the sample output.</li>
              <li>Submit becomes available only after all Judge0 sample tests pass.</li>
            </ul>
          </div>
        </div>

        <div className="description-section">
          <h2 className="section-title">Problem Stats</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Accepted</span>
              <span className="stat-value">{problem.accepted}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Submissions</span>
              <span className="stat-value">{problem.submissions}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Acceptance Rate</span>
              <span className="stat-value">52.9%</span>
            </div>
          </div>
        </div>

        <div className="description-section">
          <h2 className="section-title">{resource.title}</h2>
          <div className="practice-resource-card">
            <div className="practice-resource-header">
              <div>
                <span className="practice-resource-kicker">External Practice Resource</span>
                <h3 className="practice-resource-title">
                  AI interview, DSA, and system design support
                </h3>
              </div>
              <a
                className="practice-resource-link"
                href={resource.url}
                target="_blank"
                rel="noreferrer"
              >
                Visit Website <ExternalLink size={15} />
              </a>
            </div>

            <p className="practice-resource-description">{resource.description}</p>

            <div className="practice-resource-grid">
              {resource.highlights.map(({ icon, title, text }) => (
                <article key={title} className="practice-resource-item">
                  <span className="practice-resource-icon">{renderIcon(icon)}</span>
                  <div>
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PracticeProblemDetails;
