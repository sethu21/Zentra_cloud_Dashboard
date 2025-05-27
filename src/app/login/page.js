"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub, FaApple } from "react-icons/fa";

export default function LoginPage() {
    const router = useRouter();
    const [formState, setFormState] = useState({ email: "", password: "" });
    const [err, setErr] = useState("");

    const onChange = (e) => {
        const { name, value } = e.target;
        setFormState((old) => ({ ...old, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErr("");

        const result = await signIn("credentials", {
            redirect: false,
            email: formState.email,
            password: formState.password,
        });

        if (result?.error) {
            setErr(result.error);
        } else {
            router.push("/");
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
                    width: "100%",
                    maxWidth: 420,
                    color: "#fff",
                    boxShadow: "0 0 10px rgba(255, 77, 128, 0.3)",
                }}
            >
                <h1 style={{ textAlign: "center", fontSize: 28, fontWeight: 600 }}>
                    Sign In
                </h1>
                <p style={{ textAlign: "center", fontSize: 14, color: "#ccc" }}>
                    Don't have an account?{" "}
                    <a href="/register" style={{ color: "#FF4D80", textDecoration: "underline" }}>
                        Sign up
                    </a>
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
                    <button style={socialBtnStyle} onClick={() => signIn("google", { callbackUrl: "/" })}>
                        <FaGoogle /> Google
                    </button>
                    <button style={socialBtnStyle} onClick={() => signIn("github", { callbackUrl: "/" })}>
                        <FaGithub /> GitHub
                    </button>
                    <button style={socialBtnStyle} onClick={() => signIn("apple", { callbackUrl: "/" })}>
                        <FaApple /> Apple
                    </button>
                </div>

                <div style={{ position: "relative", textAlign: "center", margin: "1.5rem 0", color: "#aaa" }}>
                    <hr style={{ borderColor: "#555" }} />
                    <span
                        style={{
                            position: "absolute",
                            top: -10,
                            left: "50%",
                            transform: "translateX(-50%)",
                            background: "#2A244A",
                            padding: "0 10px",
                            fontSize: 12,
                        }}
                    >
                        or
                    </span>
                </div>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <label>
                        <span>Email</span>
                        <input
                            type="email"
                            name="email"
                            value={formState.email}
                            onChange={onChange}
                            placeholder="you@example.com"
                            required
                            style={inputStyle}
                        />
                    </label>

                    <label>
                        <span>Password</span>
                        <input
                            type="password"
                            name="password"
                            value={formState.password}
                            onChange={onChange}
                            placeholder="••••••••"
                            required
                            style={inputStyle}
                        />
                    </label>

                    {err && (
                        <div style={{ color: "#f77", fontSize: 14, textAlign: "center" }}>
                            {err}
                        </div>
                    )}

                    <button type="submit" style={submitBtnStyle}>
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

const submitBtnStyle = {
    padding: 12,
    backgroundColor: "#FF4D80",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 8,
    cursor: "pointer",
};

const socialBtnStyle = {
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
