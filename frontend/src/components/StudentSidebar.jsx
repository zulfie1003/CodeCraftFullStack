import { NavLink } from "react-router-dom";

function StudentSidebar({ open, setOpen }) {
  return (
    <>
      {/* overlay for mobile */}
      {open && <div className="sd-overlay" onClick={() => setOpen(false)} />}

      <aside className={`sd-sidebar ${open ? "open" : ""}`}>
        <h2 className="sd-logo">CodeCraft</h2>

        <nav>
          <NavLink to="/student" end>Dashboard</NavLink>
          <NavLink to="/student/Hackathons">Hackathons</NavLink>
          <NavLink to="/student/Mentor">AI Mentor</NavLink>
         <NavLink to="/student/roadmap">Roadmap</NavLink>
          <NavLink to="/student/practice">Practice</NavLink>
          {/* <NavLink to="/student/projects">Projects</NavLink> */}
          <NavLink to="/student/jobs">Jobs</NavLink>
          <NavLink to="/student/profile">Profile</NavLink>
        </nav>
      </aside>
    </>
  );
}

export default StudentSidebar;
