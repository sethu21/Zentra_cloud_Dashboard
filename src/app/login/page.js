"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle } from "react-icons/fa";
import styles from "./style.module.css";


function SocialLoginButton({ provider, Icon, label }) {
  return (
    <button
      type="button"
      onClick={() => signIn(provider, { callbackUrl: "/" })}
      className={styles.socialButton}
    >
      <Icon aria-hidden="true" /> {label}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [loginCredentials, setLoginCredentials] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function handleInputChange(e) {
    const { name, value } = e.target;
    setLoginCredentials((prev) => ({
        email: name === "email" ? value : prev.email,
        password: name === "password" ? value : prev.password,
    }));
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    setLoginError("");
    const { email, password } = loginCredentials;

    // this validate the user email 
    if (!emailRegex.test(email)) {
      setLoginError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setLoginError("Password must be at least 6 characters.");
      return;
    }
     // this trigger the loading 
    setIsLoading(true);
    try {
      // this make a call to the nextAuth credentials 
      const response = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      // this use to handle the responce 
      if (response?.error) {
        setLoginError(response.error);
      } else {
        // if no error this make it to homepage 
        router.push("/");
      }
    } catch {
      setLoginError("Authentication failed. Please check your email or password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>
          Not registered? <a href="/register">Sign up</a>
        </p>

        <div className={styles.socialButtons}>
          <SocialLoginButton
            provider="google"
            Icon={FaGoogle}
            label="Sign in with Google"
          />
        </div>

        <div className={styles.divider}>or</div>

        <form onSubmit={handleFormSubmit} className={styles.form}>
          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={loginCredentials.email}
              onChange={handleInputChange}
              required
              placeholder="you@example.com"
              className={styles.input}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={loginCredentials.password}
              onChange={handleInputChange}
              required
              placeholder="••••••••"
              className={styles.input}
            />
          </label>

          {loginError && <div className={styles.error}>{loginError}</div>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className={styles.footer}>Powered by NextAuth</p>
      </div>
    </div>
  );
}
// future need to add better way for logging with the gmail 
// and need to add forgot password 