import { createElement } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Code2,
  Github,
  GraduationCap,
  LayoutDashboard,
  Map,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import PublicThemeToggle from "./PublicThemeToggle";
import useScrollReveal from "../hooks/useScrollReveal";

import "../styles/landing.css";

const NAV_ITEMS = [
  { label: "Platform", target: "platform" },
  { label: "Workflow", target: "workflow" },
  { label: "Outcomes", target: "outcomes" },
  { label: "Roles", target: "roles" },
];

const ROLE_CARDS = [
  {
    icon: GraduationCap,
    title: "Students",
    text: "Practice coding, follow roadmaps, build a portfolio, and move toward job-ready proof.",
    meta: "Practice + Roadmap",
    accent: "accent-blue",
  },
  {
    icon: BriefcaseBusiness,
    title: "Recruiters",
    text: "Post opportunities, review applicants, and spot candidates with visible learning signals.",
    meta: "Jobs + Applicants",
    accent: "accent-purple",
  },
  {
    icon: CalendarDays,
    title: "Organizers",
    text: "Create hackathons, manage participants, and run events from one focused workspace.",
    meta: "Events + Teams",
    accent: "accent-violet",
  },
  {
    icon: Bot,
    title: "AI Mentoring",
    text: "Keep guidance close to the work with mentor support that connects goals to next steps.",
    meta: "Support + Signals",
    accent: "accent-indigo",
  },
];

const FEATURES = [
  {
    icon: Code2,
    title: "Coding practice",
    text: "Solve structured problems, run code, and keep execution results beside the prompt.",
  },
  {
    icon: Map,
    title: "Roadmaps",
    text: "Turn broad career goals into focused learning paths with visible progress.",
  },
  {
    icon: Github,
    title: "Portfolio signal",
    text: "Bring projects, GitHub activity, and profile readiness into the same career story.",
  },
];

const STEPS = [
  {
    title: "Pick your role",
    text: "Start in the workspace that matches how you learn, hire, or organize.",
  },
  {
    title: "Build the signal",
    text: "Practice, projects, jobs, and events all feed a clearer profile of progress.",
  },
  {
    title: "Act from one hub",
    text: "Move from roadmaps to applications or participant management without context switching.",
  },
  {
    title: "Track outcomes",
    text: "Use dashboards and profiles to keep next actions visible and measurable.",
  },
];

const SKILLS = [
  { icon: LayoutDashboard, title: "Unified dashboards", text: "Role-specific dashboards keep the next useful action easy to find." },
  { icon: Trophy, title: "Hackathon flow", text: "Events, participants, and registration tools live beside learning progress." },
  { icon: Users, title: "Hiring workspace", text: "Recruiters can connect posted roles to candidate-ready profiles." },
];

