import React, { useState } from "react";
import API from "../api/api";

function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
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
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
// client/src/pages/Register.js
// Ensure the registration page is set up correctly to handle user registration