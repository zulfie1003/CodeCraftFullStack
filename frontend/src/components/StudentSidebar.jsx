import { NavLink } from "react-router-dom";

function StudentSidebar({ open, setOpen }) {
  return (
    <>
      {/* overlay for mobile */}
      {open && <div className="sd-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sd-sidebar ${open ? "open" : ""}`}>
        <div className="sd-logo">
          <img src="/logo.png" alt="CodeCraft Logo" />
          <span>CodeCraft</span>
        </div>

        <nav>
          <NavLink to="/student/dashboard">Dashboard</NavLink>
          <NavLink to="/student/hackathons">Hackathons</NavLink>
          <NavLink to="/student/mentor">AI Mentor</NavLink>
          <NavLink to="/student/roadmap">Roadmap</NavLink>
          <NavLink to="/student/practice">Practice</NavLink>
          <NavLink to="/student/jobs">Jobs</NavLink>
          <NavLink to="/student/profile">Profile</NavLink>
        </nav>
      </aside>
    </>
  );
}

export default StudentSidebar;
