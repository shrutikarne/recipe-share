import React, { useState } from "react";
import API from "../api/api";
import "./Register.css";

/**
 * Register component
 * Renders a registration form and handles user registration with the backend API.
 */

function Register() {
  /**
   * State for the registration form fields
   */
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  /**
   * Handles changes to the input fields
   * @param {object} e - The input change event
   */
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  /**
   * Handles form submission, sends registration data to backend
   * @param {object} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/register", form);
      localStorage.setItem("token", res.data.token);
      alert("Registered successfully!");
    } catch (err) {
      alert(err.response?.data?.msg || "Error registering");
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit}>
      <h2>Register</h2>
      <label htmlFor="name">Name</label>
      <input id="name" name="name" placeholder="Name" onChange={handleChange} />
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
      <button type="submit">Register</button>
    </form>
  );
}

/**
 * Exports the Register component for use in the app
 */
export default Register;
// client/src/pages/Register.js
// This page allows users to register and receive a token from the backend
