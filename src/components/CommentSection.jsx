import { useEffect, useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  AlertTriangle,
  Ghost,
  ChevronDown,
  Send,
} from "lucide-react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { timeAgo } from "../utils/timeAgo";
import { db, auth } from "../firebase/firebase";
import ReportDialog from "../components/ReportDialog";
const CommentItem = ({ comment, postId, depth = 0 }) => {
  const [liked, setLiked] = useState(comment.liked);
  const [likes, setLikes] = useState(comment.likes);
  const [showReplies, setShowReplies] = useState(depth === 0);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const toggleLike = () => {
    setLiked(!liked);
    setLikes((prev) => (liked ? prev - 1 : prev + 1));
  };
  const handleReply = async () => {
    if (!replyText.trim()) return;

    await addDoc(
      collection(db, "posts", postId, "comments", comment.id, "replies"),
      {
        text: replyText,
        author: "User", // improve later
        createdAt: serverTimestamp(),
      },
    );

    setReplyText("");
    setReplying(false);
  };
  return (
    <div className={`${depth > 0 ? "ml-6 pl-4 border-l-2 border-border" : ""}`}>
      <div className="py-3">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-sm font-medium ${comment.author === "Anonymous" ? "text-accent" : "text-foreground"}`}
              >
                {comment.author === "Anonymous" ? "Anonymous" : comment.author}
              </span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(comment.createdAt)}
              </span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {comment.text}
            </p>
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={toggleLike}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors press-scale"
              >
                <Heart
                  className={`h-3.5 w-3.5 ${liked ? "fill-destructive text-destructive" : ""}`}
                />
                <span>{likes}</span>
              </button>
              <button
                onClick={() => setReplying(!replying)}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors press-scale"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Reply
              </button>
              <ReportDialog
                type="comment"
                trigger={
                  <button className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-destructive transition-colors">
                    <AlertTriangle className="h-3 w-3" />
                  </button>
                }
              />
            </div>
            {replying && (
              <div className="mt-3 flex gap-2 animate-fade-in">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Reply to ${comment.author === "Anonymous" ? "Anonymous" : comment.author}...`}
                  className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="rounded-lg bg-primary px-3 py-2 text-primary-foreground press-scale disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {(comment.replies || []).length > 0 && (
        <>
          {!showReplies && (
            <button
              onClick={() => setShowReplies(true)}
              className="ml-11 flex items-center gap-1 text-xs text-primary hover:underline mb-2 press-scale"
            >
              <ChevronDown className="h-3 w-3" />
              Show {comment.replies.length}{" "}
              {comment.replies.length === 1 ? "reply" : "replies"}
            </button>
          )}
          {showReplies &&
            comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                postId={postId}
                depth={depth + 1}
              />
            ))}
        </>
      )}
    </div>
  );
};
const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // 🔹 Listen to comments + replies
  useEffect(() => {
    const commentsRef = collection(db, "posts", postId, "comments");
    const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
        replies: [],
      }));

      commentsData.forEach((comment) => {
        const repliesRef = collection(
          db,
          "posts",
          postId,
          "comments",
          comment.id,
          "replies",
        );
        onSnapshot(repliesRef, (repliesSnap) => {
          const replies = repliesSnap.docs.map((r) => ({
            id: r.id,
            ...r.data(),
          }));
          setComments((prev) =>
            prev.map((c) => (c.id === comment.id ? { ...c, replies } : c)),
          );
        });
      });

      setComments(commentsData);
    });
    return () => unsubscribe();
  }, [postId]);

  const [isAnon, setIsAnon] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [sort, setSort] = useState("top");
  const inputRef = useRef(null);
  const charCount = newComment.length;
  const maxChars = 300;
  const isWarning = charCount > 260;
  const isOver = charCount > maxChars;
  const handleSubmit = async () => {
    if (!newComment.trim() || isOver) return;

    const user = auth.currentUser;
    if (!user) return alert("Login first");

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    let username = "Anonymous";
    if (!isAnon && userSnap.exists()) {
      const data = userSnap.data();
      username = data.username || data.displayName || user.email || "User";
    }

    await addDoc(collection(db, "posts", postId, "comments"), {
      text: newComment,
      author: username,
      authorId: user.uid,
      createdAt: serverTimestamp(),
    });

    setNewComment("");
    setExpanded(false);
  };
  const sortedComments = [...comments].sort((a, b) => {
    if (sort === "top") return b.likes - a.likes;
    return 0;
  });
  return (
    <div className="mt-6">
      <h3 className="font-serif text-lg mb-4 text-foreground">
        Comments ({comments.length})
      </h3>
      {/* Comment Input */}
      <div className="rounded-2xl border bg-card p-4 mb-6">
        {!expanded ? (
          <button
            onClick={() => {
              setExpanded(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="w-full text-left text-sm text-muted-foreground py-2 px-3 rounded-lg bg-background border hover:border-primary/30 transition-colors"
          >
            Share your thoughts...
          </button>
        ) : (
          <div className="space-y-3 animate-fade-in">
            <textarea
              ref={inputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              rows={3}
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={320}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    onClick={() => setIsAnon(!isAnon)}
                    className={`relative h-5 w-9 rounded-full transition-colors ${isAnon ? "bg-accent" : "bg-muted"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-background transition-transform ${isAnon ? "translate-x-4" : ""}`}
                    />
                  </button>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Ghost className="h-3.5 w-3.5" /> Post anonymously
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs ${isOver ? "text-destructive" : isWarning ? "text-amber-500" : "text-muted-foreground"}`}
                >
                  {charCount}/{maxChars}
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!newComment.trim() || isOver}
                  className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground press-scale disabled:opacity-40 transition-opacity"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Sort */}
      <div className="flex gap-2 mb-4">
        {["top", "newest", "oldest"].map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors press-scale ${sort === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {/* Comments List */}
      <div className="space-y-1 divide-y divide-border">
        {sortedComments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} postId={postId} />
        ))}
      </div>
    </div>
  );
};
export default CommentSection;
