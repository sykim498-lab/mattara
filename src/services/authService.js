import { getFirebaseAuth, getFirestoreDatabase } from './firebase';
import { uploadPostImages } from './storageService';

const FALLBACK_POST_IMAGE = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=85';

function authError(error) {
  const messages = {
    'auth/email-already-in-use': '이미 가입된 이메일입니다.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/invalid-email': '올바른 이메일 주소를 입력해 주세요.',
    'auth/operation-not-allowed': 'Firebase에서 해당 로그인 방식을 먼저 활성화해 주세요.',
    'auth/popup-closed-by-user': '로그인 창이 닫혔습니다.',
    'auth/weak-password': '비밀번호는 8자 이상으로 설정해 주세요.',
  };
  return new Error(messages[error.code] ?? error.message ?? '로그인 처리 중 오류가 발생했습니다.');
}

export async function signInWithPassword(identifier, password) {
  const auth = await getFirebaseAuth();
  const { signInWithEmailAndPassword } = await import('firebase/auth');
  try {
    const result = await signInWithEmailAndPassword(auth, identifier.trim(), password);
    return { user: result.user, requiresEmailConfirmation: false };
  } catch (error) {
    throw authError(error);
  }
}

export async function signUpWithPassword(identifier, password) {
  const auth = await getFirebaseAuth();
  const { createUserWithEmailAndPassword } = await import('firebase/auth');
  try {
    const result = await createUserWithEmailAndPassword(auth, identifier.trim(), password);
    const db = await getFirestoreDatabase();
    const { doc, serverTimestamp, setDoc } = await import('firebase/firestore');
    await setDoc(doc(db, 'users', result.user.uid), {
      email: result.user.email,
      role: 'member',
      createdAt: serverTimestamp(),
    }, { merge: true });
    return { user: result.user, requiresEmailConfirmation: false };
  } catch (error) {
    throw authError(error);
  }
}

export async function signOut() {
  const auth = await getFirebaseAuth();
  const { signOut: firebaseSignOut } = await import('firebase/auth');
  await firebaseSignOut(auth);
}

export async function publishRestaurant(values) {
  const { photos = [], ...document } = values;
  const uploadId = crypto.randomUUID();
  let usedFallbackImage = false;
  let images;
  try {
    images = await uploadPostImages(values.user_id, uploadId, photos);
  } catch {
    usedFallbackImage = true;
    images = [{
      url: FALLBACK_POST_IMAGE,
      comment: photos[0]?.comment?.trim() || document.description,
      lat: Number(photos[0]?.lat) || null,
      lng: Number(photos[0]?.lng) || null,
      order: 0,
    }];
  }
  const postId = Date.now();
  const db = await getFirestoreDatabase();
  const { doc, serverTimestamp, setDoc } = await import('firebase/firestore');
  await setDoc(doc(db, 'posts', String(postId)), {
    id: postId,
    ownerId: document.user_id,
    name: document.name,
    region: document.region,
    address: document.address,
    menu: document.menu,
    caption: document.description,
    tags: document.tags,
    images,
    author: document.author_name,
    handle: `@${document.author_email.split('@')[0]}`,
    avatar: images[0]?.url ?? '',
    rating: 0,
    likes: 0,
    comments: 0,
    published: true,
    createdAt: serverTimestamp(),
  });
  return { id: postId, status: 'published', usedFallbackImage };
}
