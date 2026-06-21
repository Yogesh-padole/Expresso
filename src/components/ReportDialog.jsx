import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import { createReport } from "../services/reportService";
import { auth } from "../firebase/firebase";
import { Button } from "../components/ui/button";

const reasons = ["Spam", "Abuse", "Harassment", "Other"];

const ReportDialog = ({ type = "post", trigger, postId }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleSubmit = async () => {
    if (!selected) return;

    try {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);

      const postTitle = postSnap.exists()
        ? postSnap.data().title
        : "Unknown Post";

      const existingQuery = query(
        collection(db, "reports"),
        where("postId", "==", postId),
        where("reportedBy", "==", auth.currentUser.uid),
      );

      const existingSnap = await getDocs(existingQuery);

      if (!existingSnap.empty) {
        toast.error("You have already reported this post");
        return;
      }

      const postData = postSnap.exists() ? postSnap.data() : {};

      await createReport({
        postId,

        postTitle: postData.title || "Untitled Post",
        postAuthor: postData.author || "Unknown",
        postAuthorId: postData.authorId || null,

        reason: selected,

        reportedBy: auth.currentUser?.uid,
        reportedByEmail: auth.currentUser?.email,

        status: "pending",
      });

      toast.success("Report submitted successfully");

      setOpen(false);
      setSelected(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit report");
    }
  };

  return (
    <>
      <span onClick={() => setOpen(true)}>{trigger}</span>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSelected(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Report {type}
            </DialogTitle>
            <DialogDescription>
              Why are you reporting this {type}?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            {reasons.map((reason) => (
              <button
                key={reason}
                onClick={() => setSelected(reason)}
                className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
                  selected === reason
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "border-border bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {reason}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!selected}
              onClick={handleSubmit}
            >
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReportDialog;
