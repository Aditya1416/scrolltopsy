import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAMqZNepbUBPBKirxAAPN3YJxTxzo0YIt8",
  authDomain: "scrolltopsy.firebaseapp.com",
  projectId: "scrolltopsy",
  storageBucket: "scrolltopsy.firebasestorage.app",
  messagingSenderId: "203371134876",
  appId: "1:203371134876:web:66cae7d6a6ef3b2307d259",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app);
export const WEB_CLIENT_ID = '203371134876-konb605dmugl54691capabrc1nqldgjt.apps.googleusercontent.com';
