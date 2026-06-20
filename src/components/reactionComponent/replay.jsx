import React, { useState } from "react";

export default function ReplyInput({ onReply }) {
  const [replyText, setReplyText] = useState("");

  const handleSubmit = () => {
    if (!replyText.trim()) return;
    onReply(replyText);
    setReplyText("");
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "0.6rem",
        marginTop: "0.7rem",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        placeholder="Write a reply..."
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        style={{
          flex: 1,
          padding: "0.7rem 1rem",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.15)",
          background: "rgba(255,255,255,0.08)",
          color: "white",
          fontSize: "0.9rem",
          outline: "none",
          transition: "all 0.2s ease",
        }}
        onFocus={(e) =>
          (e.target.style.border = "1px solid rgba(59,130,246,0.5)")
        }
        onBlur={(e) =>
          (e.target.style.border = "1px solid rgba(255,255,255,0.15)")
        }
      />
      <button
        onClick={handleSubmit}
        style={{
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "white",
          border: "none",
          padding: "0.6rem 1.2rem",
          borderRadius: "10px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "0.85rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          transition: "all 0.2s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        Reply
      </button>
    </div>
  );
}
