import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Ghost,
  AlertTriangle,
} from "lucide-react";
import ReportDialog from "../components/ReportDialog";
import { Link } from "react-router-dom";
import Reaction from "./reactionComponent/reaction";
import { timeAgo } from "../utils/timeAgo";

// ✅ FORMAT DATE (IMPORTANT FIX)
const formatDate = (timestamp) => {
  if (!timestamp) return "";

  if (timestamp.toDate) {
    return timestamp.toDate().toLocaleString();
  }

  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleString();
  }

  return "";
};

const PostCard = ({ post, isDetailView = false }) => {
  const toggleLike = () => {
    setLiked(!liked);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition-all hover-lift ${
        post.author?.name === "Anonymous" ? "anon-card" : "bg-card"
      }`}
    >
      {/* Author */}
      <div className="flex items-center gap-3 mb-3">
        <div>
          <p
            className={`font-medium text-sm ${
              post.author?.name === "Anonymous"
                ? "text-accent"
                : "text-foreground"
            }`}
          >
            {post.author?.name === "Anonymous" ? "Anonymous" : post.author.name}
          </p>

          {/* ✅ FIXED DATE */}
          <p className="text-xs text-muted-foreground">
            {timeAgo(post.createdAt)}
          </p>
        </div>

        {post.author?.name === "Anonymous" && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            <Ghost className="h-3 w-3" /> Anonymous
          </span>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-secondary px-2.5 py-0.5 text-xs text-secondary-foreground"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {post.title}
        </h3>
      )}

      {/* Content */}
      {isDetailView ? (
        <p className="text-foreground leading-relaxed mb-4 break-words whitespace-pre-wrap">
          {post.content}
        </p>
      ) : (
        <Link to={`/post/${post.id}`}>
          <p className="text-foreground leading-relaxed mb-4 break-words whitespace-pre-wrap">
            {post.content}
          </p>
        </Link>
      )}

      {/* Actions */}
      <div>
        <Reaction postId={post.id} />
      </div>
    </div>
  );
};

export default PostCard;
