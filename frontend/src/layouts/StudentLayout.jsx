import { useState } from "react";
import StudentSidebar from "../components/StudentSidebar";
import StudentNavbar from "../components/StudentNavbar";
import { ThemeProvider } from "../context/ThemeContext";
import "../styles/studentDashboard.css";
import "../styles/theme.css";

function StudentLayout({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="sd-layout">
        <StudentSidebar open={open} setOpen={setOpen} />

        <div className="sd-main">
          <StudentNavbar setOpen={setOpen} />
          {children}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default StudentLayout;
