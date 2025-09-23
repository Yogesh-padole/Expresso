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
