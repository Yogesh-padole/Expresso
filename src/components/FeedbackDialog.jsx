import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
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
import { Textarea } from "../components/ui/textarea";

const FeedbackDialog = ({ open, onOpenChange }) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");

  const isValid = rating > 0 && feedback.trim().length >= 5;

  const handleSubmit = () => {
    if (!isValid) return;
    toast.success("Feedback submitted successfully");
    setRating(0);
    setFeedback("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <MessageSquare className="h-5 w-5 text-primary" />
            Share Your Feedback
          </DialogTitle>
          <DialogDescription>
            We'd love to hear how we can improve Expresso for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Star Rating */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="press-scale transition-transform"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hovered || rating)
                        ? "fill-primary text-primary"
                        : "text-muted-foreground/40"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          {/* Feedback text */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Suggestions / Feedback
            </p>
            <Textarea
              placeholder="Tell us what you think..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px] resize-none rounded-xl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!isValid} onClick={handleSubmit}>
            Submit Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackDialog;
