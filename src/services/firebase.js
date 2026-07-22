import { getApp, getApps, initializeApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: 'AIzaSyAE4ysPoW1dasLAjpT_o8X7jPCuv6eDJKQ',
  authDomain: 'mattara-93eb1.firebaseapp.com',
  projectId: 'mattara-93eb1',
  storageBucket: 'mattara-93eb1.firebasestorage.app',
  messagingSenderId: '1081980080861',
  appId: '1:1081980080861:web:95c96349ec4c50e7a6c134',
  measurementId: 'G-E68S4ZZB95',
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export async function getFirestoreDatabase() {
  const { getFirestore } = await import('firebase/firestore');
  return getFirestore(firebaseApp);
}

export async function getFirebaseAuth() {
  const { getAuth } = await import('firebase/auth');
  return getAuth(firebaseApp);
}

export async function getFirebaseStorage() {
  const { getStorage } = await import('firebase/storage');
  return getStorage(firebaseApp);
}

export async function initializeFirebaseAnalytics() {
  if (typeof window === 'undefined') return null;

  const { getAnalytics, isSupported } = await import('firebase/analytics');
  if (!(await isSupported())) return null;
  return getAnalytics(firebaseApp);
}
