import { initializeApp } from 'firebase/app';
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

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
