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
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { getLogUser } from "../services/userService";
import { db } from "../firebase/firebase";

//
// 🔄 MAP POST (Firestore → UI)
//
const mapPost = (docSnap, currentUserId = null, userData = {}) => {
  const data = docSnap.data();

  return {
    id: docSnap.id,

    title: data.title || "",
    content: data.content || "",
    tags: data.tags || [],

    author: {
      id: data.authorId,
      name:
        data.author === "Anonymous"
          ? data.author
          : userData.name || data.author || "User",
      avatar:
        "https://ui-avatars.com/api/?name=" +
        encodeURIComponent(data.author || userData.name || "User"),
    },

    createdAt: data.createdAt || null,

    likes: Object.keys(data.likes || {}).length,
    likedByUser: currentUserId ? !!data.likes?.[currentUserId] : false,

    comments: data.comments || [],
  };
};

//
// ➕ CREATE POST
//
export const createPost = async (postData, userId, userEmail) => {
  const postsRef = collection(db, "posts");

  const newPost = {
    title: postData.title,
    content: postData.content, // ✅ FIXED
    tags: postData.tags || [],
    authorId: userId,
    author: postData.author,
    authorEmail: userEmail,
    createdAt: serverTimestamp(),
    likes: {},
  };

  const docRef = await addDoc(postsRef, newPost);

  // (optional) track post IDs in user doc
  await updateDoc(doc(db, "users", userId), {
    postsCount: arrayUnion(docRef.id),
  });

  return docRef;
};

//
// 📥 GET ALL POSTS
//
export const getAllPosts = async (currentUserId = null) => {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);

  const posts = await Promise.all(
    snap.docs.map(async (docSnap) => {
      const data = docSnap.data();

      let userData = {};

      if (data.authorId) {
        try {
          userData = await getLogUser(data.authorId);
        } catch {
          userData = {};
        }
      }

      return mapPost(docSnap, currentUserId, userData);
    }),
  );

  return posts;
};

export const getPostById = async (postId, currentUserId = null) => {
  try {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);

    if (!postSnap.exists()) {
      throw new Error("Post not found");
    }

    const data = postSnap.data();

    let userData = {};

    if (data.authorId) {
      try {
        userData = await getLogUser(data.authorId);
      } catch {
        userData = {};
      }
    }

    return mapPost(postSnap, data.authorId, userData);
  } catch (error) {
    console.error("Error fetching post:", error);
    throw error;
  }
};

//
// 👤 GET POSTS BY USER
//
export const getPostsByUser = async (userId) => {
  try {
    const q = query(
      collection(db, "posts"),
      where("authorId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const snap = await getDocs(q);

    let userData = {};

    try {
      userData = await getLogUser(userId);
    } catch {
      userData = {};
    }

    return snap.docs.map((docSnap) => mapPost(docSnap, userId, userData));
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

//
// ✏️ UPDATE POST
//
export const updatePost = async (postId, updates) => {
  await updateDoc(doc(db, "posts", postId), {
    ...updates,
    updatedAt: serverTimestamp(), // ✅ FIXED
  });
};

//
// 🗑 DELETE POST
//
export const deletePost = async (postId) => {
  const commentsRef = collection(db, "posts", postId, "comments");
  const snap = await getDocs(commentsRef);

  for (const c of snap.docs) {
    await deleteDoc(c.ref);
  }

  await deleteDoc(doc(db, "posts", postId));
};
