"use client";

import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";

export default function ChatBubble({ onClose }) {
    const [thread, setThread] = useState([
        {
            role: "assistant",
            content: "👋 Hey! Ask me about sensor data, plants, irrigation—whatever you need help with!",
        },
    ]);
    const [typed, setTyped] = useState("");
    const [waiting, setWaiting] = useState(false);
    const scrollAnchor = useRef(null);

    // scroll to bottom every time we get new messages
    useEffect(() => {
        scrollAnchor.current?.scrollIntoView({ behavior: "smooth" });
    }, [thread]);

    const shootMessage = async () => {
        if (!typed.trim()) return;

        const convo = [...thread, { role: "user", content: typed }];
        setThread(convo);
        setTyped("");
        setWaiting(true);

        try {
            const res = await fetch("/api/chatbot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: convo }),
            });
            const { reply } = await res.json();

            setThread([
                ...convo,
                {
                    role: "assistant",
                    content: reply || "Hmm... didn't quite catch that.",
                },
            ]);
        } catch {
            setThread([
                ...convo,
                {
                    role: "assistant",
                    content: "⚠️ Uh oh, something went wrong with the response.",
                },
            ]);
        } finally {
            setWaiting(false);
        }
    };

    return (
        <div
            style={{
                position: "fixed",
                bottom: 32 + 70 + 16,
                right: 32,
                width: 320,
                maxHeight: 550,
                display: "flex",
                flexDirection: "column",
                background: "#fff",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 16,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                zIndex: 1001,
                overflow: "hidden",
            }}
        >
            {/* top bar */}
            <div
                style={{
                    background: "#2196F3",
                    padding: "12px 16px",
                    color: "#fff",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <FaRobot size={20} />
                    <span style={{ fontWeight: 600 }}>Online Help Center</span>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: "none",
                        border: "none",
                        color: "#fff",
                        fontSize: 20,
                        cursor: "pointer",
                    }}
                >
                    ×
                </button>
            </div>

            {/* convo list */}
            <div
                style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: 12,
                    background: "#E3F2FD",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                }}
            >
                {thread.map((msg, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 8,
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                        }}
                    >
                        {msg.role === "assistant" && (
                            <FaRobot style={{ color: "#1976D2", marginTop: 4 }} />
                        )}
                        <div
                            style={{
                                maxWidth: "80%",
                                padding: "8px 12px",
                                borderRadius: 20,
                                background: msg.role === "user" ? "#F5F5F5" : "#BBDEFB",
                                color: msg.role === "user" ? "#333" : "#0D47A1",
                                fontSize: 14,
                            }}
                        >
                            {msg.content}
                        </div>
                        {msg.role === "user" && (
                            <FaUser style={{ color: "#64B5F6", marginTop: 4 }} />
                        )}
                    </div>
                ))}
                {waiting && (
                    <div style={{ fontSize: 12, color: "#1976D2" }}>Typing…</div>
                )}
                <div ref={scrollAnchor} />
            </div>

            {/* input field */}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    shootMessage();
                }}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderTop: "1px solid rgba(0,0,0,0.1)",
                    background: "#E3F2FD",
                }}
            >
                <input
                    type="text"
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    placeholder="Type something…"
                    style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: 20,
                        border: "1px solid rgba(0,0,0,0.2)",
                        fontSize: 14,
                        outline: "none",
                    }}
                />
                <button
                    type="submit"
                    disabled={waiting}
                    style={{
                        background: "#1976D2",
                        border: "none",
                        borderRadius: "50%",
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        cursor: "pointer",
                    }}
                >
                    <FaPaperPlane size={16} />
                </button>
            </form>
        </div>
    );
}
