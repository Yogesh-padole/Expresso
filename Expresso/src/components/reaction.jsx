import React, { useState } from "react";
import { FaThumbsUp, FaRegThumbsUp, FaComment, FaShareAlt, FaRegBookmark, FaBookmark } from "react-icons/fa";

export default function Reaction({ postId, onLike, onComment, onShare, onSave }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  const handleLike = () => {
    const newLikeState = !liked;
    setLiked(newLikeState);
    setLikesCount(prev => newLikeState ? prev + 1 : prev - 1);
    if (onLike) onLike(postId, newLikeState);
  };

  const handleSave = () => {
    const newSaveState = !saved;
    setSaved(newSaveState);
    if (onSave) onSave(postId, newSaveState);
  };

  return (
    <div className="post-reaction">
      <button className="reaction-btn" onClick={handleLike}>
        {liked ? <FaThumbsUp /> : <FaRegThumbsUp />} {likesCount > 0 && <span>{likesCount}</span>}
      </button>

      <button className="reaction-btn" onClick={() => onComment && onComment(postId)}>
        <FaComment />
      </button>

      <button className="reaction-btn" onClick={() => onShare && onShare(postId)}>
        <FaShareAlt />
      </button>

      <button className="reaction-btn" onClick={handleSave}>
        {saved ? <FaBookmark /> : <FaRegBookmark />}
      </button>

      <style>{`
        .post-reaction {
          display: flex;
          gap: 0.8rem;
          align-items: center;
          background: transparent;
          padding: 0.5rem 0;
        }
        .reaction-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          color: #666;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: color 0.2s ease;
        }
        .reaction-btn:hover {
          color: #000;
        }
        .reaction-btn span {
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
