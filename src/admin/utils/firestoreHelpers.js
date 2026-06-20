// Firestore Helper Functions
// Centralized functions for database operations to keep components clean
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

// ===== GET SIZE =====
export const subscribeToSize = (colName, callback) => {
  const colRef = collection(db, colName);

  const unsubscribe = onSnapshot(colRef, (snapshot) => {
    callback(snapshot.size);
  });

  return unsubscribe;
};

export const subscribeToPendingReportSize = (colName, callback) => {
  const colRef = collection(db, colName);

  // Query: resolved == false OR resolved does not exist
  const q = query(colRef, where("resolved", "in", [false, null]));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });

  return unsubscribe;
};

// ===== POST OPERATIONS =====

// Create a new public post
export const createPost = async (postData, userId, userEmail, userName) => {
  try {
    const postsRef = collection(db, "posts");
    const newPost = {
      title: postData.title,
      body: postData.body,
      tags: postData.tags || [],
      authorId: userId,
      authorName: postData.anonymous ? "Anonymous" : userName,
      authorEmail: userEmail, // Always store real email for admin use
      anonymous: postData.anonymous || false,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : null,
      likes: {}, // Map of userId -> reactionType
      comments: [],
      savedBy: [],
    };

    const docRef = await addDoc(postsRef, newPost);

    // Update user's post count
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      postsCount: arrayUnion(docRef.id),
    });

    return docRef;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Get all public posts
export const getAllPosts = async () => {
  try {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

// Get posts by specific user
export const getPostsByUser = async (userId) => {
  try {
    const postsRef = collection(db, "posts");
    const q = query(
      postsRef,
      where("authorId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

// Update post (for editing)
export const updatePost = async (postId, updates) => {
  try {
    const postRef = doc(db, "posts", postId);
    await updateDoc(postRef, {
      ...updates,
      updatedAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : null,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    throw error;
  }
};

// Delete post
export const deletePost = async (postId) => {
  try {
    const postRef = doc(db, "posts", postId);

    // delete all comments inside this post
    const commentsRef = collection(db, "posts", postId, "comments");
    const commentsSnap = await getDocs(commentsRef);

    for (const commentDoc of commentsSnap.docs) {
      await deleteDoc(commentDoc.ref);
    }

    // finally delete the post itself
    await deleteDoc(postRef);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

// ===== INTERACTION OPERATIONS =====

// Add like/reaction to post
export const togglePostLike = async (postId, userId, reactionType = "like") => {
  try {
    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const currentLikes = postDoc.data().likes || {};
      const newLikes = { ...currentLikes };

      // Toggle like - if user already liked, remove; otherwise add
      if (newLikes[userId]) {
        delete newLikes[userId];
      } else {
        newLikes[userId] = reactionType;
      }

      await updateDoc(postRef, { likes: newLikes });
    }
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw error;
  }
};

// Add comment to post
export const addComment = async (postId, userId, userName, commentText) => {
  try {
    const postRef = doc(db, "posts", postId);
    const newComment = {
      userId,
      userName,
      text: commentText,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : null,
    };

    await updateDoc(postRef, {
      comments: arrayUnion(newComment),
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Toggle save post
export const toggleSavePost = async (postId, userId) => {
  try {
    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const savedBy = postDoc.data().savedBy || [];

      if (savedBy.includes(userId)) {
        // Remove from saved
        await updateDoc(postRef, {
          savedBy: arrayRemove(userId),
        });
      } else {
        // Add to saved
        await updateDoc(postRef, {
          savedBy: arrayUnion(userId),
        });
      }
    }
  } catch (error) {
    console.error("Error toggling save post:", error);
    throw error;
  }
};

// ===== diaryEntries OPERATIONS =====

// Create private diaryEntries entry
export const creatediaryEntries = async (diaryEntriesData, userId) => {
  try {
    const diaryEntriesRef = collection(db, "diaryEntries");
    const newdiaryEntries = {
      title: diaryEntriesData.title,
      body: diaryEntriesData.body,
      authorId: userId,
      createdAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : null,
      private: true,
    };

    return await addDoc(diaryEntriesRef, newdiaryEntries);
  } catch (error) {
    console.error("Error creating diaryEntries:", error);
    throw error;
  }
};

// Get user's private diaryEntries
export const getUserdiaryEntries = async (userId) => {
  try {
    const diaryEntriesRef = collection(db, "diaryEntries");
    const q = query(
      diaryEntriesRef,
      where("authorId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching diaryEntries:", error);
    throw error;
  }
};

export const updatediaryEntries = async (diaryEntriesId, updates) => {
  try {
    const diaryEntriesRef = doc(db, "diaryEntries", diaryEntriesId);
    await updateDoc(diaryEntriesRef, {
      ...updates,
      updatedAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : null,
    });
  } catch (error) {
    console.error("Error updating diaryEntries:", error);
    throw error;
  }
};

export const deletediaryEntries = async (diaryEntriesId) => {
  try {
    const diaryEntriesRef = doc(db, "diaryEntries", diaryEntriesId);
    await deleteDoc(diaryEntriesRef);
  } catch (error) {
    console.error("Error deleting diaryEntries:", error);
    throw error;
  }
};

// ===== REPORT OPERATIONS =====

// Create report for a post
export const createReport = async (
  postId,
  postTitle,
  reporterId,
  reporterEmail,
  postOwnerEmail,
  reason = "",
) => {
  try {
    const reportsRef = collection(db, "reports");
    const newReport = {
      postId,
      postTitle,
      reporterId,
      reporterEmail,
      postOwnerEmail,
      reportedAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : null,
      reason,
      resolved: false,
    };

    return await addDoc(reportsRef, newReport);
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
};

// Get all reports for admin
export const getAllReports = async () => {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(
      reportsRef,
      //   where("resolved", "==", false),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
};

//getReports RealTime
export const subscribeToReports = (callback) => {
  const reportsRef = collection(db, "reports");
  const q = query(reportsRef, orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const reportsData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(reportsData);
  });

  return unsubscribe; // allows cleanup
};

// Mark report as resolved
export const resolveReport = async (reportId) => {
  try {
    const reportRef = doc(db, "reports", reportId);
    await updateDoc(reportRef, {
      resolved: true,
      resolvedAt: data.createdAt?.toDate
        ? data.createdAt.toDate().toLocaleString()
        : null,
    });
  } catch (error) {
    console.error("Error resolving report:", error);
    throw error;
  }
};

// Add this function to firestoreHelpers.js for reusability
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

// Delete a single report
export const deleteReport = async (reportId) => {
  try {
    const reportRef = doc(db, "reports", reportId);
    await deleteDoc(reportRef);
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
};

// Delete all completed reports
export const deleteAllCompletedReports = async () => {
  try {
    const reportsRef = collection(db, "reports");
    const q = query(reportsRef, where("resolved", "==", true));
    const snapshot = await getDocs(q);

    const deletePromises = snapshot.docs.map(async (reportDoc) => {
      const reportRef = doc(db, "reports", reportDoc.id);
      await deleteDoc(reportRef);
    });

    await Promise.all(deletePromises);
    return snapshot.docs.length;
  } catch (error) {
    console.error("Error deleting completed reports:", error);
    throw error;
  }
};
