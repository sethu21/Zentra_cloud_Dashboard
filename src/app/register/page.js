"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../login/style.module.css"; // in here need to add better color 

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const [status, setStatus] = useState(""); 
  let debug = true; 

  function handleChange(e) {
    const { name, value } = e.target;
    console.log("handleChange", name, value); 
    setForm((prev) => ({
        email: name === "email" ? value : prev.email,
        password: name === "password" ? value : prev.password, }));
  }

  async function handleSubmt(e) {
    e.preventDefault();
    setErr("");
    setStatus("loading");

    // this check the input of user side 
    if (!form.email.includes("@")) {
      setErr("email invalid");
      setStatus("error");
      return;
    }
    if (form.password.length < 5) {
      setErr("passwordd too short");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "fail"); 
      // if all worked it shows ok and send the page back to login 
      setStatus("ok");
      router.push("/login");
    } catch (e) {
      console.error("Register error", e);
      setErr(e.message);
      setStatus("error");
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Register</h1>
        <p className={styles.subtitle}>Have an account? <a href="/login">Login</a></p>

        <form onSubmit={handleSubmt} className={styles.form}>
          <label className={styles.label}>
            Full Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            Phone
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="123-456-7890"
              className={styles.input}
              required
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••"
              className={styles.input}
              required
            />
          </label>

          {err && <div className={styles.error}>{err}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Please wait" : "Register"}
          </button>
        </form>

        {debug && <pre style={{ fontSize: 12 }}>Debug: {JSON.stringify(form)}</pre>}
        {status === "ok" && <p className={styles.success}>All set! 🚀</p>}

        <p className={styles.footer}>Powered by SimpleAuth</p>
      </div>
    </div>
  );
}
