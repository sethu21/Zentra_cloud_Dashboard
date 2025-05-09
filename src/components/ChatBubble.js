// File: src/components/ChatBubble.js
"use client";

import { useState, useRef, useEffect } from "react";
import { FaPaperPlane, FaRobot, FaUser } from "react-icons/fa";

export default function ChatBubble({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi there!  Ask me anything about your sensor data, plant types, or irrigation needs.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMsgs = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMsgs }),
      });
      const { reply } = await res.json();
      setMessages([
        ...newMsgs,
        { role: "assistant", content: reply || "Sorry, I didn't get that." },
      ]);
    } catch {
      setMessages([
        ...newMsgs,
        { role: "assistant", content: "⚠️ Something went wrong." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        // move it up so it sits above your two icon buttons:
        bottom: 32 + 70 + 16,  // 32px from edge + 70px icon height + margin
        right: 32,
        width: 320,
        maxHeight: 550,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        border: "1px solid rgba(0,0,0,0.1)",
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        zIndex: 1001,  // above your irrigation/chat icons
        overflow: "hidden",
      }}
    >
      {/* header */}
      <div
        style={{
          background: "#2196F3",
          padding: "12px 16px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          ×
        </button>
      </div>

      {/* message list */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          background: "#E3F2FD",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((msg, i) => (
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
                background:
                  msg.role === "user" ? "#F5F5F5" : "#BBDEFB",
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
        {loading && (
          <div style={{ fontSize: 12, color: "#1976D2" }}>Typing…</div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
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
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message…"
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
          disabled={loading}
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
