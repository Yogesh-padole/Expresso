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
} from "lucide-react";
import PostCard from "../components/PostCard";
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
import { getPostsByUser } from "../services/postService";
import {
  getUserdiaryEntries,
  creatediaryEntries,
} from "../services/diaryEntrieservice";
import { getReportsByUser } from "../services/reportService";

const Profile = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const [userPosts, setPosts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  // Diary state
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [diaryOpen, setDiaryOpen] = useState(false);

  const [profile, setProfile] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

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
    setProfile(updated);
  };

  const handleSaveDiary = async (entry) => {
    try {
      await creatediaryEntries(entry, profile.uid);

      const updated = await getUserdiaryEntries(profile.uid);
      setDiaryEntries(updated);

      toast.success("Diary saved!");
    } catch (err) {
      toast.error("Failed to save diary");
    }
  };

  if (loading || !profile) {
    return <p className="p-5">Loading...</p>;
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
          <p className="text-sm text-muted-foreground mb-6">
            {profile.bio || profile.email}
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
              Profile
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
            <h2 className="font-serif text-xl mb-4 text-foreground">Posts</h2>
            <div className="space-y-4">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
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
                    key={entry.id}
                    className="rounded-2xl border bg-card p-5 animate-fade-in"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-serif text-lg text-foreground">
                        {entry.title}
                      </h3>
                      <span className="text-xs text-muted-foreground shrink-0 ml-3">
                        {entry.date}
                      </span>
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
        onOpenChange={setDiaryOpen}
        onSave={handleSaveDiary}
      />
    </div>
  );
};

export default Profile;
