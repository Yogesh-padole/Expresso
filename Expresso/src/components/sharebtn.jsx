import React from "react";
import { FaShareAlt } from "react-icons/fa";

export default function ShareButton({ postId }) {
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      navigator.share({
        title: "Check out this post ☕",
        text: "I found this interesting post, have a look!",
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("🔗 Post link copied to clipboard!");
    }
  };

  return (
    <button
      onClick={handleShare}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.6rem 1rem",
        border: "none",
        background: "transparent",
        color: "#aaa",
        fontSize: "1.1rem",
        cursor: "pointer",
        borderRadius: "10px",
      }}
    >
      <FaShareAlt />
    </button>
  );
}
