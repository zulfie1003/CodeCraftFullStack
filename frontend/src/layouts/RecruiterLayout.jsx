import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { ThemeProvider, ThemeContext } from "../context/ThemeContext";
import "../styles/recruiter.css";
import "../styles/theme.css";
import { clearStoredAuth, getStoredUser } from "../utils/auth";

const RecruiterLayoutContent = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const user = getStoredUser();

  const logout = () => {
    clearStoredAuth();
    navigate("/");
  };

  return (
    <div className="rec-layout">
      {/* OVERLAY (mobile) */}
      {open && <div className="rec-overlay" onClick={() => setOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`rec-sidebar ${open ? "open" : ""}`}>
        <div className="rec-logo">
          <img src="/logo.png" alt="CodeCraft Logo" />
          <div className="rec-logo-copy">
            <strong>CodeCraft</strong>
            <span>Recruiter</span>
          </div>
        </div>

        <nav className="rec-nav">
          <NavLink
            end
            to="/recruiter/dashboard"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/recruiter/post-job"
            onClick={() => setOpen(false)}
          >
            Post Job
          </NavLink>

          <NavLink
            to="/recruiter/jobs"
            onClick={() => setOpen(false)}
          >
            My Jobs
          </NavLink>

          <NavLink
            to="/recruiter/applicants"
            onClick={() => setOpen(false)}
          >
            Applicants
          </NavLink>

          <NavLink
            to="/recruiter/company"
            onClick={() => setOpen(false)}
          >
            Company Profile
          </NavLink>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="rec-main">
        {/* HEADER */}
        <header className="rec-header">
          <button className="hamburger" onClick={() => setOpen(true)}>
            ☰
          </button>

          <span>
            {user?.name ? `${user.name} • Recruiter Workspace` : "Recruiter Workspace"}
          </span>

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
