import { getFirebaseAuth, getFirestoreDatabase } from './firebase';
import { compressImageFile } from './imageService';

export async function subscribePublicProfiles(onProfiles, onError) {
  const db = await getFirestoreDatabase();
  const { collection, onSnapshot } = await import('firebase/firestore');
  return onSnapshot(collection(db, 'publicProfiles'), (snapshot) => {
    onProfiles(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
  }, onError);
}

export async function savePublicProfile(user, values) {
  const displayName = values.displayName.trim();
  if (!displayName) throw new Error('아이디를 입력해 주세요.');
  let avatar = values.currentAvatar || user.photoURL || '';
  if (values.avatarFile) avatar = await compressImageFile(values.avatarFile, 180000);
  const handle = `@${displayName.replaceAll(' ', '').toLocaleLowerCase('ko-KR')}`;
  const auth = await getFirebaseAuth();
  const db = await getFirestoreDatabase();
  const [{ updateProfile }, { doc, serverTimestamp, setDoc }] = await Promise.all([
    import('firebase/auth'),
    import('firebase/firestore'),
  ]);
  await Promise.all([
    updateProfile(auth.currentUser ?? user, { displayName }),
    setDoc(doc(db, 'publicProfiles', user.uid), {
      displayName,
      handle,
      avatar,
      updatedAt: serverTimestamp(),
    }, { merge: true }),
    setDoc(doc(db, 'users', user.uid), {
      displayName,
      updatedAt: serverTimestamp(),
    }, { merge: true }),
  ]);
  return { displayName, handle, avatar };
}
