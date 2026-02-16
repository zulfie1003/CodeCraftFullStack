import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import "../styles/auth.css";

function Login() {
  const navigate = useNavigate();

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

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        role: role.toLowerCase()
      });

      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("role", res.data.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      alert("Login successful");

      // 🚀 role based redirect
      if (res.data.data.user.role === "student") navigate("/student");
      if (res.data.data.user.role === "recruiter") navigate("/recruiter");
      if (res.data.data.user.role === "organizer") navigate("/organizer");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
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
      <form className="auth-card" onSubmit={(e) => e.preventDefault()}>

        {/* ================= LOGIN ================= */}
        {mode === "login" && (
          <>
            <h2>Welcome Back</h2>
            <p>Login to CodeCraft</p>

            <div className="role-switch">
              {["student", "recruiter", "organizer"].map((r) => (
                <button
                  key={r}
                  className={role === r ? "active" : ""}
                  onClick={() => handleRoleChange(r)}
                  type="button"
                >
                  {r}
                   {/* {r.charAt(0).toUpperCase() + r.slice(1)} */}
                </button>
              ))}
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            {/* PASSWORD WITH EYE */}
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

            <button className="btn-primarys" onClick={handleLogin}>Login</button>

            <p className="switch">
              Don’t have an account?{" "}
              <span onClick={() => navigate("/register")}>
                Create Account
              </span>
            </p>
          </>
        )}

        {/* ================= FORGOT PASSWORD - EMAIL ================= */}
        {mode === "forgot" && !otpSent && (
          <>
            <h2>Forgot Password</h2>
            <p>Enter your registered email to receive an OTP</p>

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

        {/* ================= OTP VERIFICATION ================= */}
        {mode === "otp" && otpSent && (
          <>
            <h2>Verify OTP</h2>
            <p>Enter the 6-digit OTP sent to <strong>{email}</strong></p>

            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              autoComplete="off"
              maxLength="6"
              style={{ letterSpacing: '8px', fontSize: '18px', textAlign: 'center' }}
            />

            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
              ⏱️ OTP expires in 10 minutes
            </div>

            <button
              className="btn-primarys"
              onClick={handleVerifyOTP}
              disabled={otpLoading}
            >
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="switch">
              <span onClick={() => { resetForm(); setMode("forgot"); }}>
                Didn't receive OTP? Send again
              </span>
            </p>

            <p className="switch">
              <span onClick={() => { resetForm(); setMode("login"); }}>
                Back to Login
              </span>
            </p>
          </>
        )}

        {/* ================= RESET PASSWORD ================= */}
        {mode === "reset" && (
          <>
            <h2>Reset Password</h2>
            <p>Create a new strong password</p>

            {/* NEW PASSWORD WITH EYE */}
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
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
              onChange={(e) => setConfirm(e.target.value)}
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

      </form>
    </div>
  );
}

export default Login;
