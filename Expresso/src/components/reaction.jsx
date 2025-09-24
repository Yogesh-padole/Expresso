import React, { useState } from "react";
import LikeButton from "./likebtn";
import SaveButton from "./savebtn";
import ShareButton from "./sharebtn";
import CommentButton from "./commentbtn";
import CommentModal from "./comment";

export default function Reaction({ postId }) {
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        padding: "0.8rem 0",
      }}
    >
      {/* Like */}
      <LikeButton postId={postId} />

      {/* Comment */}
      <CommentButton
        postId={postId}                
        onClick={() => setIsCommentOpen(true)}
      />

      {/* Share */}
      <ShareButton postId={postId} />

      {/* Save */}
      <SaveButton postId={postId} />

      {/* Comment Modal */}
      {isCommentOpen && (
        <CommentModal
          postId={postId}
          onClose={() => setIsCommentOpen(false)}
        />
      )}
    </div>
  );
}
