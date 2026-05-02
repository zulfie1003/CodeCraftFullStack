import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_REVEAL_SELECTORS = [
  ".page-intro",
  ".profile-page-header",
  ".profile-summary-card",
  ".profile-form-card",
  ".resume-box",
  ".project-card-v2",
  ".dashboard-action-card",
  ".stat-card",
  ".sd-card",
  ".sd-glass",
  ".dashboard-hero-card",
  ".dashboard-side-card",
  ".dashboard-panel",
  ".dashboard-stat-card",
  ".dashboard-profile-card",
  ".dashboard-platform-card",
  ".dashboard-repo-card",
  ".dashboard-skill-box",
  ".summary-card",
  ".job-card",
  ".sidebar-card",
  ".priority-card",
  ".mentor-card",
  ".booking-box",
  ".session-box",
  ".hackathon-card",
  ".glass-card",
  ".problem-card",
  ".module-tab",
  ".practice-resource-card",
  ".description-section",
  ".example-card",
  ".format-card",
  ".analysis-card",
  ".test-case-item",
  ".create-form",
  ".registration-form",
  ".applicant-card",
  ".team-editor-card",
  ".candidate-project-card",
  ".event-rule-box",
  ".auth-showcase-card",
  ".auth-metric-card",
  ".auth-highlight-card",
  ".auth-card",
  ".landing-page .hero-copy",
  ".landing-page .hero-visual-card",
  ".landing-page .content-section",
  ".landing-page .info-card",
  ".landing-page .feature-card",
  ".landing-page .skill-card",
  ".landing-page .testimonial-card",
  ".landing-page .step-card",
  ".landing-page .result-card",
  ".landing-page .results-panel",
  ".landing-page .cta-panel",
  ".landing-page .lesson-card",
  ".landing-page .mini-stat-card",
  ".landing-page .project-checklist",
  ".landing-page .support-card",
  ".landing-page .visual-sidebar",
];

function useScrollReveal(selectors = DEFAULT_REVEAL_SELECTORS) {
  const location = useLocation();

  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return undefined;
    }

    let observer;
    const frame = window.requestAnimationFrame(() => {
      const targets = Array.from(
        new Set(selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector))))
      );

      if (!targets.length) {
        return;
      }

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      targets.forEach((target, index) => {
        target.classList.add("reveal-on-scroll");
        target.style.setProperty("--reveal-delay", `${(index % 6) * 60}ms`);
      });

      if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
        targets.forEach((target) => target.classList.add("reveal-visible"));
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("reveal-visible");
            observer?.unobserve(entry.target);
          });
        },
        {
          threshold: 0.14,
          rootMargin: "0px 0px -12% 0px",
        }
      );

      targets.forEach((target) => observer.observe(target));
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, [location.pathname, location.search, selectors]);
}

export default useScrollReveal;
