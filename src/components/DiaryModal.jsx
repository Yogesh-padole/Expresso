import { useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

const DiaryModal = ({ open, onOpenChange, onSave }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleSubmit = () => {
    if (!isValid) return;
    onSave({
      id: `d${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      date: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    });
    toast.success("Diary entry saved ✨");
    setTitle("");
    setContent("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <BookOpen className="h-5 w-5 text-primary" />
            New Diary Entry
          </DialogTitle>
          <DialogDescription>
            Write down your thoughts privately.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Title</p>
            <Input
              placeholder="Entry title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Content</p>
            <Textarea
              placeholder="What's on your mind today?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[140px] resize-none rounded-xl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!isValid} onClick={handleSubmit}>
            Save Entry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiaryModal;
