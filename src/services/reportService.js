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
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const mapReport = (doc) => {
  const data = doc.data();

  return {
    id: doc.id,

    postId: data.postId,
    postTitle: data.postTitle,

    reason: data.reason,

    status: data.status || (data.resolved ? "completed" : "pending"),

    resolved: data.resolved || false,

    resolutionNote: data.resolutionNote || null,

    createdAt: data.createdAt || null,
    resolvedAt: data.resolvedAt || null,
  };
};

export const createReport = async (data) => {
  return await addDoc(collection(db, "reports"), {
    ...data,
    createdAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleString()
      : null,
    resolved: false,
  });
};

export const getAllReports = async () => {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getReportsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, "reports"),
      where("reportedBy", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snap = await getDocs(q);

    return snap.docs.map((doc) => mapReport(doc));
  } catch (error) {
    console.error("Error fetching user reports:", error);
    throw error;
  }
};

export const subscribeToReports = (callback) => {
  const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
};

export const resolveReport = async (id) => {
  await updateDoc(doc(db, "reports", id), {
    resolved: true,
    resolvedAt: data.createdAt?.toDate
      ? data.createdAt.toDate().toLocaleString()
      : null,
  });
};

export const resolveReportsForPost = async (postId) => {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, where("postId", "==", postId));
    const snapshot = await getDocs(q);

    const updatePromises = snapshot.docs.map(async (reportDoc) => {
      const reportRef = doc(db, "reports", reportDoc.id);
      await updateDoc(reportRef, {
        status: "completed",
        resolved: true,
        resolvedAt: data.createdAt?.toDate
          ? data.createdAt.toDate().toLocaleString()
          : null,
        resolutionNote: "Post was deleted",
      });
    });

    await Promise.all(updatePromises);
    return snapshot.docs.length;
  } catch (error) {
    console.error("Error resolving reports for post:", error);
    throw error;
  }
};

export const deleteReport = async (id) => {
  await deleteDoc(doc(db, "reports", id));
};
