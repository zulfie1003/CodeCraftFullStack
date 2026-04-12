import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Code2,
  Github,
  Sparkles,
  Target,
} from "lucide-react";
import "../styles/landing.css";

const HUMAN_AI_CYCLE = [
  {
    step: "01",
    phase: "Connect",
    title: "Understand the AI era with curiosity.",
    description:
      "The first move is not fear or hype. It is learning what AI changes, where it helps, and where human thinking still leads.",
    note: "Awareness comes before acceleration.",
    icon: Sparkles,
    tone: "mint",
  },
  {
    step: "02",
    phase: "Learn",
    title: "Build strong human fundamentals.",
    description:
      "Logic, communication, coding, systems thinking, and problem framing are what make AI useful instead of confusing.",
    note: "Fundamentals are the real multiplier.",
    icon: Code2,
    tone: "emerald",
  },
  {
    step: "03",
    phase: "Collaborate",
    title: "Work with AI, but keep human judgment.",
    description:
      "Use AI to explore ideas, speed up execution, and debug faster, but verify outputs, test decisions, and own the final result.",
    note: "Speed matters only when accuracy stays intact.",
    icon: Target,
    tone: "soft",
  },
  {
    step: "04",
    phase: "Grow",
    title: "Turn progress into visible proof.",
    description:
      "Projects, GitHub activity, portfolios, and shipped work show how a person grows with AI instead of being replaced by it.",
    note: "Proof creates trust and opportunity.",
    icon: BriefcaseBusiness,
    tone: "forest",
  },
];

const WORKFLOW_STEPS = [
  {
    icon: Sparkles,
    title: "Plan with clarity",
    description: "Use AI roadmaps to turn a broad goal into weekly direction.",
  },
  {
    icon: Code2,
    title: "Practice with feedback",
    description: "Code, test, debug, and build rhythm without leaving the workspace.",
  },
  {
    icon: Github,
    title: "Show real proof",
    description: "Convert GitHub activity and projects into visible portfolio signal.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Move toward jobs",
    description: "Track skill fit and focus on what actually improves hiring readiness.",
  },
];

const HERO_QUOTES = [
  {
    slot: "preview-top",
    label: "AI Quote",
    quote: "AI works best when curious people use it with intent.",
    note: "Direction still matters more than shortcuts.",
  },
  {
    slot: "preview-bottom",
    label: "Builder Quote",
    quote: "Code becomes powerful when it turns learning into proof.",
    note: "Projects, streaks, and iteration tell the real story.",
  },
  {
    slot: "preview-side",
    label: "Career Quote",
    quote: "A strong portfolio is a record of shipped decisions.",
    note: "Show momentum, not just the final screen.",
  },
];

