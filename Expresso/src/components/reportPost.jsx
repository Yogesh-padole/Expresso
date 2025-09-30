import { db, auth } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

/**
 * Reports a post by adding it to the 'reports' collection
 * @param {string} postId - ID of the post to report
 * @param {string} reason - Reason for reporting
 */
export const reportPost = async (postId, reason = "Inappropriate content") => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in to report a post.");
  }

  if (!postId || postId.trim() === "") {
    throw new Error("Invalid post ID.");
  }

  if (!reason || reason.trim() === "") {
    throw new Error("Please select a reason for reporting.");
  }

  try {
    await addDoc(collection(db, "reports"), {
      postId,
      reportedBy: user.uid,
      reason,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error("Error reporting post:", error);
    throw error;
  }
};
