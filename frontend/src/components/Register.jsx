import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthShowcase from "./AuthShowcase";
import AuthRoleSelector from "./AuthRoleSelector";
import GoogleAuthButton from "./GoogleAuthButton";

import "../styles/auth.css";

const REGISTER_SHOWCASE = {
  badge: "Launch your CodeCraft workspace",
  title: "Start with a profile that already feels career-ready.",
  description:
    "Create your account, choose your role, and move into the same roadmap, practice, portfolio, and hiring flow from day one.",
  metrics: [
    { label: "Onboarding", value: "Role-Based" },
    { label: "Flow", value: "Learn + Apply" },
    { label: "Proof", value: "Projects + Sync" },
    { label: "Outcome", value: "Job Ready" },
  ],
};

const ROLE_OPTIONS = [
  {
    value: "student",
    label: "Student",
    description: "Create a learner profile for practice and placements.",
    registerTitle: "Create a student account",
    registerDescription: "Set up your student workspace for practice, projects, and jobs.",
  },
  {
    value: "recruiter",
    label: "Recruiter",
    description: "Set up hiring tools to post roles and review applicants.",
    registerTitle: "Create a recruiter account",
    registerDescription: "Build your recruiter workspace to post jobs and manage candidates.",
  },
  {
    value: "organizer",
    label: "Organizer",
    description: "Create an event workspace for hackathons and registrations.",
    registerTitle: "Create an organizer account",
    registerDescription: "Set up your organizer workspace for hackathons and participants.",
  },
];

function Register() {
  const navigate = useNavigate();

  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 🔥 reset
  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setConfirm("");
    setShowPassword(false);
    setShowConfirm(false);
  };

  const handleRoleChange = (r) => {
    setRole(r);
    resetForm(); // 👈 important
  };

  const getStrength = () => {
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  };

  const selectedRole = ROLE_OPTIONS.find((option) => option.value === role) || ROLE_OPTIONS[0];

  const handleRegister = async () => {
    if (!name || !email || !password || !confirm) {
      alert("All fields required");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
        role: role.toLowerCase(),
      });

      alert("Registration successful");
      resetForm();
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-layout">
        <AuthShowcase
          badge={REGISTER_SHOWCASE.badge}
          title={REGISTER_SHOWCASE.title}
          description={REGISTER_SHOWCASE.description}
          metrics={REGISTER_SHOWCASE.metrics}
          onBack={() => navigate("/")}
          footerLabel="Already have access? Sign in"
          onFooterClick={() => navigate("/login")}
        />

        <form className="auth-card" onSubmit={(e) => e.preventDefault()}>
          <div className="auth-card-brand">
            <img src="/logo.png" alt="CodeCraft Logo" />
            <div>
              <span>CodeCraft</span>
              <small>Create your workspace and start building career signal.</small>
            </div>
          </div>

          <div className="auth-card-content" key={role}>
            <span className="auth-form-tag">Create Account</span>
            <AuthRoleSelector
              label="Create account for"
              value={role}
              options={ROLE_OPTIONS}
              onChange={handleRoleChange}
            />

            <h2>{selectedRole.registerTitle}</h2>
            <p>{selectedRole.registerDescription}</p>

            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <span
                className="eye-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>

            {password && (
              <div className={`strength ${getStrength()}`}>
                {getStrength().toUpperCase()} PASSWORD
              </div>
            )}

            <div className="password-field">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
              />
              <span
                className="eye-btn"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? "🙈" : "👁️"}
              </span>
            </div>

            <button className="btn-primarys" onClick={handleRegister}>
              Create Account
            </button>

            <GoogleAuthButton role={role} intent="signup" />

            <p className="switch">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")}>
                Login
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
