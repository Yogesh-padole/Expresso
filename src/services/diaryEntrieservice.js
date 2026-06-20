import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

export const creatediaryEntries = async (data, userId) => {
  return await addDoc(collection(db, "diaryEntries"), {
    ...data,
    userId,
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleString()
      : null,
  });
};

export const getUserdiaryEntries = async (userId) => {
  const q = query(
    collection(db, "diaryEntries"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), docId: d.id }));
};

export const updatediaryEntries = async (id, updates) => {
  await updateDoc(doc(db, "diaryEntries", id), {
    ...updates,
    updatedAt: new Date().toLocaleString(),
  });
};

export const deletediaryEntries = async (id) => {
  await deleteDoc(doc(db, "diaryEntries", id));
};
