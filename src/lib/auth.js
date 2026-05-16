import { GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase.js';
import { deleteAllLocalData } from './storage.js';

const PRIVACY_VERSION = '1.0';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userDoc = await getDoc(doc(db, 'users', user.uid));

  if (!userDoc.exists() || !userDoc.data().privacyPolicyAcceptedAt) {
    return { user, requiresConsent: true };
  }

  return { user, requiresConsent: false };
}

export async function acceptPrivacyAndComplete(user) {
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    displayName: user.displayName || 'scrolltopsy user',
    photoURL: user.photoURL || '',
    createdAt: serverTimestamp(),
    privacyPolicyAcceptedAt: serverTimestamp(),
    privacyPolicyVersion: PRIVACY_VERSION,
    totalSessions: 0,
    totalMins: 0,
    longestSessionMins: 0,
    scrolltype: '',
    worstHour: -1,
    worstDay: '',
    weeklyStats: [],
  }, { merge: true });

  return user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function deleteAccount(uid) {
  if (!uid) return;
  await deleteDoc(doc(db, 'users', uid));
  await deleteAllLocalData();
  await firebaseSignOut(auth);
}
