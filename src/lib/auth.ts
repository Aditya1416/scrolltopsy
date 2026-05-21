import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signOut as fbSignOut,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db, WEB_CLIENT_ID } from './firebase';

export function configureGoogleSignIn() {
  GoogleSignin.configure({
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
  });
}

export async function signInWithGoogle(): Promise<{ user: any; requiresConsent: boolean } | null> {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const idToken = (userInfo as any).data?.idToken ?? (userInfo as any).idToken;
    if (!idToken) throw new Error('No ID token');

    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(auth, credential);
    const user = result.user;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists() || !userDoc.data()?.privacyPolicyAcceptedAt) {
      return { user, requiresConsent: true };
    }
    return { user, requiresConsent: false };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) return null;
    if (error.code === statusCodes.IN_PROGRESS) return null;
    throw error;
  }
}

export async function acceptPrivacy(user: any): Promise<void> {
  await setDoc(doc(db, 'users', user.uid), {
    uid: user.uid,
    displayName: user.displayName || '',
    photoURL: user.photoURL || '',
    privacyPolicyAcceptedAt: serverTimestamp(),
    privacyPolicyVersion: '1.0',
    totalSessions: 0,
    totalMins: 0,
  }, { merge: true });
}

export async function signOut(): Promise<void> {
  try {
    await GoogleSignin.signOut();
  } catch {}
  await fbSignOut(auth);
}

export async function deleteAccount(uid: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid));
  await signOut();
}
