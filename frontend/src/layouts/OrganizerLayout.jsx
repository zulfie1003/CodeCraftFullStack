// src/pages/organizer/OrganizerLayout.jsx
import { useState, useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { ThemeProvider, ThemeContext } from "../context/ThemeContext";
import "../styles/organizer.css";
import "../styles/theme.css";
import { clearStoredAuth, getStoredUser } from "../utils/auth";

const OrganizerLayoutContent = ({ children }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const user = getStoredUser();

  const logout = () => {
    clearStoredAuth();
    navigate("/");
  };

  return (
    <>
      {open && <div className="org-overlay" onClick={() => setOpen(false)} />}

      <div className="org-layout">
        {/* SIDEBAR */}
        <aside className={`org-sidebar ${open ? "open" : ""}`}>
          <div className="org-logo">
            <img src="/logo.png" alt="CodeCraft Logo" />
            <div className="org-logo-copy">
              <strong>CodeCraft</strong>
              <span>Organizer</span>
            </div>
          </div>

          <nav>
            <NavLink onClick={() => setOpen(false)} to="/organizer/dashboard">
              Dashboard
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/organizer/create">
              Create Hackathon
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/organizer/hackathons">
              My Hackathons
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/organizer/participants">
              Participants
            </NavLink>
            <NavLink onClick={() => setOpen(false)} to="/organizer/profile">
              Profile
            </NavLink>
          </nav>
        </aside>

        {/* MAIN */}
        <div className="org-main">
          <header className="org-header">
            <button className="hamburger" onClick={() => setOpen(true)}>
              ☰
            </button>
            <span>
              {user?.name ? `${user.name} • Organizer Workspace` : "Organizer Workspace"}
            </span>
            <div className="navbar-actions">
              <button className="theme-toggle" onClick={toggleTheme} title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="logout-btn" onClick={logout}>Logout</button>
            </div>
          </header>

          <div className="org-content">{children}</div>
        </div>
      </div>
    </>
  );
};

const OrganizerLayout = ({ children }) => {
  return (
    <ThemeProvider>
      <OrganizerLayoutContent>{children}</OrganizerLayoutContent>
    </ThemeProvider>
  );
};

export default OrganizerLayout;
