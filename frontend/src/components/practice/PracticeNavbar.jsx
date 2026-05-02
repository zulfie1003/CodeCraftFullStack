import { Menu, Moon, Share2, Sun } from "lucide-react";

function PracticeNavbar({
  canSubmit,
  getDifficultyColor,
  isDarkMode,
  isProblemSubmitted,
  onOpenProblemList,
  onSubmit,
  onToggleTheme,
  selectedProblem,
}) {
  return (
    <div className="leetcode-navbar">
      <div className="navbar-left">
        <button
          type="button"
          className="problem-list-btn"
          onClick={onOpenProblemList}
          title="View all problems"
        >
          <Menu size={18} />
        </button>
        <h1 className="problem-title">{selectedProblem.title}</h1>
        <span
          className="difficulty-tag"
          style={{ backgroundColor: getDifficultyColor(selectedProblem.difficulty) }}
        >
          {selectedProblem.difficulty}
        </span>
        {isProblemSubmitted && <span className="accepted-tag">Accepted</span>}
      </div>

      <div className="navbar-right">
        <button type="button" className="navbar-btn like-btn" title="Like">
          👍 {selectedProblem.likes}
        </button>
        <button type="button" className="navbar-btn dislike-btn" title="Dislike">
          👎 {selectedProblem.dislikes}
        </button>
        <button type="button" className="navbar-btn share-btn" title="Share">
          <Share2 size={16} />
        </button>
        <button
          type="button"
          className="navbar-btn premium-badge"
          title="Judge0 powered execution"
        >
          Judge0 Run
        </button>
        <button
          type="button"
          className="navbar-btn theme-btn"
          onClick={onToggleTheme}
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {(canSubmit || isProblemSubmitted) && (
          <button
            type="button"
            className={`submit-btn ${isProblemSubmitted ? "accepted" : ""}`}
            onClick={onSubmit}
            disabled={!canSubmit}
          >
            {isProblemSubmitted ? "Accepted" : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}

export default PracticeNavbar;
