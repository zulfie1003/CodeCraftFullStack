import { useContext } from "react";
import { Moon, Sun } from "lucide-react";
import { ThemeContext } from "../context/ThemeContext";

function PublicThemeToggle({ className = "" }) {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      type="button"
      className={`public-theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
      <span>{isDarkMode ? "Light" : "Dark"}</span>
    </button>
  );
}

export default PublicThemeToggle;
