import React, { useState } from "react";
import LikeButton from "./likebtn";
import SaveButton from "./savebtn";
import ShareButton from "./sharebtn";
import CommentButton from "./commentbtn";
import CommentModal from "./comment";
import ReportDialog from "../ReportDialog";
import { AlertTriangle } from "lucide-react";

export default function Reaction({ postId }) {
  return (
    <div className="flex items-center gap-4 pt-2 border-t border-border">
      {/* Like */}
      <LikeButton postId={postId} />

      {/* Comment */}
      <CommentButton postId={postId} />

      {/* Save */}
      <SaveButton postId={postId} />

      {/* Share */}
      <ShareButton postId={postId} />

      {/* Report */}
      <ReportDialog
        type="post"
        trigger={
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-destructive transition-colors press-scale">
            <AlertTriangle className="h-4 w-4" />
          </button>
        }
      />
    </div>
  );
}
