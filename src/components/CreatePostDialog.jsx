import { useState } from "react";
import { Ghost, X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { auth } from "../firebase/firebase";
const categories = [
  "self-care",
  "growth",
  "career",
  "relationships",
  "mental-health",
  "gratitude",
  "habits",
  "creativity",
  "family",
  "grief",
  "vulnerability",
  "forgiveness",
];
const CreatePostDialog = ({ open, onOpenChange, onPost }) => {
  const user = auth.currentUser;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const maxChars = 1000;
  const charCount = content.length;
  const isWarning = charCount >= 400;
  const isValid =
    title.trim().length > 0 &&
    content.trim().length >= 10 &&
    selectedTags.length > 0;
  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length < 5
          ? [...prev, tag]
          : prev,
    );
  };
  const addCustomTag = () => {
    const tag = customTag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    if (tag && !selectedTags.includes(tag) && selectedTags.length < 5) {
      setSelectedTags((prev) => [...prev, tag]);
      setCustomTag("");
    }
  };
  const handleSubmit = () => {
    if (!isValid) return;
    const newPost = {
      author: isAnonymous ? "Anonymous" : user.displayName || user.email,
      title,
      content,
      tags: selectedTags,
      likes: 0,
      liked: false,
      saved: false,
      commentCount: 0,
      isAnonymous,
    };
    onPost(newPost);
    setTitle("");
    setContent("");
    setSelectedTags([]);
    setIsAnonymous(false);
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-card border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-foreground">
            Create a Post
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Share your thoughts, experiences, or lessons learned.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          {/* Title */}
          <div>
            <Input
              placeholder="Post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
          </div>
          {/* Content */}
          <div>
            <Textarea
              placeholder="What's on your mind? Share an experience, a lesson, or a thought..."
              value={content}
              onChange={(e) =>
                e.target.value.length <= maxChars && setContent(e.target.value)
              }
              className={`min-h-[140px] resize-none rounded-xl border bg-background text-foreground placeholder:text-muted-foreground ${isAnonymous ? "border-accent/40 bg-[hsl(var(--anon-bg))]" : ""}`}
            />
            <div className="flex justify-between mt-1.5">
              <p
                className={`text-xs ${isWarning ? "text-destructive" : "text-muted-foreground"}`}
              >
                {isWarning
                  ? `${maxChars - charCount} characters remaining`
                  : `${charCount}/${maxChars}`}
              </p>
              <p className="text-xs text-muted-foreground">Min 10 characters</p>
            </div>
          </div>
          {/* Category / Tags */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Categories (pick up to 5)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors press-scale ${selectedTags.includes(tag) ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-primary/10"}`}
                >
                  #{tag}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Add custom tag..."
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), addCustomTag())
                }
                className="h-8 text-xs rounded-lg"
              />
              <button
                onClick={addCustomTag}
                className="shrink-0 rounded-lg bg-secondary p-1.5 text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors press-scale"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* Anonymous toggle */}
          <div
            className={`flex items-center justify-between rounded-xl border p-3 transition-colors ${isAnonymous ? "border-accent/40 bg-[hsl(var(--anon-bg))]" : "bg-background"}`}
          >
            <div className="flex items-center gap-2.5">
              <Ghost
                className={`h-5 w-5 ${isAnonymous ? "text-accent" : "text-muted-foreground"}`}
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Post Anonymously
                </p>
                <p className="text-xs text-muted-foreground">
                  Your identity will be hidden
                </p>
              </div>
            </div>
            <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
          </div>
          {/* Selected tags preview */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {selectedTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                >
                  #{tag}
                  <button
                    onClick={() => toggleTag(tag)}
                    className="hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground press-scale hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isAnonymous
              ? "\u{1F47B} Post Anonymously"
              : "\u2615 Share Your Story"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default CreatePostDialog;
