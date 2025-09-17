import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import API from "../../api/api";
import { sanitizeFormData } from "../../utils/sanitize";
import "./AuthPage.scss";
import { TEXT } from "../../localization/text";
import { VisibilityIcon, VisibilityOffIcon } from "../../components/SvgIcons";

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
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

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
              {TEXT.auth.loginTab}
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
              {TEXT.auth.registerTab}
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
                <h2 className="auth-form__title">{TEXT.auth.loginTitle}</h2>
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
                  <label className="auth-form__label" htmlFor="login-email">{TEXT.auth.emailLabel}</label>
                </div>
                <div className={`auth-form__group auth-form__group--with-toggle${loginForm.password ? " auth-form__group--filled" : ""}`}>
                  <input
                    className="auth-form__input"
                    id="login-password"
                    name="password"
                    type={showLoginPassword ? "text" : "password"}
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    aria-required="true"
                    autoComplete="current-password"
                    required
                  />
                  <label className="auth-form__label" htmlFor="login-password">{TEXT.auth.passwordLabel}</label>
                  <button
                    type="button"
                    className="auth-form__toggle"
                    onClick={() => setShowLoginPassword(prev => !prev)}
                    aria-label={showLoginPassword ? TEXT.auth.hidePassword : TEXT.auth.showPassword}
                    aria-pressed={showLoginPassword}
                  >
                    {showLoginPassword ? (
                      <VisibilityOffIcon className="auth-form__toggle-icon" aria-hidden="true" />
                    ) : (
                      <VisibilityIcon className="auth-form__toggle-icon" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <button className="auth-form__button" type="submit" aria-label={TEXT.auth.loginTab} disabled={loading}>
                  {TEXT.auth.loginTab}
                  {loading && <span className="auth-form__spinner" />}
                </button>
              </form>
              <div className="auth-social">
                <div className="auth-social__divider"><span>{TEXT.auth.or}</span></div>
                <button
                  className="auth-social__button auth-social__button--google"
                  type="button"
                  onClick={() => {
                    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/google`;
                  }}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="auth-social__icon" />
                  {TEXT.auth.continueWithGoogle}
                </button>
                <button
                  className="auth-social__button auth-social__button--facebook"
                  type="button"
                  onClick={() => {
                    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/facebook`;
                  }}
                >
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="auth-social__icon" />
                  {TEXT.auth.continueWithFacebook}
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
                <h2 className="auth-form__title">{TEXT.auth.registerTitle}</h2>
                <div className="auth-form__row">
                  <div className={`auth-form__group${registerForm.firstName ? " auth-form__group--filled" : ""}`}>
                    <input
                      className="auth-form__input"
                      id="register-first-name"
                      name="firstName"
                      value={registerForm.firstName}
                      onChange={handleRegisterChange}
                      aria-required="true"
                      autoComplete="given-name"
                      required
                    />
                    <label className="auth-form__label" htmlFor="register-first-name">{TEXT.auth.firstNameLabel}</label>
                  </div>
                  <div className={`auth-form__group${registerForm.lastName ? " auth-form__group--filled" : ""}`}>
                    <input
                      className="auth-form__input"
                      id="register-last-name"
                      name="lastName"
                      value={registerForm.lastName}
                      onChange={handleRegisterChange}
                      aria-required="true"
                      autoComplete="family-name"
                      required
                    />
                    <label className="auth-form__label" htmlFor="register-last-name">{TEXT.auth.lastNameLabel}</label>
                  </div>
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
                  <label className="auth-form__label" htmlFor="register-email">{TEXT.auth.emailLabel}</label>
                </div>
                <div className={`auth-form__group auth-form__group--with-toggle${registerForm.password ? " auth-form__group--filled" : ""}`}>
                  <input
                    className="auth-form__input"
                    id="register-password"
                    name="password"
                    type={showRegisterPassword ? "text" : "password"}
                    value={registerForm.password}
                    onChange={handleRegisterChange}
                    aria-required="true"
                    autoComplete="new-password"
                    required
                  />
                  <label className="auth-form__label" htmlFor="register-password">{TEXT.auth.passwordLabel}</label>
                  <button
                    type="button"
                    className="auth-form__toggle"
                    onClick={() => setShowRegisterPassword(prev => !prev)}
                    aria-label={showRegisterPassword ? TEXT.auth.hidePassword : TEXT.auth.showPassword}
                    aria-pressed={showRegisterPassword}
                  >
                    {showRegisterPassword ? (
                      <VisibilityOffIcon className="auth-form__toggle-icon" aria-hidden="true" />
                    ) : (
                      <VisibilityIcon className="auth-form__toggle-icon" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <button className="auth-form__button" type="submit" aria-label={TEXT.auth.registerTab} disabled={loading}>
                  {TEXT.auth.registerTab}
                  {loading && <span className="auth-form__spinner" />}
                </button>
              </form>
              <div className="auth-social">
                <div className="auth-social__divider"><span>{TEXT.auth.or}</span></div>
                <button className="auth-social__button auth-social__button--google" onClick={() => alert(TEXT.auth.googleComingSoon)}>
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="auth-social__icon" />
                  {TEXT.auth.continueWithGoogle}
                </button>
                <button className="auth-social__button auth-social__button--facebook" onClick={() => alert(TEXT.auth.facebookComingSoon)}>
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="auth-social__icon" />
                  {TEXT.auth.continueWithFacebook}
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
