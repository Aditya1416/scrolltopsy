import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Capacitor } from '@capacitor/core';
import { auth, db } from './firebase.js';
import { deleteAllLocalData } from './storage.js';

const WEB_CLIENT_ID = '203371134876-konb605dmugl54691capabrc1nqldgjt.apps.googleusercontent.com';
const PRIVACY_VERSION = '1.0';
let _googleAuthReady = false;

async function ensureGoogleAuth() {
  if (_googleAuthReady) return;
  await GoogleAuth.initialize({
    clientId: WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
    grantOfflineAccess: true,
  });
  _googleAuthReady = true;
}

export async function signInWithGoogle() {
  try {
    if (Capacitor.isNativePlatform()) {
      await ensureGoogleAuth();
      const googleUser = await GoogleAuth.signIn();
      if (!googleUser?.authentication?.idToken) {
        throw new Error('No ID token returned from Google Sign-In');
      }
      const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
      const result = await signInWithCredential(auth, credential);
      return await _handleSignInResult(result.user);
    } else {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      return await _handleSignInResult(result.user);
    }
  } catch (error) {
    console.error('signInWithGoogle error:', error.code || error.message, error);
    throw error;
  }
}

async function _handleSignInResult(user) {
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
