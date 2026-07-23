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

export async function subscribeToBookmarkCounts(itemType, onCounts, onError) {
  const db = await getFirestoreDatabase();
  const { collection, onSnapshot } = await import('firebase/firestore');
  return onSnapshot(collection(db, 'bookmarkCounts'), (snapshot) => {
    const counts = new Map();
    snapshot.docs.forEach((item) => {
      const data = item.data();
      if (data.itemType === itemType) counts.set(String(data.itemId), data.count ?? 0);
    });
    onCounts(counts);
  }, onError);
}

async function updateSavedItem(userId, itemId, itemType, collectionName, saved) {
  const db = await getFirestoreDatabase();
  const {
    deleteDoc,
    doc,
    runTransaction,
    serverTimestamp,
  } = await import('firebase/firestore');
  const stringId = String(itemId);
  const savedReference = doc(db, 'users', userId, collectionName, stringId);
  const countReference = doc(db, 'bookmarkCounts', `${itemType}_${stringId}`);

  return runTransaction(db, async (transaction) => {
    const [savedSnapshot, countSnapshot] = await Promise.all([
      transaction.get(savedReference),
      transaction.get(countReference),
    ]);
    const currentlySaved = savedSnapshot.exists();
    const currentCount = countSnapshot.exists() ? countSnapshot.data().count ?? 0 : 0;
    if (currentlySaved === saved) return { saved, count: currentCount };

    if (saved) {
      transaction.set(savedReference, {
        [`${itemType}Id`]: itemId,
        counted: true,
        savedAt: serverTimestamp(),
      });
      transaction.set(countReference, {
        itemId: stringId,
        itemType,
        count: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
      return { saved: true, count: currentCount + 1 };
    }

    transaction.delete(savedReference);
    const wasCounted = savedSnapshot.data()?.counted === true;
    if (wasCounted && currentCount > 0) {
      transaction.update(countReference, {
        count: currentCount - 1,
        updatedAt: serverTimestamp(),
      });
      return { saved: false, count: currentCount - 1 };
    }
    return { saved: false, count: currentCount };
  }).catch(async (error) => {
    if (!saved && error.code === 'not-found') await deleteDoc(savedReference);
    throw error;
  });
}

export async function saveBookmark(userId, postId, saved) {
  return updateSavedItem(userId, postId, 'post', 'bookmarks', saved);
}

export async function subscribeToSavedCourses(userId, onCourses, onError) {
  const db = await getFirestoreDatabase();
  const { collection, onSnapshot } = await import('firebase/firestore');
  return onSnapshot(collection(db, 'users', userId, 'savedCourses'), (snapshot) => {
    onCourses(snapshot.docs.map((item) => item.id));
  }, onError);
}

export async function saveCourse(userId, courseId, saved) {
  return updateSavedItem(userId, courseId, 'course', 'savedCourses', saved);
}
