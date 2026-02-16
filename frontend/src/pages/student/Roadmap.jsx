import React, { useState } from "react";
import StudentLayout from "../../layouts/StudentLayout";
import "../../styles/roadmap.css";

const Roadmap = () => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [roadmap, setRoadmap] = useState(null);

  const steps = [
    "Analyzing your goal...",
    "Identifying key skills...",
    "Building roadmap structure...",
    "Adding projects & tips...",
    "Finalizing roadmap...",
  ];

  const handleGenerate = () => {
    if (!input.trim()) return;

    setLoading(true);
    setRoadmap(null);
    setStep(0);

    let i = 0;
    const timer = setInterval(() => {
      i++;
      setStep(i);
      if (i === steps.length) {
        clearInterval(timer);
        setLoading(false);
        setRoadmap(generateRoadmap(input));
      }
    }, 700);
  };

  return (
       <StudentLayout>
    <div className="roadmap-page">
      {/* HEADER */}
      <h1 className="roadmap-title">AI Learning Roadmap Generator</h1>
      <p className="roadmap-subtitle">
        Get a personalized roadmap based on your career goal
      </p>

      {/* INPUT */}
      <div className="glass-card">
        <input
          className="roadmap-input"
          placeholder="e.g. MERN Stack, Frontend Developer, Data Science"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
        />

        <div style={{ marginTop: "14px" }}>
          <button className="neon-btn" onClick={handleGenerate}>
            Generate Roadmap
          </button>
        </div>
      </div>

      {/* LOADING STEPS */}
      {loading && (
        <div className="glass-card" style={{ marginTop: "20px" }}>
          {steps.map((s, i) => (
            <p
              key={i}
              style={{
                opacity: i < step ? 1 : 0.4,
                marginBottom: "6px",
              }}
            >
              {i < step ? "✔ " : "○ "} {s}
            </p>
          ))}
        </div>
      )}

      {/* ROADMAP RESULT */}
      {roadmap && (
        <div style={{ marginTop: "30px" }}>
          {/* OVERVIEW */}
          <div className="glass-card roadmap-overview">
            <h2>{roadmap.title}</h2>
            <span className="roadmap-duration">{roadmap.duration}</span>
            <p style={{ marginTop: "10px", color: "#9ca3af" }}>
              {roadmap.summary}
            </p>

            <div style={{ marginTop: "14px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {roadmap.tree.map((t, i) => (
                <span key={i} className="skill-pill">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* MODULES */}
          <h2 style={{ margin: "28px 0 10px" }}>Learning Modules</h2>

          {roadmap.modules.map((m) => (
            <div
              key={m.id}
              className={`glass-card module-card ${
                m.status === "completed"
                  ? "module-completed"
                  : m.status === "in-progress"
                  ? "module-progress"
                  : "module-locked"
              }`}
              style={{ marginBottom: "14px" }}
            >
              <h3>{m.title}</h3>
              <p className="roadmap-subtitle">{m.desc}</p>
              <p className="roadmap-subtitle">⏱ {m.time}</p>

              <ul style={{ marginTop: "10px" }}>
                {m.tasks.map((t, i) => (
                  <li
                    key={i}
                    className={`task-item ${
                      t.isCompleted ? "task-completed" : ""
                    }`}
                  >
                    {t.isCompleted ? "✔" : "○"} {t.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* PROJECTS */}
          <h2 style={{ margin: "28px 0 10px" }}>Projects</h2>

          <div style={{ display: "grid", gap: "14px" }}>
            {roadmap.projects.map((p, i) => (
              <div key={i} className="glass-card project-card">
                <h3>{p.title}</h3>
                <p className="roadmap-subtitle">{p.desc}</p>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {p.skills.map((s, j) => (
                    <span key={j} className="skill-pill">
                      {s}
                    </span>
                  ))}
                </div>

                <span
                  className={`project-difficulty diff-${p.difficulty.toLowerCase()}`}
                >
                  {p.difficulty}
                </span>
              </div>
            ))}
          </div>

          {/* MISTAKES */}
          <div className="glass-card warning-box" style={{ marginTop: "24px" }}>
            <h3>Common Mistakes</h3>
            <ul>
              {roadmap.mistakes.map((m, i) => (
                <li key={i}>⚠ {m}</li>
              ))}
            </ul>
          </div>

          {/* TIPS */}
          <div className="glass-card tips-box" style={{ marginTop: "14px" }}>
            <h3>Pro Tips</h3>
            <ul>
              {roadmap.tips.map((t, i) => (
                <li key={i}>✅ {t}</li>
              ))}
            </ul>
          </div>

          {/* ADVICE */}
          <div className="advice-box" style={{ marginTop: "18px" }}>
            “{roadmap.advice}”
          </div>

          {/* RESET */}
          <div style={{ textAlign: "center", marginTop: "26px" }}>
            <button
              className="neon-btn"
              onClick={() => {
                setRoadmap(null);
                setInput("");
                setStep(0);
              }}
            >
              Generate Another Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
    </StudentLayout>
  );
};


/* ------------------ ROADMAP DATA ------------------ */

function generateRoadmap(goal) {
  return {
    title: `Become a ${goal}`,
    duration: "6 – 9 Months",
    summary:
      "This roadmap is designed to take you from basics to advanced concepts with real projects.",
    tree: ["Basics", "Core Skills", "Frameworks", "Projects", "Advanced"],

    modules: [
      {
        id: 1,
        title: "Foundations",
        desc: "Learn the fundamentals",
        time: "2 Weeks",
        status: "completed",
        tasks: [
          { name: "Programming Basics", isCompleted: true },
          { name: "Git & GitHub", isCompleted: true },
        ],
      },
      {
        id: 2,
        title: "Core Concepts",
        desc: "Strengthen your core skills",
        time: "4 Weeks",
        status: "in-progress",
        tasks: [
          { name: "JavaScript / Logic" },
          { name: "Problem Solving" },
        ],
      },
      {
        id: 3,
        title: "Advanced Learning",
        desc: "Frameworks & real-world skills",
        time: "6 Weeks",
        status: "locked",
        tasks: [
          { name: "Frameworks" },
          { name: "System Design" },
        ],
      },
    ],

    projects: [
      {
        title: "Portfolio Website",
        difficulty: "Beginner",
        desc: "Build your personal portfolio",
        skills: ["HTML", "CSS"],
      },
      {
        title: "Real World App",
        difficulty: "Intermediate",
        desc: "Build a full-featured application",
        skills: ["Frontend", "Backend"],
      },
    ],

    mistakes: [
      "Skipping fundamentals",
      "Watching tutorials without coding",
      "Not building projects",
    ],

    tips: [
      "Code daily",
      "Build real projects",
      "Learn by teaching others",
    ],

    advice:
      "Consistency beats intensity. Build small, improve daily, and never stop learning.",
  };
}


export default Roadmap;
