import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Landing from "./components/Landing.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// ================= STUDENT =================
import Dashboard from "./pages/student/Dashboard.jsx";
import Practice from "./pages/student/Practice.jsx";
import Jobs from "./pages/student/Jobs.jsx";
import Profile from "./pages/student/Profile.jsx";
import Mentor from "./pages/student/Mentor.jsx";
import Roadmap from "./pages/student/Roadmap.jsx";
import Hackathons from "./pages/student/Hackathons.jsx";

// ================= RECRUITER =================
import RecruiterDashboard from "./pages/recruiter/Dashboard.jsx";
import MyJobs from "./pages/recruiter/MyJobs.jsx";
import PostJob from "./pages/recruiter/PostJob.jsx";
import Applicants from "./pages/recruiter/Applicants.jsx";
import CompanyProfile from "./pages/recruiter/CompanyProfile.jsx";

// ================= ORGANIZER =================
import OrganizerDashboard from "./pages/organizer/Dashboard.jsx";
import CreateHackathon from "./pages/organizer/CreateHackathon.jsx";
import OrganizerHackathons from "./pages/organizer/Hackathons.jsx";
import Participants from "./pages/organizer/Participants.jsx";
import OrganizerProfile from "./pages/organizer/OrganizerProfile.jsx";
import { getHomePathForRole, getStoredUser } from "./utils/auth";
import "./styles/light-mode-overrides.css";
import "./styles/interaction-system.css";

function FallbackRedirect() {
  const user = getStoredUser();

  if (user?.role) {
    return <Navigate to={getHomePathForRole(user.role)} replace />;
  }

  return <Navigate to="/" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= STUDENT ================= */}
        <Route element={<ProtectedRoute role="student" />}>
          <Route path="/student" element={<Navigate to="/student/dashboard" replace />} />
          <Route path="/student/dashboard" element={<Dashboard />} />
          <Route path="/student/practice" element={<Practice />} />
          <Route path="/student/jobs" element={<Jobs />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/hackathons" element={<Hackathons />} />
          <Route path="/student/roadmap" element={<Roadmap />} />
          <Route path="/student/mentor" element={<Mentor />} />
        </Route>

        {/* ================= RECRUITER ================= */}
        <Route element={<ProtectedRoute role="recruiter" />}>
          <Route path="/recruiter" element={<Navigate to="/recruiter/dashboard" replace />} />
          <Route path="/recruiter/dashboard" element={<RecruiterDashboard />} />
          <Route path="/recruiter/jobs" element={<MyJobs />} />
          <Route path="/recruiter/post-job" element={<PostJob />} />
          <Route path="/recruiter/applicants" element={<Applicants />} />
          <Route path="/recruiter/company" element={<CompanyProfile />} />
        </Route>

        {/* ================= ORGANIZER ================= */}
        <Route element={<ProtectedRoute role="organizer" />}>
          <Route path="/organizer" element={<Navigate to="/organizer/dashboard" replace />} />
          <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
          <Route path="/organizer/create" element={<CreateHackathon />} />
          <Route path="/organizer/hackathons" element={<OrganizerHackathons />} />
          <Route path="/organizer/participants" element={<Participants />} />
          <Route path="/organizer/profile" element={<OrganizerProfile />} />
        </Route>

        <Route path="*" element={<FallbackRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
