import React, { useState } from "react";
import API from "../../api/api";
import "./AuthPage.css";

/**
 * AuthPage component
 * Combines Login and Register forms with tab switching.
 * @component
 */
function AuthPage() {
  // --- State ---
  const [tab, setTab] = useState("login"); // 'login' or 'register'
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  // --- Handlers (in order of user flow) ---

  /**
   * Handles input changes for the login form.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleLoginChange = (e) =>
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });

  /**
   * Handles input changes for the register form.
   * @param {React.ChangeEvent<HTMLInputElement>} e
   */
  const handleRegisterChange = (e) =>
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });

  /**
   * Handles login form submission.
   * @param {React.FormEvent} e
   */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", loginForm);
      localStorage.setItem("token", res.data.token);
      alert("Logged in successfully!");
      window.location.href = "/"; // Reload to update navigation
    } catch (err) {
      alert(err.response?.data?.msg || "Error logging in");
    }
  };

  /**
   * Handles register form submission.
   * @param {React.FormEvent} e
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", registerForm);
      alert("Registered successfully! Please login.");
      setTab("login"); // Switch to login tab
    } catch (err) {
      alert(err.response?.data?.msg || "Error registering");
    }
  };

  // --- Render logic (in order of user flow) ---
  return (
    <div
      style={{
        maxWidth: 400,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        padding: 24,
      }}
    >
      <div
        style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}
      >
        <button
          onClick={() => setTab("login")}
          style={{
            flex: 1,
            padding: 10,
            background: tab === "login" ? "#1976d2" : "#eee",
            color: tab === "login" ? "#fff" : "#333",
            border: "none",
            borderRadius: "8px 0 0 8px",
            cursor: "pointer",
          }}
        >
          Login
        </button>
        <button
          onClick={() => setTab("register")}
          style={{
            flex: 1,
            padding: 10,
            background: tab === "register" ? "#ff9800" : "#eee",
            color: tab === "register" ? "#fff" : "#333",
            border: "none",
            borderRadius: "0 8px 8px 0",
            cursor: "pointer",
          }}
        >
          Register
        </button>
      </div>
      {tab === "login" ? (
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <h2>Login</h2>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            name="email"
            placeholder="Email"
            onChange={handleLoginChange}
          />
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleLoginChange}
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <form className="auth-form register" onSubmit={handleRegisterSubmit}>
          <h2>Register</h2>
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            name="name"
            placeholder="Name"
            onChange={handleRegisterChange}
          />
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            name="email"
            placeholder="Email"
            onChange={handleRegisterChange}
          />
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleRegisterChange}
          />
          <button type="submit">Register</button>
        </form>
      )}
    </div>
  );
}

export default AuthPage;
