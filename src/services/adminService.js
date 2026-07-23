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

export async function updateSubmissionStatus(submission, status) {
  const db = await getFirestoreDatabase();
  const { doc, serverTimestamp, writeBatch } = await import('firebase/firestore');
  const batch = writeBatch(db);
  const reference = doc(db, 'restaurant_submissions', submission.documentId);
  batch.update(reference, {
    status,
    reviewedAt: serverTimestamp(),
  });
  if (status === 'approved') {
    const postId = Date.now();
    batch.set(doc(db, 'posts', String(postId)), {
      id: postId,
      name: submission.name,
      region: submission.region,
      address: submission.address,
      menu: submission.menu,
      hours: submission.hours ?? '방문 전 운영시간 확인',
      phone: submission.phone ?? '매장 문의',
      placeId: submission.placeId ?? '',
      googleMapsUri: submission.googleMapsUri ?? '',
      website: submission.website ?? '',
      placeSource: submission.placeSource ?? '',
      caption: submission.description,
      tags: submission.tags ?? [],
      images: submission.images ?? [],
      author: submission.author_name ?? '구례 여행자',
      handle: submission.author_email ? `@${submission.author_email.split('@')[0]}` : '@gurye_local',
      avatar: submission.images?.[0]?.url ?? '',
      rating: 0,
      likes: 0,
      comments: 0,
      published: true,
      submissionId: submission.documentId,
      createdAt: serverTimestamp(),
    });
  }
  await batch.commit();
}
