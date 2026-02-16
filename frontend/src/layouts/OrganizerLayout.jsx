// src/pages/organizer/OrganizerLayout.jsx
import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { ThemeProvider, ThemeContext } from "../context/ThemeContext";
import "../styles/organizer.css";
import "../styles/theme.css";

const OrganizerLayoutContent = ({ children }) => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

 const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  navigate("/");
};

  return (
    <>
      {open && <div className="org-overlay" onClick={() => setOpen(false)} />}

      <div className="org-layout">
        {/* SIDEBAR */}
        <aside className={`org-sidebar ${open ? "open" : ""}`}>
          <h2 className="org-logo">Organizer</h2>

          <nav>
            <Link onClick={() => setOpen(false)} to="/organizer" className={location.pathname === "/organizer" ? "active" : ""}>
              📊 Dashboard
            </Link>
            <Link onClick={() => setOpen(false)} to="/organizer/create">
              ➕ Create Hackathon
            </Link>
            <Link onClick={() => setOpen(false)} to="/organizer/hackathons">
              🏆 My Hackathons
            </Link>
            <Link onClick={() => setOpen(false)} to="/organizer/participants">
              👥 Participants
            </Link>
            <Link onClick={() => setOpen(false)} to="/organizer/profile">
              🏢 Profile
            </Link>
          </nav>
        </aside>

        {/* MAIN */}
        <div className="org-main">
          <header className="org-header">
            <button className="hamburger" onClick={() => setOpen(true)}>
              ☰
            </button>
            <span>Welcome, Organizer</span>
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
