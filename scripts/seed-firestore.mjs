import { createUserWithEmailAndPassword, deleteUser, getAuth } from 'firebase/auth';
import { doc, getFirestore, serverTimestamp, writeBatch } from 'firebase/firestore';
import { guryeCourses } from '../src/data/guryeCourses.js';
import { posts } from '../src/data/posts.js';
import { firebaseApp } from '../src/services/firebase.js';

const auth = getAuth(firebaseApp);
const seedEmail = `seed-${Date.now()}@mattara.local`;
const seedPassword = `Seed-${crypto.randomUUID()}!`;
const credential = await createUserWithEmailAndPassword(auth, seedEmail, seedPassword);
await credential.user.getIdToken(true);
const db = getFirestore(firebaseApp);
const batch = writeBatch(db);

posts.forEach((post) => {
  batch.set(doc(db, 'posts', String(post.id)), post);
});

guryeCourses.forEach((course) => {
  batch.set(doc(db, 'courses', course.id), course);
});

batch.set(doc(db, 'appMeta', 'seed'), {
  postCount: posts.length,
  courseCount: guryeCourses.length,
  seededAt: serverTimestamp(),
});

try {
  await batch.commit();
  console.log(`Seeded ${posts.length} posts and ${guryeCourses.length} courses.`);
} finally {
  await deleteUser(credential.user);
}
