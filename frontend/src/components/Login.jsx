import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import AuthShowcase from "./AuthShowcase";
import AuthRoleSelector from "./AuthRoleSelector";
import GoogleAuthButton from "./GoogleAuthButton";
import PublicThemeToggle from "./PublicThemeToggle";
import useScrollReveal from "../hooks/useScrollReveal";
import { getHomePathForRole, storeAuthSession } from "../utils/auth";

import "../styles/auth.css";

const SHOWCASE_CONTENT = {
  login: {
    badge: "AI-first student workspace",
    title: "Step back into your growth system.",
    description:
      "Resume practice, refine your portfolio, and keep job-ready progress moving in one place.",
    metrics: [
      { label: "Workspace", value: "Unified" },
      { label: "Focus", value: "Practice + Jobs" },
      { label: "Signals", value: "GitHub Sync" },
      { label: "Momentum", value: "Daily Streaks" },
    ],
  },
  forgot: {
    badge: "Secure account recovery",
    title: "Recover access without losing momentum.",
    description:
      "Verify your account, reset your password, and get back to your roadmap with minimal friction.",
    metrics: [
      { label: "Recovery", value: "OTP Flow" },
      { label: "Security", value: "Protected" },
      { label: "Access", value: "Quick Reset" },
      { label: "Return", value: "Fast Re-entry" },
    ],
  },
  otp: {
    badge: "Identity check in progress",
    title: "Confirm the reset step.",
    description:
      "Enter the OTP and move directly into a fresh password without leaving the same flow.",
    metrics: [
      { label: "Verification", value: "6 Digits" },
      { label: "Expiry", value: "10 Minutes" },
      { label: "Flow", value: "Single Screen" },
      { label: "Next", value: "New Password" },
    ],
  },
  reset: {
    badge: "Fresh credentials",
    title: "Set a stronger password and continue.",
    description:
      "Finish the reset, re-enter your workspace, and pick up exactly where you paused.",
    metrics: [
      { label: "Reset", value: "Completed Here" },
      { label: "Focus", value: "Secure Login" },
      { label: "Return", value: "Same Workspace" },
      { label: "Goal", value: "Back to Building" },
    ],
  },
};

const ROLE_OPTIONS = [
  {
    value: "student",
    label: "Student",
    description: "Practice, roadmaps, projects, and job prep.",
    loginTitle: "Student login",
    loginDescription: "Continue your practice streak, roadmap progress, and job-ready flow.",
  },
  {
    value: "recruiter",
    label: "Recruiter",
    description: "Post jobs, review candidates, and manage hiring.",
    loginTitle: "Recruiter login",
    loginDescription: "Return to your hiring dashboard and review your latest applicants.",
  },
  {
    value: "organizer",
    label: "Organizer",
    description: "Run hackathons, manage participants, and track events.",
    loginTitle: "Organizer login",
    loginDescription: "Open your event workspace and continue managing hackathons.",
  },
];

