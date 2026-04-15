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
    userId: user.uid,
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
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updatediaryEntries = async (id, updates) => {
  await updateDoc(doc(db, "diaryEntries", id), {
    ...updates,
    updatedAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleString()
      : null,
  });
};

export const deletediaryEntries = async (id) => {
  await deleteDoc(doc(db, "diaryEntries", id));
};
