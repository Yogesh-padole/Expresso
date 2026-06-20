import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Coffee,
  FileText,
  Heart,
  MessageCircle,
  Plus,
  BookOpen,
  Pencil,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PostCard from "../components/PostCard";
import CreatePostDialog from "../components/CreatePostDialog";
import DiaryModal from "../components/DiaryModal";
import EditProfileDialog from "../components/EditProfileDialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";

// ✅ SERVICES
import { getLogUser } from "../services/userService";
import {
  createPost,
  getPostsByUser,
  updatePost,
  deletePost,
} from "../services/postService";
import {
  getUserdiaryEntries,
  creatediaryEntries,
  updatediaryEntries,
  deletediaryEntries,
} from "../services/diaryEntrieservice";
import { getReportsByUser } from "../services/reportService";

const Profile = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [userPosts, setPosts] = useState([]);
  const [editingPost, setEditingPost] = useState(null);
  const [postOpen, setPostOpen] = useState(false);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  // Diary state
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [diaryOpen, setDiaryOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  // 🔥 LOAD USER + POSTS + DIARY
  useEffect(() => {
    const fetchData = async () => {
      try {
        const firebaseUser = auth.currentUser;

        if (!firebaseUser) {
          navigate("/login");
          return;
        }

        // 👤 USER
        const userData = await getLogUser(firebaseUser.uid);
        setProfile({ ...userData, uid: firebaseUser.uid });

        // 📝 POSTS
        const userPosts = await getPostsByUser(firebaseUser.uid);
        setPosts(userPosts);

        // 📖 DIARY
        const diaryEntries = await getUserdiaryEntries(firebaseUser.uid);
        setDiaryEntries(diaryEntries);

        // Reports
        const userReports = await getReportsByUser(firebaseUser.uid);
        setReports(userReports);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveProfile = (updated) => {
    setProfile(updated, profile.email);
  };

  // For Posts

  const handleCreatePost = async (post) => {
    try {
      await createPost(post, profile.userId, profile.email);

      toast.success("Your story has been shared! \u2615");

      setPosts((prev) => [post, ...prev]);

      const updatedPosts = await getPostsByUser(profile.userId);
      setPosts(updatedPosts);
    } catch (err) {
      toast.error("Failed to create post");
      console.error(err);
    }
  };

  const handleUpdatePost = async (postId, updates) => {
    try {
      await updatePost(postId, updates);

      const updatedPosts = await getPostsByUser(profile.userId);
      setPosts(updatedPosts);

      toast.success("Post updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update post");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;

    try {
      await deletePost(postId);

      setPosts((prev) => prev.filter((post) => post.id !== postId));

      toast.success("Post deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete post");
    }
  };

  const handleSaveDiary = async (entry) => {
    try {
      if (editingEntry) {
        await updatediaryEntries(editingEntry.docId, {
          title: entry.title,
          content: entry.content,
        });

        toast.success("Diary updated!");
        setEditingEntry(null);
      } else {
        await creatediaryEntries(entry, profile.userId);
        toast.success("Diary saved!");
      }

      const updated = await getUserdiaryEntries(profile.userId);
      setDiaryEntries(updated);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save diary");
    }
  };

  const handleDeleteDiary = async (id) => {
    if (!window.confirm("Delete this diary entry?")) return;

    try {
      await deletediaryEntries(id);

      setDiaryEntries((prev) => prev.filter((entry) => entry.docId !== id));

      toast.success("Diary deleted!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete diary");
    }
  };

  if (loading || !profile) {
    return (
      <div>
        <LoadingSpinner />
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
        {/* Profile Card */}
        <div className="rounded-2xl border bg-card p-6 text-center mb-8 animate-fade-in relative">
          <button
            onClick={() => setEditOpen(true)}
            className="absolute top-4 right-4 rounded-lg bg-secondary p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors press-scale"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <h1 className="font-serif text-2xl text-foreground mb-1">
            {profile.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile.bio || profile.email}
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            {profile.contact}
          </p>
          <div className="flex justify-center gap-8">
            {[
              {
                icon: FileText,
                label: "Posts",
                value: userPosts.length,
              },
              {
                icon: Heart,
                label: "Likes",
                value: userPosts.reduce((acc, p) => acc + p.likes, 0),
              },
              {
                icon: MessageCircle,
                label: "Comments",
                value: userPosts.reduce(
                  (acc, p) => acc + (p.comments?.length || 0),
                  0,
                ),
              },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-primary mb-1">
                  <stat.icon className="h-4 w-4" />
                  <span className="text-xl font-semibold">{stat.value}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="animate-fade-in">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="posts" className="flex-1">
              My Posts
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex-1">
              My Reports
            </TabsTrigger>
            <TabsTrigger value="diary" className="flex-1">
              My Diary
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-foreground">Posts</h2>

              <button
                onClick={() => setPostOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground press-scale hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Create Post
              </button>
            </div>

            {userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <div key={post.id} className="relative">
                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setPostOpen(true);
                        }}
                        className="rounded-lg p-2 text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <PostCard post={post} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border bg-card p-8 text-center">
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />

                <h3 className="font-serif text-lg text-foreground mb-2">
                  No posts yet
                </h3>

                <p className="text-sm text-muted-foreground mb-4">
                  Share your first thought with the Expresso community.
                </p>

                <button
                  onClick={() => setPostOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground press-scale"
                >
                  <Plus className="h-4 w-4" />
                  Create Post
                </button>
              </div>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            {reports.length > 0 ? (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="rounded-2xl border bg-card p-4"
                  >
                    <h3 className="font-semibold text-foreground">
                      {report.postTitle}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Reason: {report.reason}
                    </p>

                    <p className="text-xs mt-2">
                      Status:{" "}
                      <span
                        className={
                          report.status === "completed"
                            ? "text-green-500"
                            : "text-yellow-500"
                        }
                      >
                        {report.status}
                      </span>
                    </p>

                    {report.resolutionNote && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Note: {report.resolutionNote}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border bg-card p-8 text-center">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="font-serif text-lg text-foreground mb-2">
                  No reports yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Reports you've submitted will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Diary Tab */}
          <TabsContent value="diary">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl text-foreground">My Diary</h2>
              <button
                onClick={() => setDiaryOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground press-scale hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" /> Add Entry
              </button>
            </div>
            {diaryEntries.length > 0 ? (
              <div className="space-y-4">
                {diaryEntries.map((entry) => (
                  <div
                    key={entry.docId}
                    className="rounded-2xl border bg-card p-5 animate-fade-in"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-serif text-lg text-foreground">
                          {entry.title}
                        </h3>
                        <span className="text-xs text-muted-foreground">
                          {entry.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingEntry(entry);
                            setDiaryOpen(true);
                          }}
                          className="rounded-lg p-2 text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteDiary(entry.docId)}
                          className="rounded-lg p-2 text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border bg-card p-8 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                <h3 className="font-serif text-lg text-foreground mb-2">
                  No diary entries yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start diaryEntriesing your thoughts privately.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <EditProfileDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        profile={profile}
        onSave={handleSaveProfile}
      />
      <DiaryModal
        open={diaryOpen}
        onOpenChange={(open) => {
          setDiaryOpen(open);

          if (!open) {
            setEditingEntry(null);
          }
        }}
        onSave={handleSaveDiary}
        editingEntry={editingEntry}
      />

      <CreatePostDialog
        open={postOpen}
        onOpenChange={(open) => {
          setPostOpen(open);
          if (!open) {
            setEditingPost(null);
          }
        }}
        editingPost={editingPost}
        onPost={(data) => {
          if (editingPost) {
            handleUpdatePost(editingPost.id, data);
          } else {
            handleCreatePost(data);
          }
        }}
      />
    </div>
  );
};

export default Profile;
