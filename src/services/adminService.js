import { getFirestoreDatabase } from './firebase';

const MANAGED_COLLECTIONS = new Set(['posts', 'courses']);

export async function subscribeAdminCollection(collectionName, onData, onError) {
  const db = await getFirestoreDatabase();
  const { collection, onSnapshot, query } = await import('firebase/firestore');
  return onSnapshot(query(collection(db, collectionName)), (snapshot) => {
    const items = snapshot.docs.map((item) => ({
      ...item.data(),
      documentId: item.id,
    }));
    onData(items);
  }, onError);
}

export async function saveAdminResource(collectionName, documentId, values) {
  if (!MANAGED_COLLECTIONS.has(collectionName)) throw new Error('관리할 수 없는 데이터입니다.');
  const db = await getFirestoreDatabase();
  const { doc, serverTimestamp, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, collectionName, String(documentId)), {
    ...values,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function deleteAdminResource(collectionName, documentId) {
  if (!MANAGED_COLLECTIONS.has(collectionName)) throw new Error('관리할 수 없는 데이터입니다.');
  const db = await getFirestoreDatabase();
  const { deleteDoc, doc } = await import('firebase/firestore');
  await deleteDoc(doc(db, collectionName, String(documentId)));
}

export async function updateMemberRole(userId, role) {
  const allowed = new Set(['member', 'editor', 'admin']);
  if (!allowed.has(role)) throw new Error('올바르지 않은 회원 레벨입니다.');
  const db = await getFirestoreDatabase();
  const { doc, serverTimestamp, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'users', userId), { role, updatedAt: serverTimestamp() });
}

export async function promoteLegacyMembers(userIds) {
  if (!userIds.length) return;
  const db = await getFirestoreDatabase();
  const { doc, serverTimestamp, writeBatch } = await import('firebase/firestore');
  const batch = writeBatch(db);
  userIds.forEach((userId) => batch.update(doc(db, 'users', userId), {
    role: 'admin',
    updatedAt: serverTimestamp(),
  }));
  await batch.commit();
}

export async function updateSubmissionStatus(submissionId, status) {
  const db = await getFirestoreDatabase();
  const { doc, serverTimestamp, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(db, 'restaurant_submissions', submissionId), {
    status,
    reviewedAt: serverTimestamp(),
  });
}
