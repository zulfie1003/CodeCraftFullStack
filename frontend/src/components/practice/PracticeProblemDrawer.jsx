import { X as XClose } from "lucide-react";

function PracticeProblemDrawer({
  isOpen,
  onClose,
  categories,
  categoryCounts,
  selectedModule,
  onSelectModule,
  problems,
  selectedProblemId,
  onSelectProblem,
  getDifficultyColor,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="problem-list-overlay" onClick={onClose}>
      <div className="problem-list-drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <h2 className="drawer-title">All Problems</h2>
          <button type="button" className="drawer-close-btn" onClick={onClose} title="Close">
            <XClose size={20} />
          </button>
        </div>

        <div className="module-tabs">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`module-tab ${selectedModule === category ? "active" : ""}`}
              onClick={() => onSelectModule(category)}
            >
              {category}
              <span className="tab-count">{categoryCounts[category]}</span>
            </button>
          ))}
        </div>

        <div className="problems-grid">
          {problems.map((problem, index) => (
            <div
              key={problem.id}
              role="button"
              tabIndex={0}
              className={`problem-card ${selectedProblemId === problem.id ? "active" : ""}`}
              onClick={() => onSelectProblem(problem)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectProblem(problem);
                }
              }}
            >
              <div className="problem-card-header">
                <span className="problem-number">
                  {selectedModule}: {index + 1}
                </span>
                <span
                  className="problem-difficulty"
                  style={{ backgroundColor: getDifficultyColor(problem.difficulty) }}
                >
                  {problem.difficulty}
                </span>
              </div>
              <h3 className="problem-card-title">{problem.title}</h3>
              <p className="problem-card-category">{problem.category}</p>
              <div className="problem-card-stats">
                <span className="stat">😊 {problem.accepted}</span>
                <span className="stat">📊 {problem.submissions}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PracticeProblemDrawer;
