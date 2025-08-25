import React, { useState } from "react";
import API from "../../api/api";
import "./AuthPage.scss";

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
    <div className="auth-page">
      <div className="auth-page__tabs">
        <button
          className={`auth-page__tab${tab === "login" ? " auth-page__tab--active" : ""}`}
          onClick={() => setTab("login")}
        >
          Login
        </button>
        <button
          className={`auth-page__tab${tab === "register" ? " auth-page__tab--active" : ""}`}
          onClick={() => setTab("register")}
        >
          Register
        </button>
      </div>
      {tab === "login" ? (
        <form className="auth-form" onSubmit={handleLoginSubmit}>
          <h2 className="auth-form__title">Login</h2>
          <label className="auth-form__label" htmlFor="login-email">Email</label>
          <input
            className="auth-form__input"
            id="login-email"
            name="email"
            placeholder="Email"
            onChange={handleLoginChange}
          />
          <label className="auth-form__label" htmlFor="login-password">Password</label>
          <input
            className="auth-form__input"
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleLoginChange}
          />
          <button className="auth-form__button" type="submit">Login</button>
        </form>
      ) : (
        <form className="auth-form auth-form--register" onSubmit={handleRegisterSubmit}>
          <h2 className="auth-form__title">Register</h2>
          <label className="auth-form__label" htmlFor="register-name">Name</label>
          <input
            className="auth-form__input"
            id="register-name"
            name="name"
            placeholder="Name"
            onChange={handleRegisterChange}
          />
          <label className="auth-form__label" htmlFor="register-email">Email</label>
          <input
            className="auth-form__input"
            id="register-email"
            name="email"
            placeholder="Email"
            onChange={handleRegisterChange}
          />
          <label className="auth-form__label" htmlFor="register-password">Password</label>
          <input
            className="auth-form__input"
            id="register-password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleRegisterChange}
          />
          <button className="auth-form__button" type="submit">Register</button>
        </form>
      )}
    </div>
  );
}

export default AuthPage;
