import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Coffee } from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import CommentSection from "../components/CommentSection";
import { getPostById } from "../services/postService";
import PostCard from "../components/PostCard";

const PostDetail = () => {
  const { postId } = useParams();
  const [loading, setLoading] = useState(true);

  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        console.log("postId : " + postId);
        const data = await getPostById(postId);
        setPost(data);
      } catch (err) {
        console.error(err);
        setPost(null); // prevent infinite loading
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

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
        <PostCard post={post} isDetailView={true} />

        <CommentSection postId={postId} />
      </main>
    </div>
  );
};
export default PostDetail;
