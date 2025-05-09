"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setStatus("success");
      router.push("/login");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1e1e2d, #3a3f58)",
        padding: "2rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "linear-gradient(145deg, #2A244A, #3F3565)",
          border: "1px solid rgba(255, 77, 128, 0.5)",
          borderRadius: "10px",
          padding: "2rem",
          minWidth: "320px",
          maxWidth: "420px",
          width: "100%",
          color: "#fff",
          boxShadow: "0 0 10px rgba(255, 77, 128, 0.3)",
        }}
      >
        <h2 style={{ fontSize: 26, fontWeight: 600, textAlign: "center", marginBottom: 24 }}>
          Register
        </h2>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          <label>
            <span>Full Name</span>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              required
              placeholder="Your Name"
              style={inputStyle}
            />
          </label>

          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              style={inputStyle}
            />
          </label>

          <label>
            <span>Phone</span>
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="+1234567890"
              style={inputStyle}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              style={inputStyle}
            />
          </label>

          <button type="submit" style={submitButtonStyle}>
            {status === "loading" ? "Registering..." : "Register"}
          </button>

          {status === "error" && (
            <p style={{ color: "#f77", fontSize: 14, textAlign: "center" }}>{error}</p>
          )}
          {status === "success" && (
            <p style={{ color: "#4caf50", fontSize: 14, textAlign: "center" }}>
              Registration successful! Redirecting...
            </p>
          )}
        </form>

        <p
          style={{
            fontSize: 12,
            color: "#aaa",
            textAlign: "center",
            marginTop: 16,
          }}
        >
          Already have an account?{" "}
          <a href="/login" style={{ color: "#FF4D80", textDecoration: "underline" }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}

// Shared styles with login/settings
const inputStyle = {
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #444",
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "#fff",
  fontSize: 14,
};

const submitButtonStyle = {
  padding: "12px",
  backgroundColor: "#FF4D80",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  fontWeight: "bold",
  fontSize: 15,
  marginTop: 8,
  cursor: "pointer",
};
