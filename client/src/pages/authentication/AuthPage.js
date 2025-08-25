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
      <div
        className="auth-page__tabs"
        role="tablist"
        aria-label="Authentication tabs"
      >
        <button
          className={`auth-page__tab${
            tab === "login" ? " auth-page__tab--active" : ""
          }`}
          onClick={() => setTab("login")}
          role="tab"
          aria-selected={tab === "login"}
          aria-controls="login-panel"
          id="login-tab"
          tabIndex={tab === "login" ? 0 : -1}
        >
          Login
        </button>
        <button
          className={`auth-page__tab${
            tab === "register" ? " auth-page__tab--active" : ""
          }`}
          onClick={() => setTab("register")}
          role="tab"
          aria-selected={tab === "register"}
          aria-controls="register-panel"
          id="register-tab"
          tabIndex={tab === "register" ? 0 : -1}
        >
          Register
        </button>
      </div>
      {tab === "login" ? (
        <form
          className="auth-form"
          onSubmit={handleLoginSubmit}
          aria-labelledby="login-tab"
          id="login-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <h2 className="auth-form__title">Login</h2>
          <label
            className="auth-form__label visually-hidden"
            htmlFor="login-email"
          >
            Email
          </label>
          <input
            className="auth-form__input"
            id="login-email"
            name="email"
            placeholder="Email"
            onChange={handleLoginChange}
            aria-required="true"
            autoComplete="username"
          />
          <label
            className="auth-form__label visually-hidden"
            htmlFor="login-password"
          >
            Password
          </label>
          <input
            className="auth-form__input"
            id="login-password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleLoginChange}
            aria-required="true"
            autoComplete="current-password"
          />
          <button
            className="auth-form__button"
            type="submit"
            aria-label="Login"
          >
            Login
          </button>
        </form>
      ) : (
        <form
          className="auth-form auth-form--register"
          onSubmit={handleRegisterSubmit}
          aria-labelledby="register-tab"
          id="register-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <h2 className="auth-form__title">Register</h2>
          <label
            className="auth-form__label visually-hidden"
            htmlFor="register-name"
          >
            Name
          </label>
          <input
            className="auth-form__input"
            id="register-name"
            name="name"
            placeholder="Name"
            onChange={handleRegisterChange}
            aria-required="true"
            autoComplete="name"
          />
          <label
            className="auth-form__label visually-hidden"
            htmlFor="register-email"
          >
            Email
          </label>
          <input
            className="auth-form__input"
            id="register-email"
            name="email"
            placeholder="Email"
            onChange={handleRegisterChange}
            aria-required="true"
            autoComplete="email"
          />
          <label
            className="auth-form__label visually-hidden"
            htmlFor="register-password"
          >
            Password
          </label>
          <input
            className="auth-form__input"
            id="register-password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleRegisterChange}
            aria-required="true"
            autoComplete="new-password"
          />
          <button
            className="auth-form__button"
            type="submit"
            aria-label="Register"
          >
            Register
          </button>
        </form>
      )}
    </div>
  );
}

export default AuthPage;
