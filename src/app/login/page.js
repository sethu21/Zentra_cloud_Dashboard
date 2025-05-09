"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const res = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });
    if (res?.error) setError(res.error);
    else router.push("/");
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
        <h1 style={{ fontSize: 28, fontWeight: 600, textAlign: "center" }}>Sign In</h1>
        <p style={{ textAlign: "center", fontSize: 14, color: "#ccc" }}>
          Not registered?{" "}
          <a href="/register" style={{ color: "#FF4D80", textDecoration: "underline" }}>
            Sign up
          </a>
        </p>

        {/* Social Login Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            style={socialButtonStyle}
          >
            <FaGoogle /> Continue with Google
          </button>
          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            style={socialButtonStyle}
          >
            <FaGithub /> Continue with GitHub
          </button>
          <button
            onClick={() => signIn("apple", { callbackUrl: "/" })}
            style={socialButtonStyle}
          >
            <FaApple /> Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            textAlign: "center",
            margin: "1.5rem 0",
            position: "relative",
            color: "#aaa",
          }}
        >
          <hr style={{ borderColor: "#555" }} />
          <span
            style={{
              position: "absolute",
              top: "-10px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#2A244A",
              padding: "0 10px",
              fontSize: "12px",
              color: "#bbb",
            }}
          >
            or
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
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

          {error && (
            <div style={{ color: "#f77", fontSize: 14, textAlign: "center" }}>{error}</div>
          )}

          <button type="submit" style={submitButtonStyle}>
            SIGN IN
          </button>
        </form>

        <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", marginTop: 16 }}>
          Powered by NextAuth
        </p>
      </div>
    </div>
  );
}

// Styles
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

const socialButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "#ffffff1a",
  padding: "10px 14px",
  borderRadius: 8,
  color: "#fff",
  border: "1px solid #444",
  cursor: "pointer",
};
