// Simple dark mode toggle button
import React from "react";

export default function DarkModeToggle({ dark, setDark }) {
  return (
    <button
      className="darkmode-toggle"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setDark((d) => !d)}
      style={{
        background: "none",
        border: "none",
        fontSize: 22,
        cursor: "pointer",
        color: dark ? "#facc15" : "#222",
        marginLeft: 16,
        transition: "color 0.2s"
      }}
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
