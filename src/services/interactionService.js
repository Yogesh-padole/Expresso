import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export const togglePostLike = async (postId, userId) => {
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);

  if (!snap.exists()) return;

  const likes = snap.data().likes || {};

  if (likes[userId]) delete likes[userId];
  else likes[userId] = "like";

  await updateDoc(ref, { likes });
};

export const addComment = async (postId, userId, userName, text) => {
  const ref = doc(db, "posts", postId);

  await updateDoc(ref, {
    comments: arrayUnion({
      userId,
      userName,
      text,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : null,
    }),
  });
};

export const toggleSavePost = async (postId, userId) => {
  const ref = doc(db, "posts", postId);
  const snap = await getDoc(ref);

  const saved = snap.data().savedBy || [];

  if (saved.includes(userId)) {
    await updateDoc(ref, { savedBy: arrayRemove(userId) });
  } else {
    await updateDoc(ref, { savedBy: arrayUnion(userId) });
  }
};
