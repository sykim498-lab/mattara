import { getFirestoreDatabase } from './firebase';

export async function subscribeToPosts(onPosts, onError) {
  const db = await getFirestoreDatabase();
  const { collection, onSnapshot, query } = await import('firebase/firestore');
  return onSnapshot(query(collection(db, 'posts')), (snapshot) => {
    const posts = snapshot.docs
      .map((item) => item.data())
      .filter((item) => item.published !== false)
      .sort((a, b) => a.id - b.id);
    onPosts(posts);
  }, onError);
}

export async function subscribeToCourses(onCourses, onError) {
  const db = await getFirestoreDatabase();
  const { collection, onSnapshot, query } = await import('firebase/firestore');
  return onSnapshot(query(collection(db, 'courses')), (snapshot) => {
    const courses = snapshot.docs
      .map((item) => item.data())
      .filter((item) => item.published !== false)
      .sort((a, b) => a.number - b.number);
    onCourses(courses);
  }, onError);
}

export async function subscribeToBookmarks(userId, onBookmarks, onError) {
  const db = await getFirestoreDatabase();
  const { collection, onSnapshot } = await import('firebase/firestore');
  return onSnapshot(collection(db, 'users', userId, 'bookmarks'), (snapshot) => {
    onBookmarks(snapshot.docs.map((item) => Number(item.id)));
  }, onError);
}

export async function saveBookmark(userId, postId, saved) {
  const db = await getFirestoreDatabase();
  const { deleteDoc, doc, serverTimestamp, setDoc } = await import('firebase/firestore');
  const reference = doc(db, 'users', userId, 'bookmarks', String(postId));
  if (!saved) return deleteDoc(reference);
  return setDoc(reference, { postId, savedAt: serverTimestamp() });
}
