import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

import "../styles/auth.css";

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

//   const handleRegister = async () => {

//   if (password !== confirm) {
//     alert("Passwords do not match");
//     return;
//   }

//   try {
//     const res = await api.post("/auth/register", {
//       name,
//       email,
//       password,
//       role:role.toLowerCase()
//     });

//     alert(res.data.message);
//     navigate("/login");

//   } catch (err) {
//     alert(err.response?.data?.message || "Registration failed");
//   }
// };

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
    const res = await api.post("/auth/register", {
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
      <form className="auth-card" onSubmit={(e) => e.preventDefault()}>

        <h2>Create Account</h2>
        <p>Select your role to get started</p>

        {/* ROLE SELECT */}
        <div className="role-switch">
          {["student", "recruiter", "organizer"].map((r) => (
            <button
              key={r}
              className={role === r ? "active" : ""}
              onClick={() => handleRoleChange(r)}
              type="button"
            >
               {/* {r.charAt(0).toUpperCase() + r.slice(1)} */}
              {r}
           
            </button>
          ))}
        </div>

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

        {/* PASSWORD WITH EYE */}
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

        {/* PASSWORD STRENGTH */}
        {password && (
          <div className={`strength ${getStrength()}`}>
            {getStrength().toUpperCase()} PASSWORD
          </div>
        )}

        {/* CONFIRM PASSWORD WITH EYE */}
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

        <button className="btn-primarys"  onClick={handleRegister}>Create Account</button>

        <p className="switch">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>
            Login
          </span>
        </p>

      </form>
    </div>
  );
}

export default Register;
