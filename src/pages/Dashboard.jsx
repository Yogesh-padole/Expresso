import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  Compass,
  TrendingUp,
  FileText,
  Bookmark,
  Plus,
  Coffee,
  Ghost,
  Heart,
  MessageCircle,
  UserPlus,
  Filter,
  LogOut,
  MessageSquare,
} from "lucide-react";
import {
  doc,
  collection,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import PostCard from "../components/PostCard";
import CreatePostDialog from "../components/CreatePostDialog";
import FeedbackDialog from "../components/FeedbackDialog";
import { trendingTags } from "../data/mockData";
import { User } from "lucide-react";

// Services
import {
  getAllPosts,
  createPost,
  subscribeToPosts,
} from "../services/postService";
import { logoutUser } from "../services/authService";

import { getAuth, onAuthStateChanged } from "firebase/auth";

import { toast } from "sonner";
const categories = [
  { label: "All", value: "all" },
  { label: "Self-Care", value: "self-care" },
  { label: "Growth", value: "growth" },
  { label: "Career", value: "career" },
  { label: "Relationships", value: "relationships" },
  { label: "College Vibes", value: "collegevibes" },
  { label: "Friendship", value: "friendshipgoals" },
  { label: "Habits", value: "habits" },
  { label: "Creativity", value: "creativity" },
];
const notifIcons = {
  like: Heart,
  comment: MessageCircle,
  reply: MessageCircle,
  follow: UserPlus,
};
const navItems = [
  { icon: Home, label: "Feed" },
  { icon: Compass, label: "Explore" },
  { icon: TrendingUp, label: "Trending" },
  { icon: FileText, label: "My Posts" },
  { icon: Bookmark, label: "Saved" },
];

const TabLoader = () => {
  return (
    <div className="flex justify-center py-20">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-[#E7D8CC]"></div>

          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#6F3B1B] animate-spin"></div>

          <div className="absolute inset-3 rounded-full bg-[#F8F2EC] flex items-center justify-center">
            <Coffee className="h-5 w-5 text-[#6F3B1B]" />
          </div>
        </div>

        <p className="text-sm text-muted-foreground animate-pulse">
          Brewing your feed...
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Feed");
  const [activeCategory, setActiveCategory] = useState("all");
  const [feedFilter, setFeedFilter] = useState("All");
  const [posts, setPosts] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);

  // ✅ LOAD USER + POSTS

  useEffect(() => {
    let unsubscribeUser = null;
    let unsubscribePosts = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/login");
        return;
      }

      try {
        // ✅ Realtime user listener
        const userRef = doc(db, "users", firebaseUser.uid);

        unsubscribeUser = onSnapshot(userRef, (snap) => {
          if (snap.exists()) {
            setUser({
              ...snap.data(),
              uid: firebaseUser.uid,
            });
          }
        });

        // ✅ Realtime posts listener
        unsubscribePosts = subscribeToPosts(firebaseUser.uid, setPosts);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();

      if (unsubscribeUser) {
        unsubscribeUser();
      }

      if (unsubscribePosts) {
        unsubscribePosts();
      }
    };
  }, [auth, navigate]);

  const filteredPosts = useMemo(() => {
    let result = [...posts];
    switch (activeNav) {
      case "Trending":
        result = result.sort((a, b) => b.likes - a.likes);
        break;
      case "My Posts":
        result = result.filter((p) => p.author?.id === user?.uid);
        break;
      case "Saved":
        result = result.filter((p) => user?.savedPosts?.includes(p.id));
        break;
      case "Explore":
        result = result.sort(() => Math.random() - 0.5);
        break;
    }
    if (feedFilter === "Anonymous")
      result = result.filter((p) => p.author?.name === "Anonymous");
    if (activeCategory !== "all") {
      result = result.filter((p) => p.tags.includes(activeCategory));
    }
    return result;
  }, [posts, activeNav, activeCategory, feedFilter]);

  const handleNewPost = async (post) => {
    try {
      await createPost(post, user.uid, user.email);

      toast.success("Your story has been shared! \u2615");

      setPosts((prev) => [post, ...prev]);

      const updatedPosts = await getAllPosts(user.uid);
      setPosts(updatedPosts);
    } catch (err) {
      toast.error("Failed to create post");
    }
  };

  // 🚪 LOGOUT
  const handleLogout = async () => {
    await logoutUser();
    toast.success("Logged out");
    navigate("/");
  };

  // tab loading handler
  const handleTabChange = (tab) => {
    setTabLoading(true);

    setTimeout(() => {
      setActiveNav(tab);
      setActiveCategory("all");
      setFeedFilter("All");

      setTabLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <TabLoader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="w-full flex h-14 items-center px-4">
          <Link to="/" className="flex items-center gap-2">
            <Coffee className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg text-primary">Expresso</span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setFeedbackOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors press-scale"
            >
              <MessageSquare className="h-4 w-4" /> Feedback
            </button>
            <button
              onClick={() => setCreateOpen(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground press-scale hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> New Post
            </button>
            <Link to="/profile" className="flex items-center gap-2">
              <User className="h-10 w-10 p-1 rounded-full border-4 border-gray-800 hover:border-gray-800/60 transition-colors duration-300" />
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-secondary p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors press-scale"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <div className="w-full px-4 py-6">
        <div className="flex justify-center gap-6">
          {/* Left Sidebar */}
          <aside className="hidden lg:block w-60 shrink-0">
            <div className="sticky top-20 space-y-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleTabChange(item.label)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors press-scale ${activeNav === item.label ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </button>
                ))}
              </nav>
              <button
                onClick={() => setCreateOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground press-scale hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" /> Create Post
              </button>
              {/* Category Filter */}
              <div className="rounded-2xl border bg-card p-4">
                <h4 className="font-serif text-sm mb-3 text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" /> Categories
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => setActiveCategory(cat.value)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors press-scale ${activeCategory === cat.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Tag Cloud */}
              <div className="rounded-2xl border bg-card p-4">
                <h4 className="font-serif text-sm mb-3 text-foreground">
                  Popular Tags
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {trendingTags.slice(0, 6).map((tag) => (
                    <button
                      key={tag.name}
                      onClick={() => setActiveCategory(tag.name)}
                      className={`rounded-full px-2.5 py-1 text-xs transition-colors cursor-pointer press-scale ${activeCategory === tag.name ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"}`}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
          {/* Center Feed */}
          <main className="flex-1 w-full max-w-2x2 mx-auto space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif text-2xl text-foreground">
                {activeNav === "Feed"
                  ? "\u{1F3E0} Your Feed"
                  : activeNav === "Trending"
                    ? "\u{1F525} Trending"
                    : activeNav === "My Posts"
                      ? "\u{1F4DD} My Posts"
                      : activeNav === "Saved"
                        ? "\u{1F516} Saved"
                        : "\u{1F9ED} Explore"}
              </h2>
              <div className="flex gap-1.5">
                {["All", "Anonymous"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFeedFilter(f)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${feedFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground"}`}
                  >
                    {f === "Anonymous" && (
                      <Ghost className="inline h-3 w-3 mr-1" />
                    )}
                    {f}
                  </button>
                ))}
              </div>
            </div>
            {/* Mobile category scroll */}
            <div className="flex gap-1.5 overflow-x-auto pb-2 lg:hidden scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${activeCategory === cat.value ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
            {tabLoading ? (
              <TabLoader />
            ) : filteredPosts.length > 0 ? (
              filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="rounded-2xl border bg-card p-12 text-center">
                <Coffee className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />

                <h3 className="font-serif text-lg text-foreground mb-2">
                  No stories here yet
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  Be the first to share something in this category!
                </p>

                <button
                  onClick={() => setCreateOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground press-scale"
                >
                  <Plus className="h-4 w-4" />
                  Create Post
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/90 backdrop-blur-md lg:hidden z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleTabChange(item.label)}
              className={`flex flex-col items-center gap-0.5 p-2 text-xs press-scale ${activeNav === item.label ? "text-primary" : "text-muted-foreground"}`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {/* Mobile FAB */}
      <button
        onClick={() => setCreateOpen(true)}
        className="fixed bottom-20 right-4 lg:hidden z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg press-scale hover:opacity-90 transition-opacity"
      >
        <Plus className="h-6 w-6" />
      </button>
      <CreatePostDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onPost={handleNewPost}
      />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  );
};
export default Dashboard;
