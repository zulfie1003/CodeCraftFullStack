import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: "AI-guided workflow",
    text: "Keep roadmaps, mentor support, and coding practice moving together.",
  },
  {
    icon: Target,
    title: "Progress with proof",
    text: "Turn daily work into visible project, GitHub, and portfolio signals.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Career-ready output",
    text: "Connect your learning flow directly to jobs, roles, and applications.",
  },
];

function AuthShowcase({
  badge,
  title,
  description,
  metrics = [],
  onBack,
  footerLabel,
  onFooterClick,
}) {
  return (
    <section className="auth-showcase">
      <button type="button" className="auth-back-link" onClick={onBack}>
        <ArrowLeft size={16} />
        Back to home
      </button>

      <div className="auth-showcase-card">
        <div className="auth-showcase-badge">
          <Sparkles size={16} />
          <span>{badge}</span>
        </div>

        <h1>{title}</h1>
        <p className="auth-showcase-copy">{description}</p>

        <div className="auth-metric-grid">
          {metrics.map((metric) => (
            <article key={`${metric.label}-${metric.value}`} className="auth-metric-card">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </article>
          ))}
        </div>

        <div className="auth-showcase-highlights">
          {HIGHLIGHTS.map(({ icon: Icon, title: itemTitle, text }) => (
            <article key={itemTitle} className="auth-highlight-card">
              <span className="auth-highlight-icon">
                <Icon size={18} />
              </span>
              <h3>{itemTitle}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>

        {footerLabel && onFooterClick ? (
          <button type="button" className="auth-showcase-link" onClick={onFooterClick}>
            <ShieldCheck size={16} />
            <span>{footerLabel}</span>
            <ArrowRight size={16} />
          </button>
        ) : null}
      </div>

      <div className="auth-floating-pill auth-floating-pill-top">
        <span className="auth-floating-label">Career Fit</span>
        <strong>82%</strong>
        <p>Track job readiness with the same workflow you use to learn.</p>
      </div>

      <div className="auth-floating-pill auth-floating-pill-bottom">
        <span className="auth-floating-label">Live Signal</span>
        <strong>GitHub + Practice</strong>
        <p>One profile story from coding streaks to portfolio proof.</p>
      </div>
    </section>
  );
}

export default AuthShowcase;
