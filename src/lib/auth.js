import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';
import { GoogleAuthProvider, signInWithCredential, signOut as firebaseSignOut } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const WEB_CLIENT_ID = '203371134876-konb605dmugl54691capabrc1nqldgjt.apps.googleusercontent.com';
const PRIVACY_VERSION = '1.0';

export async function signInWithGoogle() {
  try {
    let user;

    if (Capacitor.isNativePlatform()) {
      // Android native: use @codetrix-studio/capacitor-google-auth
      await GoogleAuth.initialize({
        clientId: WEB_CLIENT_ID,
        scopes: ['profile', 'email'],
        grantOfflineAccess: true,
      });

      const googleUser = await GoogleAuth.signIn();

      const idToken = googleUser.authentication.idToken;
      if (!idToken) throw new Error('No ID token returned from Google');

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);
      user = result.user;

    } else {
      // Web browser: use popup
      const { signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      user = result.user;
    }

    // Check if user has accepted privacy policy
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || !userDoc.data().privacyPolicyAcceptedAt) {
      return { user, requiresConsent: true };
    }
    return { user, requiresConsent: false };

  } catch (error) {
    console.error('[auth] signInWithGoogle error:', error.code, error.message);
    throw new Error(error.message || 'Google sign-in failed');
  }
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
  try {
    if (Capacitor.isNativePlatform()) {
      await GoogleAuth.signOut();
    }
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('[auth] signOut error:', error);
  }
}

export async function deleteAccount(uid) {
  try {
    await deleteDoc(doc(db, 'users', uid));
    await signOut();
  } catch (error) {
    console.error('[auth] deleteAccount error:', error);
    throw error;
  }
}
