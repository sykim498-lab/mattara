import { getFirestoreDatabase } from './firebase';

export async function subscribeToComments(feedId, onComments, onError) {
  const db = await getFirestoreDatabase();
  const { collection, onSnapshot, orderBy, query } = await import('firebase/firestore');
  const reference = collection(db, 'feedComments', feedId, 'comments');
  return onSnapshot(query(reference, orderBy('createdAt', 'asc')), (snapshot) => {
    onComments(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, onError);
}

export async function addComment(feedId, user, text) {
  const db = await getFirestoreDatabase();
  const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
  return addDoc(collection(db, 'feedComments', feedId, 'comments'), {
    userId: user.uid,
    author: user.displayName || user.email?.split('@')[0] || '맛따라 여행자',
    text: text.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function deleteComment(feedId, commentId) {
  const db = await getFirestoreDatabase();
  const { deleteDoc, doc } = await import('firebase/firestore');
  return deleteDoc(doc(db, 'feedComments', feedId, 'comments', commentId));
}
