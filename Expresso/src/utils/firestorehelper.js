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
import { db } from "../firebase/init";

// ===== USER OPERATIONS =====

// Create or update user profile in Firestore
// Called after successful authentication to store user data
export const createUserProfile = async (user) => {
  try {
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user profile
      await updateDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split("@")[0],
        postsCount: 0,
        createdAt: serverTimestamp(),
      });
    }
    return userRef;
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Get all users for admin dashboard
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

//delete Users
export const deleteUsers = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
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
      createdAt: serverTimestamp(),
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
      orderBy("createdAt", "desc")
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
      updatedAt: serverTimestamp(),
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
      createdAt: serverTimestamp(),
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

// ===== JOURNAL OPERATIONS =====

// Create private journal entry
export const createJournal = async (journalData, userId) => {
  try {
    const journalsRef = collection(db, "journals");
    const newJournal = {
      title: journalData.title,
      body: journalData.body,
      authorId: userId,
      createdAt: serverTimestamp(),
      private: true,
    };

    return await addDoc(journalsRef, newJournal);
  } catch (error) {
    console.error("Error creating journal:", error);
    throw error;
  }
};

// Get user's private journals
export const getUserJournals = async (userId) => {
  try {
    const journalsRef = collection(db, "journals");
    const q = query(
      journalsRef,
      where("authorId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching journals:", error);
    throw error;
  }
};

export const updateJournal = async (journalId, updates) => {
  try {
    const journalRef = doc(db, "journals", journalId);
    await updateDoc(journalRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating journal:", error);
    throw error;
  }
};

export const deleteJournal = async (journalId) => {
  try {
    const journalRef = doc(db, "journals", journalId);
    await deleteDoc(journalRef);
  } catch (error) {
    console.error("Error deleting journal:", error);
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
  reason = ""
) => {
  try {
    const reportsRef = collection(db, "reports");
    const newReport = {
      postId,
      postTitle,
      reporterId,
      reporterEmail,
      postOwnerEmail,
      reportedAt: serverTimestamp(),
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
      orderBy("createdAt", "desc")
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
      resolvedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error resolving report:", error);
    throw error;
  }
};

// ===== FEEDBACK OPERATIONS =====
 try {
      await addDoc(collection(db, "feedbacks"), {
        username: formData.username,
        email: formData.email,
        suggestion: formData.suggestion,
        stars: Number(formData.stars), // save as number in Firestore
        date: serverTimestamp(),
      });
      setSubmitted(true);
      setFormData({ username: "", email: "", suggestion: "", stars: "0" });
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