function Login() {
  const navigate = useNavigate();
  useScrollReveal();

  const [mode, setMode] = useState("login");
  const [role, setRole] = useState("student");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // 🔥 reset function
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirm("");
    setOtp("");
    setShowPassword(false);
    setOtpSent(false);
  };

  const handleRoleChange = (r) => {
    setRole(r);
    resetForm();
  };

  const passwordStrength = () => {
    if (password.length < 6) return "weak";
    if (password.length < 10) return "medium";
    return "strong";
  };

  const showcaseContent = SHOWCASE_CONTENT[mode];
  const selectedRole = ROLE_OPTIONS.find((option) => option.value === role) || ROLE_OPTIONS[0];

  const handleLogin = async () => {
    if (loginLoading) {
      return;
    }

    try {
      setLoginLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
        role: role.toLowerCase()
      });

      storeAuthSession(res.data.data);

      alert("Login successful");

      // 🚀 role based redirect
      navigate(getHomePathForRole(res.data.data.user.role));

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  // ================= SEND OTP =================
  const handleForgot = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail) return alert("Enter email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return alert("Please enter a valid email");
    }

    try {
      setOtpLoading(true);
      console.log('📧 Sending OTP request for:', trimmedEmail);
      const res = await api.post("/auth/forgot-password", { email: trimmedEmail });
      console.log('✅ OTP Response:', res.data);
      alert(res.data.message);
      setOtpSent(true);
      setMode("otp"); // 👈 Go to OTP mode
    } catch (err) {
      console.error('❌ OTP Error:', err.response?.data);
      alert(err.response?.data?.message || "Error sending OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // ================= VERIFY OTP =================
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      return alert("Please enter a valid 6-digit OTP");
    }

    try {
      setOtpLoading(true);
      const res = await api.post("/auth/verify-otp", {
        email,
        otp
      });

      alert("OTP verified successfully");
      setResetToken(res.data.data.resetToken); // 👈 SAVE RESET TOKEN
      setMode("reset"); // 👈 Go to password reset mode
    } catch (err) {
      alert(err.response?.data?.message || "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // ================= RESET PASSWORD =================
  const handleResetPassword = async () => {
    if (password !== confirm)
      return alert("Passwords do not match");

    if (password.length < 6)
      return alert("Password must be at least 6 characters");

    try {
      const res = await api.post("/auth/reset-password", {
        email,
        password,
        resetToken
      });

      alert(res.data.message);
      resetForm();
      setMode("login");
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div className="auth-page">
      <PublicThemeToggle className="auth-theme-toggle" />
      <div className="auth-layout">
        <AuthShowcase
          badge={showcaseContent.badge}
          title={showcaseContent.title}
          description={showcaseContent.description}
          metrics={showcaseContent.metrics}
          onBack={() => navigate("/")}
          footerLabel="Create a new CodeCraft account"
          onFooterClick={() => navigate("/register")}
        />

        <form className="auth-card" onSubmit={(e) => e.preventDefault()}>
          <div className="auth-card-brand">
            <img src="/logo.png" alt="CodeCraft Logo" />
            <div>
              <span>CodeCraft</span>
              <small>Roadmaps, practice, portfolio, and jobs in one flow.</small>
            </div>
          </div>

          <div className="auth-card-content" key={mode}>
            {mode === "login" && (
              <>
                <span className="auth-form-tag">Secure Sign In</span>
                <AuthRoleSelector
                  label="Login as"
                  value={role}
                  options={ROLE_OPTIONS}
                  onChange={handleRoleChange}
                />

                <h2>{selectedRole.loginTitle}</h2>
                <p>{selectedRole.loginDescription}</p>

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />

                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                  <span
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                <div className="forgot">
                  <span onClick={() => { resetForm(); setMode("forgot"); }}>
                    Forgot password?
                  </span>
                </div>

                <button className="btn-primarys" onClick={handleLogin} disabled={loginLoading}>
                  <span className="auth-button-content">
                    {loginLoading && <span className="auth-spinner" aria-hidden="true" />}
                    <span>{loginLoading ? "Signing in..." : "Login"}</span>
                  </span>
                </button>

                <GoogleAuthButton role={role} intent="signin" />

                <p className="switch">
                  Don’t have an account?{" "}
                  <span onClick={() => navigate("/register")}>
                    Create Account
                  </span>
                </p>
              </>
            )}

            {mode === "forgot" && !otpSent && (
              <>
                <span className="auth-form-tag">Password Recovery</span>
                <h2>Forgot Password</h2>
                <p>Enter your registered email to receive an OTP.</p>

                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />

                <button
                  className="btn-primarys"
                  onClick={handleForgot}
                  disabled={otpLoading}
                >
                  {otpLoading ? "Sending OTP..." : "Send OTP"}
                </button>

                <p className="switch">
                  <span onClick={() => { resetForm(); setMode("login"); }}>
                    Back to Login
                  </span>
                </p>
              </>
            )}

            {mode === "otp" && otpSent && (
              <>
                <span className="auth-form-tag">OTP Verification</span>
                <h2>Verify OTP</h2>
                <p>
                  Enter the 6-digit OTP sent to <strong>{email}</strong>
                </p>

                <input
                  className="otp-input"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  autoComplete="off"
                  maxLength="6"
                />

                <div className="otp-note">OTP expires in 10 minutes</div>

                <button
                  className="btn-primarys"
                  onClick={handleVerifyOTP}
                  disabled={otpLoading}
                >
                  {otpLoading ? "Verifying..." : "Verify OTP"}
                </button>

                <p className="switch">
                  <span onClick={() => { resetForm(); setMode("forgot"); }}>
                    Didn&apos;t receive OTP? Send again
                  </span>
                </p>

                <p className="switch">
                  <span onClick={() => { resetForm(); setMode("login"); }}>
                    Back to Login
                  </span>
                </p>
              </>
            )}

            {mode === "reset" && (
              <>
                <span className="auth-form-tag">Create New Password</span>
                <h2>Reset Password</h2>
                <p>Create a new strong password for your account.</p>

                <div className="password-field">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                  <span
                    className="eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </span>
                </div>

                {password && (
                  <div className={`strength ${passwordStrength()}`}>
                    {passwordStrength().toUpperCase()} PASSWORD
                  </div>
                )}

                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                />

                <button className="btn-primarys" onClick={handleResetPassword}>
                  Save New Password
                </button>

                <p className="switch">
                  <span onClick={() => { resetForm(); setMode("login"); }}>
                    Back to Login
                  </span>
                </p>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
