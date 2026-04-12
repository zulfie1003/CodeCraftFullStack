import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";
import { clearStoredAuth, getStoredUser } from "../utils/auth";

function StudentNavbar({ setOpen }) {
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const user = getStoredUser();

  const logout = () => {
    clearStoredAuth();
    navigate("/");
  };

  return (
    <header className="sd-navbar">
      {/* HAMBURGER */}
      <button
        className="hamburger"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      <span className="sd-role">
        {user?.name ? `${user.name} • Student Workspace` : "Student Workspace"}
      </span>

      <div className="navbar-actions">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="logout" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}

export default StudentNavbar;
