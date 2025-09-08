import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../api/api";
import { sanitizeFormData } from "../../utils/sanitize";
import "./AuthPage.scss";

/**
 * AuthPage component
 * Combines Login and Register forms with tab switching.
 * @component
 * @returns {JSX.Element}
 */
function AuthPage() {
  const navigate = useNavigate();
  // --- State ---
  const [tab, setTab] = useState("login"); // 'login' or 'register'
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    try {
      // Sanitize form data before submission
      const sanitizedForm = sanitizeFormData(loginForm);
      const res = await API.post("/auth/login", sanitizedForm);
      // With HTTP-only cookies, we don't have access to the token directly
      // Instead, we'll use our session-based authentication tracking
      import("../../utils/tokenManager").then(({ setAuthenticated }) => {
        setAuthenticated(res.data.userId, res.data.expiresIn);
        toast.success("Login successful! 🎉");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 1200);
      });
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error logging in");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles register form submission.
   * @param {React.FormEvent} e
   */
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sanitize form data before submission
      const sanitizedForm = sanitizeFormData(registerForm);
      await API.post("/auth/register", sanitizedForm);
      toast.success("Registered successfully! Please login.");
      setTab("login"); // Switch to login tab
    } catch (err) {
      toast.error(err.response?.data?.msg || "Error registering");
    } finally {
      setLoading(false);
    }
  };

  // --- Render logic (modern split screen) ---
  return (
    <div className="auth-page">
      <div className="auth-page__left" aria-hidden="true" />
      <div className="auth-page__right">
        <div className="auth-card">
          <div
            className="auth-page__tabs"
            role="tablist"
            aria-label="Authentication tabs"
          >
            <button
              className={`auth-page__tab${tab === "login" ? " auth-page__tab--active" : ""}`}
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
              className={`auth-page__tab${tab === "register" ? " auth-page__tab--active" : ""}`}
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
            <>
              <form
                className="auth-form"
                onSubmit={handleLoginSubmit}
                aria-labelledby="login-tab"
                id="login-panel"
                role="tabpanel"
                tabIndex={0}
              >
                <h2 className="auth-form__title">Login</h2>
                <div className={`auth-form__group${loginForm.email ? " auth-form__group--filled" : ""}`}>
                  <input
                    className="auth-form__input"
                    id="login-email"
                    name="email"
                    value={loginForm.email}
                    onChange={handleLoginChange}
                    aria-required="true"
                    autoComplete="username"
                    required
                  />
                  <label className="auth-form__label" htmlFor="login-email">Email</label>
                </div>
                <div className={`auth-form__group${loginForm.password ? " auth-form__group--filled" : ""}`}>
                  <input
                    className="auth-form__input"
                    id="login-password"
                    name="password"
                    type="password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    aria-required="true"
                    autoComplete="current-password"
                    required
                  />
                  <label className="auth-form__label" htmlFor="login-password">Password</label>
                </div>
                <button className="auth-form__button" type="submit" aria-label="Login" disabled={loading}>
                  Login
                  {loading && <span className="auth-form__spinner" />}
                </button>
              </form>
              <div className="auth-social">
                <div className="auth-social__divider"><span>or</span></div>
                <button
                  className="auth-social__button auth-social__button--google"
                  type="button"
                  onClick={() => {
                    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/google`;
                  }}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="auth-social__icon" />
                  Continue with Google
                </button>
                <button
                  className="auth-social__button auth-social__button--facebook"
                  type="button"
                  onClick={() => {
                    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/facebook`;
                  }}
                >
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="auth-social__icon" />
                  Continue with Facebook
                </button>
              </div>
            </>
          ) : (
            <>
              <form
                className="auth-form auth-form--register"
                onSubmit={handleRegisterSubmit}
                aria-labelledby="register-tab"
                id="register-panel"
                role="tabpanel"
                tabIndex={0}
              >
                <h2 className="auth-form__title">Register</h2>
                <div className={`auth-form__group${registerForm.name ? " auth-form__group--filled" : ""}`}>
                  <input
                    className="auth-form__input"
                    id="register-name"
                    name="name"
                    value={registerForm.name}
                    onChange={handleRegisterChange}
                    aria-required="true"
                    autoComplete="name"
                    required
                  />
                  <label className="auth-form__label" htmlFor="register-name">Name</label>
                </div>
                <div className={`auth-form__group${registerForm.email ? " auth-form__group--filled" : ""}`}>
                  <input
                    className="auth-form__input"
                    id="register-email"
                    name="email"
                    value={registerForm.email}
                    onChange={handleRegisterChange}
                    aria-required="true"
                    autoComplete="email"
                    required
                  />
                  <label className="auth-form__label" htmlFor="register-email">Email</label>
                </div>
                <div className={`auth-form__group${registerForm.password ? " auth-form__group--filled" : ""}`}>
                  <input
                    className="auth-form__input"
                    id="register-password"
                    name="password"
                    type="password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    aria-required="true"
                    autoComplete="new-password"
                    required
                  />
                  <label className="auth-form__label" htmlFor="register-password">Password</label>
                </div>
                <button className="auth-form__button" type="submit" aria-label="Register" disabled={loading}>
                  Register
                  {loading && <span className="auth-form__spinner" />}
                </button>
              </form>
              <div className="auth-social">
                <div className="auth-social__divider"><span>or</span></div>
                <button className="auth-social__button auth-social__button--google" onClick={() => alert('Google login coming soon!')}>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="auth-social__icon" />
                  Continue with Google
                </button>
                <button className="auth-social__button auth-social__button--facebook" onClick={() => alert('Facebook login coming soon!')}>
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="auth-social__icon" />
                  Continue with Facebook
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
