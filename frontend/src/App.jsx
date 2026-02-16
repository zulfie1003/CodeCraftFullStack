import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ================= STUDENT ================= */}


   <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <Dashboard />
            </ProtectedRoute>
          }
        />
          
        <Route path="/student/practice" element={<Practice />} />
        <Route path="/student/jobs" element={<Jobs />} />
        <Route path="/student/profile" element={<Profile />} />
        <Route path="/student/hackathons" element={<Hackathons />} />
        <Route path="/student/roadmap" element={<Roadmap />} />
        <Route path="/student/mentor" element={<Mentor />} />

        {/* ================= RECRUITER ================= */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/recruiter/jobs" element={<MyJobs />} />
        <Route path="/recruiter/post-job" element={<PostJob />} />
        <Route path="/recruiter/applicants" element={<Applicants />} />
        <Route path="/recruiter/company" element={<CompanyProfile />} />

        {/* ================= ORGANIZER ================= */}
        <Route
          path="/organizer"
          element={
            <ProtectedRoute role="organizer">
              <OrganizerDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/organizer/create" element={<CreateHackathon />} />
        <Route path="/organizer/hackathons" element={<OrganizerHackathons />} />
        <Route path="/organizer/participants" element={<Participants />} />
        <Route path="/organizer/profile" element={<OrganizerProfile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