function Landing() {
  const navigate = useNavigate();
  useScrollReveal();

  const scrollToSection = (id) => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compactViewport = window.matchMedia("(max-width: 760px)").matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: prefersReducedMotion || compactViewport ? "auto" : "smooth", block: "start" });
  };

  return (
    <div className="landing-page">
      <div className="landing-orb orb-left" />
      <div className="landing-orb orb-right" />

      <header className="landing-header landing-shell">
        <button type="button" className="landing-brand" onClick={() => scrollToSection("top")}>
          <img src="/logo.png" alt="CodeCraft logo" />
          <span>CodeCraft</span>
        </button>

        <nav className="landing-nav" aria-label="Landing navigation">
          {NAV_ITEMS.map((item) => (
            <button key={item.target} type="button" onClick={() => scrollToSection(item.target)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="landing-header-actions">
          <PublicThemeToggle />
          <button type="button" className="btn-ghost" onClick={() => navigate("/login")}>
            Login
          </button>
          <button type="button" className="btn-primary" onClick={() => navigate("/register")}>
            Get started
          </button>
        </div>
      </header>

      <main id="top" className="landing-main landing-shell">
        <section className="hero">
          <div className="hero-copy">
            <span className="section-kicker">
              <Sparkles size={16} />
              Career workspace
            </span>
            <h1>Build skill into proof.</h1>
            <p>
              CodeCraft brings practice, roadmaps, portfolios, jobs, and hackathons into one
              role-aware workspace for students, recruiters, and organizers.
            </p>

            <div className="hero-actions">
              <button type="button" className="btn-primary hero-button" onClick={() => navigate("/register")}>
                Create account
                <ArrowRight size={18} />
              </button>
              <button type="button" className="btn-secondary hero-button" onClick={() => navigate("/login")}>
                Sign in
              </button>
            </div>

            <div className="hero-trust">
              <CheckCircle2 size={18} />
              <span>Roadmaps, practice, jobs, and events connected by role.</span>
            </div>

            <div className="hero-pill-row">
              <span>AI mentor</span>
              <span>GitHub signal</span>
              <span>Hackathons</span>
            </div>
          </div>

          <div className="hero-visual-column">
            <div className="hero-visual-card">
              <div className="visual-header">
                <div className="visual-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <span className="visual-label">Student dashboard</span>
              </div>

              <div className="visual-body">
                <aside className="visual-sidebar">
                  {[
                    { icon: LayoutDashboard, label: "Home", active: true },
                    { icon: Code2, label: "Practice" },
                    { icon: Map, label: "Roadmap" },
                    { icon: BriefcaseBusiness, label: "Jobs" },
                  ].map(({ icon: Icon, label, active }) => (
                    <span key={label} className={`sidebar-item${active ? " active" : ""}`}>
                      {createElement(Icon, { size: 20 })}
                      {label}
                    </span>
                  ))}
                </aside>

                <div className="visual-main">
                  <div className="visual-top-grid">
                    <article className="mini-stat-card highlighted">
                      <span>Readiness</span>
                      <strong>82%</strong>
                      <p>Portfolio, practice, and job progress are moving together.</p>
                      <div className="progress-track">
                        <span style={{ width: "82%" }} />
                      </div>
                    </article>

                    <article className="mini-stat-card">
                      <span>Streak</span>
                      <strong>14d</strong>
                      <p>Daily practice keeps the profile story current.</p>
                      <div className="progress-track">
                        <span style={{ width: "68%" }} />
                      </div>
                    </article>
                  </div>

                  <article className="lesson-card">
                    <div className="lesson-card-head">
                      <div>
                        <span className="panel-label">Today</span>
                        <h3>Dynamic programming practice</h3>
                      </div>
                      <span className="panel-chip">Medium</span>
                    </div>
                    <div className="code-preview">
                      <span>const solve = (state) =&gt; memo[state] ?? next(state);</span>
                      <span>return buildSignal(projects, practice, jobs);</span>
                    </div>
                    <div className="tag-row">
                      <span>Portfolio ready</span>
                      <span>Mentor reviewed</span>
                    </div>
                  </article>

                  <div className="visual-bottom-grid">
                    <article className="project-checklist">
                      <span className="panel-label">Proof</span>
                      <ul>
                        <li><CheckCircle2 size={17} /> GitHub project synced</li>
                        <li><CheckCircle2 size={17} /> Resume profile updated</li>
                        <li><CheckCircle2 size={17} /> Job match improved</li>
                      </ul>
                    </article>

                    <article className="support-card">
                      <span className="panel-label">Mentor</span>
                      <div className="support-row">
                        <Bot size={18} />
                        <div>
                          <strong>Next best step</strong>
                          <p>Ship one portfolio card from today&apos;s practice result.</p>
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>

              <span className="floating-pill floating-pill-top">Career fit +18%</span>
              <span className="floating-pill floating-pill-bottom">3 active job paths</span>
            </div>
          </div>
        </section>

        <section id="platform" className="content-section">
          <div className="section-heading centered">
            <span className="section-kicker">Platform</span>
            <h2>One workspace for the whole career loop.</h2>
            <p>Every role gets tools that feel specific without splitting the experience apart.</p>
          </div>

          <div className="card-grid card-grid-four">
            {ROLE_CARDS.map(({ icon: Icon, title, text, meta, accent }) => (
              <article key={title} className={`info-card ${accent}`}>
                <span className="info-card-icon">{createElement(Icon, { size: 22 })}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="card-meta">
                  <span>{meta}</span>
                  <button type="button" className="text-link" onClick={() => navigate("/register")}>
                    Join
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="workflow" className="content-section">
          <div className="section-heading">
            <span className="section-kicker">Workflow</span>
            <h2>From learning work to visible outcomes.</h2>
            <p>CodeCraft keeps the next task close, whether that means solving, applying, hiring, or organizing.</p>
          </div>

          <div className="steps-row">
            {STEPS.map((step, index) => (
              <article key={step.title} className="step-card">
                <span className="step-number">Step {index + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="outcomes" className="content-section">
          <div className="results-panel">
            <div className="section-heading results-heading centered">
              <span className="section-kicker">Outcomes</span>
              <h2>Progress that can be read quickly.</h2>
              <p>Dashboards turn work into practical signals for learners, teams, and hiring flows.</p>
            </div>

            <div className="results-grid">
              <article className="result-card">
                <strong>6+</strong>
                <span>Connected modules</span>
                <p>Practice, roadmaps, portfolios, jobs, mentor, and hackathons.</p>
              </article>
              <article className="result-card">
                <strong>3</strong>
                <span>Role dashboards</span>
                <p>Students, recruiters, and organizers each get a focused home.</p>
              </article>
              <article className="result-card">
                <strong>1</strong>
                <span>Career story</span>
                <p>Learning activity becomes profile evidence without extra ceremony.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="roles" className="content-section">
          <div className="section-heading centered">
            <span className="section-kicker">Roles</span>
            <h2>Built for repeated daily work.</h2>
            <p>Compact tools, clear state, and practical flows keep the product useful after the first login.</p>
          </div>

          <div className="card-grid card-grid-three compact-grid">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="feature-card">
                <span className="feature-icon">{createElement(Icon, { size: 22 })}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>

          <div className="card-grid card-grid-three compact-grid" style={{ marginTop: 20 }}>
            {SKILLS.map(({ icon: Icon, title, text }) => (
              <article key={title} className="skill-card">
                <div className="skill-card-top">
                  <span className="skill-icon">{createElement(Icon, { size: 22 })}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-panel">
          <span className="section-kicker">Start building</span>
          <h2>Open your CodeCraft workspace.</h2>
          <p>Create an account for your role and move straight into the dashboard designed for it.</p>
          <button type="button" className="btn-primary cta-button" onClick={() => navigate("/register")}>
            Get started
            <ArrowRight size={18} />
          </button>
        </section>
      </main>

      <footer className="landing-footer landing-shell">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <img src="/logo.png" alt="CodeCraft logo" />
              <span>CodeCraft</span>
            </div>
            <p>Practice, portfolio, jobs, and hackathons in one role-aware career workspace.</p>
          </div>

          <div className="footer-links">
            {[
              ["Students", "Practice", "Roadmap", "Portfolio"],
              ["Recruiters", "Jobs", "Applicants", "Company profile"],
              ["Organizers", "Hackathons", "Participants", "Events"],
              ["Account", "Login", "Register", "Mentor"],
            ].map(([heading, ...links]) => (
              <div key={heading} className="footer-column">
                <h3>{heading}</h3>
                {links.map((link) => (
                  <span key={link}>{link}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
