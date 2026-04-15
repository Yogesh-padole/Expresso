import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Ghost,
  Coffee,
  AlertTriangle,
} from "lucide-react";
import { timeAgo } from "../utils/timeAgo";
import ReportDialog from "../components/ReportDialog";
import { mockPosts } from "../data/mockData";
import CommentSection from "../components/CommentSection";
import { getPostById } from "../services/postService";
const PostDetail = () => {
  const { postId } = useParams();

  const [post, setPost] = useState(null);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log("postId : " + postId);
        const data = await getPostById(postId);
        setPost(data);
      } catch (err) {
        console.error(err);
        setPost(null); // prevent infinite loading
      }
    };

    fetchPost();
  }, [postId]);

  if (!post) return <p className="p-4">Loading...</p>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 items-center px-4 gap-4">
          <Link
            to="/dashboard"
            className="press-scale text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg text-primary">Expresso</span>
          </Link>
        </div>
      </header>
      <main className="container mx-auto max-w-2xl px-4 py-8">
        <article
          className={`rounded-2xl border p-6 ${post.author?.name === "Anonymous" ? "anon-card" : "bg-card"} animate-fade-in`}
        >
          <div className="flex items-center gap-3 mb-4">
            <div>
              <p
                className={`font-medium ${post.author?.name === "Anonymous" ? "text-accent" : "text-foreground"}`}
              >
                {post.author?.name === "Anonymous"
                  ? "Anonymous"
                  : post.author.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {timeAgo(post.createdAt)}
              </p>
            </div>
            {post.author?.name === "Anonymous" && (
              <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                <Ghost className="h-3 w-3" /> Anonymous
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
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
          <p className="text-foreground text-lg leading-relaxed mb-6 break-words">
            {post.content}
          </p>
          <div className="flex items-center gap-5 pt-4 border-t border-border">
            <button
              onClick={() => {
                setLiked(!liked);
                setLikes((l) => (liked ? l - 1 : l + 1));
              }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors press-scale"
            >
              <Heart
                className={`h-5 w-5 ${liked ? "fill-destructive text-destructive" : ""}`}
              />
              <span>{likes}</span>
            </button>
            <span className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageCircle className="h-5 w-5" /> {post.commentCount}
            </span>
            <button
              onClick={() => setSaved(!saved)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors press-scale"
            >
              <Bookmark
                className={`h-5 w-5 ${saved ? "fill-primary text-primary" : ""}`}
              />
            </button>
            <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors press-scale ml-auto">
              <Share2 className="h-5 w-5" /> Share
            </button>
            <ReportDialog
              type="post"
              trigger={
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors press-scale">
                  <AlertTriangle className="h-5 w-5" />
                </button>
              }
            />
          </div>
        </article>
        <CommentSection postId={postId} />
      </main>
    </div>
  );
};
export default PostDetail;
