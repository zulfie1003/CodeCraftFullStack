import React, { useEffect, useRef, useState } from "react";
import api from "../../api/axios";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/roadmap.css";

const LOADING_STEPS = [
  "Understanding your target role...",
  "Mapping the required skills...",
  "Generating a tree roadmap with Groq...",
  "Adding projects, mistakes, and tips...",
  "Finalizing your roadmap...",
];

const QUICK_GOALS = [
  "MERN Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Data Analyst",
  "Java Developer",
];

const TreeNode = ({ node, depth = 0 }) => {
  if (!node?.title) {
    return null;
  }

  return (
    <li className={`tree-node depth-${Math.min(depth, 3)}`}>
      <div className="tree-node-card">
        <div className="tree-node-header">
          <h3 className="tree-node-title">{node.title}</h3>
          {node.duration && <span className="tree-node-duration">{node.duration}</span>}
        </div>
        {node.focus && <p className="tree-node-focus">{node.focus}</p>}
      </div>

      {Array.isArray(node.children) && node.children.length > 0 && (
        <ul className="tree-children">
          {node.children.map((child, index) => (
            <TreeNode key={`${child.title}-${index}`} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
};

const Roadmap = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [roadmap, setRoadmap] = useState(null);
  const [error, setError] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startStepAnimation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setStep(1);
    timerRef.current = setInterval(() => {
      setStep((current) => (current < LOADING_STEPS.length ? current + 1 : current));
    }, 850);
  };

  const stopStepAnimation = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleGenerate = async (goalOverride) => {
    const goal = (goalOverride ?? input).trim();

    if (!goal || loading) {
      return;
    }

    setInput(goal);
    setLoading(true);
    setRoadmap(null);
    setError("");
    startStepAnimation();

    try {
      const response = await api.post("/ai/roadmap", {
        goal,
      });

      setRoadmap(response.data.data.roadmap);
      setStep(LOADING_STEPS.length);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to generate roadmap right now. Check your backend Groq configuration."
      );
      setStep(0);
    } finally {
      stopStepAnimation();
      setLoading(false);
    }
  };

  const resetRoadmap = () => {
    stopStepAnimation();
    setRoadmap(null);
    setInput("");
    setError("");
    setStep(0);
    setLoading(false);
  };

  return (
    <StudentLayout>
      <div className="roadmap-page">
        <div className="roadmap-shell">
          <h1 className="roadmap-title">AI Learning Roadmap Generator</h1>
          <p className="roadmap-subtitle">
            Generate a student-focused roadmap with Groq AI and view it as a learning tree.
          </p>

          <div className="glass-card">
            <input
              className="roadmap-input"
              placeholder="e.g. MERN Stack, Frontend Developer, Data Science"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleGenerate()}
              disabled={loading}
            />

            <div className="quick-tags-row">
              {QUICK_GOALS.map((goal) => (
                <button
                  key={goal}
                  type="button"
                  className="quick-tag"
                  onClick={() => handleGenerate(goal)}
                  disabled={loading}
                >
                  {goal}
                </button>
              ))}
            </div>

            <div className="roadmap-actions">
              <button className="neon-btn" onClick={() => handleGenerate()} disabled={loading}>
                {loading ? "Generating..." : "Generate Roadmap"}
              </button>
            </div>
          </div>

          {loading && (
            <div className="glass-card status-card">
              {LOADING_STEPS.map((item, index) => {
                const isDone = index < step;
                const isActive = index === Math.max(step - 1, 0);

                return (
                  <p
                    key={item}
                    className={`status-step ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}
                  >
                    <span>{isDone ? "✔" : "○"}</span>
                    {item}
                  </p>
                );
              })}
            </div>
          )}

          {error && (
            <div className="glass-card roadmap-error">
              <h3>Roadmap generation failed</h3>
              <p>{error}</p>
            </div>
          )}

          {roadmap && (
            <div className="roadmap-results">
              <div className="glass-card roadmap-overview">
                <div className="section-heading">
                  <div>
                    <h2>{roadmap.title}</h2>
                    <p className="section-copy">{roadmap.summary}</p>
                  </div>
                  <span className="roadmap-duration">{roadmap.duration}</span>
                </div>

                <div className="focus-pills">
                  {roadmap.focusAreas.map((area, index) => (
                    <span key={`${area}-${index}`} className="skill-pill">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card tree-card">
                <div className="section-heading">
                  <div>
                    <h2>Roadmap Tree</h2>
                    <p className="section-copy">
                      Start at the root, then move branch by branch through the learning path.
                    </p>
                  </div>
                  <span className="tree-badge">Groq AI</span>
                </div>

                <div className="roadmap-tree-shell">
                  <ul className="tree-root">
                    <TreeNode node={roadmap.tree} />
                  </ul>
                </div>
              </div>

              <h2 className="section-title-lg">Learning Modules</h2>
              {roadmap.modules.map((module) => (
                <div
                  key={module.id}
                  className={`glass-card module-card ${
                    module.status === "completed"
                      ? "module-completed"
                      : module.status === "in-progress"
                        ? "module-progress"
                        : "module-locked"
                  }`}
                >
                  <h3>{module.title}</h3>
                  <p className="roadmap-subtitle module-copy">{module.desc}</p>
                  <p className="roadmap-subtitle">⏱ {module.time}</p>

                  <ul className="module-task-list">
                    {module.tasks.map((task, index) => (
                      <li
                        key={`${task.name}-${index}`}
                        className={`task-item ${task.isCompleted ? "task-completed" : ""}`}
                      >
                        {task.isCompleted ? "✔" : "○"} {task.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <h2 className="section-title-lg">Projects</h2>
              <div className="projects-grid">
                {roadmap.projects.map((project, index) => (
                  <div key={`${project.title}-${index}`} className="glass-card project-card">
                    <h3>{project.title}</h3>
                    <p className="roadmap-subtitle project-copy">{project.desc}</p>

                    <div className="focus-pills">
                      {project.skills.map((skill, skillIndex) => (
                        <span key={`${skill}-${skillIndex}`} className="skill-pill">
                          {skill}
                        </span>
                      ))}
                    </div>

                    <span
                      className={`project-difficulty diff-${project.difficulty.toLowerCase()}`}
                    >
                      {project.difficulty}
                    </span>
                  </div>
                ))}
              </div>

              <div className="glass-card warning-box">
                <h3>Common Mistakes</h3>
                <ul className="insight-list">
                  {roadmap.mistakes.map((mistake, index) => (
                    <li key={`${mistake}-${index}`}>⚠ {mistake}</li>
                  ))}
                </ul>
              </div>

              <div className="glass-card tips-box">
                <h3>Pro Tips</h3>
                <ul className="insight-list">
                  {roadmap.tips.map((tip, index) => (
                    <li key={`${tip}-${index}`}>✅ {tip}</li>
                  ))}
                </ul>
              </div>

              <div className="advice-box">“{roadmap.advice}”</div>

              <div className="roadmap-actions centered">
                <button className="neon-btn" onClick={resetRoadmap}>
                  Generate Another Roadmap
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  );
};

export default Roadmap;
