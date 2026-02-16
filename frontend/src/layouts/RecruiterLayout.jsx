import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { ThemeProvider, ThemeContext } from "../context/ThemeContext";
import "../styles/recruiter.css";
import "../styles/theme.css";

const RecruiterLayoutContent = ({ children }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

    const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  navigate("/");
};

  return (
    <div className="rec-layout">
      {/* OVERLAY (mobile) */}
      {open && <div className="rec-overlay" onClick={() => setOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`rec-sidebar ${open ? "open" : ""}`}>
        <h2 className="rec-logo">Recruiter</h2>

        <nav className="rec-nav">
          <Link
            className={location.pathname === "/recruiter" ? "active" : ""}
            to="/recruiter"
            onClick={() => setOpen(false)}
          >
            📊 Dashboard
          </Link>

          <Link
            className={location.pathname.includes("post-job") ? "active" : ""}
            to="/recruiter/post-job"
            onClick={() => setOpen(false)}
          >
            ➕ Post Job
          </Link>

          <Link
            className={location.pathname.includes("jobs") ? "active" : ""}
            to="/recruiter/jobs"
            onClick={() => setOpen(false)}
          >
            💼 My Jobs
          </Link>

          <Link
            className={location.pathname.includes("applicants") ? "active" : ""}
            to="/recruiter/applicants"
            onClick={() => setOpen(false)}
          >
            👥 Applicants
          </Link>

          <Link
            className={location.pathname.includes("company") ? "active" : ""}
            to="/recruiter/company"
            onClick={() => setOpen(false)}
          >
            🏢 Company Profile
          </Link>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="rec-main">
        {/* HEADER */}
        <header className="rec-header">
          <button className="hamburger" onClick={() => setOpen(true)}>
            ☰
          </button>

          <span>Welcome, Recruiter</span>

          <div className="navbar-actions">
            <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="logout-btn" onClick={logout}>Logout</button>
          </div>
        </header>

        {/* CONTENT */}
        <div className="rec-content">{children}</div>
      </div>
    </div>
  );
};

const RecruiterLayout = ({ children }) => {
  return (
    <ThemeProvider>
      <RecruiterLayoutContent>{children}</RecruiterLayoutContent>
    </ThemeProvider>
  );
};

export default RecruiterLayout;
