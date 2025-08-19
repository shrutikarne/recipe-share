import React, { useState } from "react";
import API from "../api/api";
import "./Login.css";

/**
 * Login component
 * Renders a login form and handles user authentication with the backend API.
 */

function Login() {
  /**
   * State for the login form fields
   */
  const [form, setForm] = useState({ email: "", password: "" });

  /**
   * Handles changes to the input fields
   * @param {object} e - The input change event
   */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /**
   * Handles form submission, sends login data to backend
   * @param {object} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      alert("Logged in successfully!");
    } catch (err) {
      alert(err.response?.data?.msg || "Error logging in");
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
      />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        placeholder="Password"
        onChange={handleChange}
      />
      <button type="submit">Login</button>
    </form>
  );
}

/**
 * Exports the Login component for use in the app
 */
export default Login;
// client/src/pages/Login.js
// This page allows users to log in and receive a token from the backend
