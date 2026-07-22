import { createUserWithEmailAndPassword, deleteUser, getAuth } from 'firebase/auth';
import { collection, deleteDoc, doc, getDocs, getFirestore, setDoc } from 'firebase/firestore';
import { firebaseApp } from '../src/services/firebase.js';

const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const [postSnapshot, courseSnapshot] = await Promise.all([
  getDocs(collection(db, 'posts')),
  getDocs(collection(db, 'courses')),
]);

const email = `verify-${Date.now()}@mattara.local`;
const password = `Verify-${crypto.randomUUID()}!`;
const credential = await createUserWithEmailAndPassword(auth, email, password);
const checkReference = doc(db, 'appMeta', 'rules-check');
let publicWritesLocked = false;

try {
  await credential.user.getIdToken(true);
  await setDoc(checkReference, { checked: true });
  await deleteDoc(checkReference);
} catch (error) {
  if (error.code !== 'permission-denied') throw error;
  publicWritesLocked = true;
} finally {
  await deleteUser(credential.user);
}

if (!publicWritesLocked) throw new Error('Public course/post writes are still enabled.');
console.log(`Verified ${postSnapshot.size} posts, ${courseSnapshot.size} courses, secure writes.`);