const AI_GROWTH_PRINCIPLES = [
  {
    tag: "Human Edge",
    quote: "In the AI era, your advantage is not typing more. It is thinking clearer and learning faster.",
    note: "CodeCraft is built to strengthen that edge.",
  },
  {
    tag: "Learning",
    quote: "The goal is not to compete with AI. The goal is to become the person who can direct it well.",
    note: "Human depth makes AI leverage meaningful.",
  },
  {
    tag: "Growth",
    quote: "Real progress happens when AI support meets human discipline, practice, and consistent reflection.",
    note: "That is the lifecycle behind the platform.",
  },
];

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      <nav className="navbar">
        <div className="logo">
          <img src="/logo.png" alt="CodeCraft Logo" />
          <span>CodeCraft</span>
        </div>

        <button className="btn-primary" onClick={() => navigate("/login")}>
          Get Started
        </button>
      </nav>

      <section className="hero">
        <div className="hero-left">
          <div className="hero-badge">
            <Sparkles size={16} />
            AI-first learning, practice, portfolio, and hiring flow
          </div>

          <div className="hero-headline-shell">
            <span className="hero-beam beam-one" />
            <span className="hero-beam beam-two" />

            <h1 className="hero-title">
              <span className="hero-title-line">Build Skills.</span>
              <span className="hero-title-line accent">Track Progress.</span>
              <span className="hero-title-line">Get Hired.</span>
            </h1>
          </div>

          <p className="hero-copy">
            CodeCraft brings roadmap planning, coding practice, GitHub activity, portfolio
            building, mentor guidance, and job matching into one modern workspace for students.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary hero-cta" onClick={() => navigate("/login")}>
              Launch Your Workspace <ArrowRight size={17} />
            </button>
            <button
              className="btn-outline hero-cta secondary"
              onClick={() =>
                document.getElementById("landing-features")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Features
            </button>
          </div>

          <div className="hero-proof-grid">
            <div className="hero-proof-pill">
              <Code2 size={16} />
              <span>Live practice + AI hints</span>
            </div>
            <div className="hero-proof-pill">
              <Github size={16} />
              <span>GitHub-powered dashboard sync</span>
            </div>
            <div className="hero-proof-pill">
              <BriefcaseBusiness size={16} />
              <span>Portfolio to jobs pipeline</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-visual">
            <div className="visual-glow glow-a" />
            <div className="visual-glow glow-b" />
            <div className="visual-grid" />

            <article className="preview-panel preview-main preview-copy-card">
              <div className="preview-head">
                <span className="preview-chip">CodeCraft OS</span>
                <span className="preview-meta">AI + Practice + Jobs</span>
              </div>
              <div className="preview-panel-body">
                <h3>CodeCraft turns daily effort into visible career progress.</h3>
                <p>
                  One system for roadmap planning, coding practice, portfolio proof,
                  mentor support, and job-focused decision making.
                </p>

                <div className="signal-step-list">
                  {WORKFLOW_STEPS.map(({ icon: Icon, title, description }) => (
                    <article key={title} className="signal-step">
                      <span className="signal-step-icon">
                        <Icon size={16} />
                      </span>
                      <div>
                        <strong>{title}</strong>
                        <p>{description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </article>

            {HERO_QUOTES.map((item) => (
              <article
                key={item.label}
                className={`preview-panel preview-quote-card ${item.slot}`}
              >
                <div className="preview-head">
                  <span className="preview-chip">{item.label}</span>
                </div>
                <div className="preview-panel-body">
                  <span className="quote-mark">"</span>
                  <p className="signal-quote">{item.quote}</p>
                  <p className="signal-caption">{item.note}</p>
                </div>
              </article>
            ))}

            <div className="floating-card floating-card-top">
              <span className="floating-label">Builder Loop</span>
              <strong>Plan. Practice. Prove.</strong>
              <p>CodeCraft keeps your learning flow tied to outcomes that matter.</p>
            </div>

            <div className="floating-card floating-card-bottom">
              <Target size={16} />
              <div>
                <strong>Next Move</strong>
                <p>Learn with focus, ship proof, then apply with context.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="stats-card-modern">
          <span className="stats-kicker">Learners</span>
          <h2>10K+</h2>
          <p>Students building consistent coding and project habits.</p>
        </div>
        <div className="stats-card-modern">
          <span className="stats-kicker">Workflow</span>
          <h2>All-in-One</h2>
          <p>Roadmaps, AI mentor, practice, portfolio, and jobs in one place.</p>
        </div>
        <div className="stats-card-modern">
          <span className="stats-kicker">Outcome</span>
          <h2>Job Ready</h2>
          <p>Track the work that actually pushes students toward hiring decisions.</p>
        </div>
      </section>

      <section className="lifecycle-section" id="landing-features">
        <div className="lifecycle-header">
          <span className="lifecycle-kicker">Human + AI Lifecycle</span>
          <h2>How people learn, adapt, and grow in an AI-powered world.</h2>
          <p>
            CodeCraft is designed around a human journey: understand the shift, build real
            skills, collaborate with AI carefully, and turn that growth into visible proof.
          </p>

          <div className="lifecycle-pill-row">
            <span className="lifecycle-pill">Curiosity</span>
            <span className="lifecycle-pill">Fundamentals</span>
            <span className="lifecycle-pill">Judgment</span>
            <span className="lifecycle-pill">Proof</span>
          </div>
        </div>

        <div className="lifecycle-track">
          {HUMAN_AI_CYCLE.map(({ step, phase, title, description, note, icon: Icon, tone }) => (
            <article key={step} className={`lifecycle-card lifecycle-${tone}`}>
              <div className="lifecycle-orb">
                <span className="lifecycle-step">{step}</span>
              </div>

              <span className="lifecycle-icon">
                <Icon size={18} />
              </span>

              <p className="lifecycle-phase">{phase}</p>
              <h3>{title}</h3>
              <p className="lifecycle-description">{description}</p>
              <p className="lifecycle-note">{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mindset-strip">
        {AI_GROWTH_PRINCIPLES.map((item) => (
          <article key={item.tag} className="mindset-card">
            <span className="mindset-tag">{item.tag}</span>
            <p className="mindset-quote">"{item.quote}"</p>
            <p className="mindset-note">{item.note}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

export default Landing;
