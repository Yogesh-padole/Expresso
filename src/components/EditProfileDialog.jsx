import { useState } from "react";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { getAuth } from "firebase/auth";
import { getLogUser, updateUser } from "../services/userService";
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

const EditProfileDialog = ({ open, onOpenChange, profile, onSave }) => {
  const auth = getAuth();
  const [name, setName] = useState(profile.name || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [contact, setContact] = useState(profile.contact || "");
  const [avatar, setAvatar] = useState(profile.avatar || "");

  const isValid = name.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      const firebaseUser = auth.currentUser;

      await updateUser(firebaseUser.uid, {
        ...profile,
        name,
        bio,
        contact,
        avatar,
      });

      const userData = await getLogUser(firebaseUser.uid);

      onSave(userData);

      toast.success("Profile updated");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-serif text-xl">
            <Pencil className="h-5 w-5 text-primary" />
            Edit Profile
          </DialogTitle>
          <DialogDescription>
            Update your public profile information.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Name</p>
            <Input
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">Bio</p>
            <Textarea
              placeholder="Tell others about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[80px] resize-none rounded-xl"
            />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-2">contact</p>
            <Textarea
              placeholder="Your Contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="min-h-[80px] resize-none rounded-xl"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!isValid} onClick={handleSubmit}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
