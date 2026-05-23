import React from "react";
import { FaShareAlt } from "react-icons/fa";
import { Share2 } from "lucide-react";

export default function ShareButton({ postId }) {
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${postId}`;
    if (navigator.share) {
      navigator
        .share({
          title: "Check out this post ☕",
          text: "I found this interesting post, have a look!",
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("🔗 Post link copied to clipboard!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors press-scale ml-auto"
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}
