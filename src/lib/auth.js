import { signInWithPopup, GoogleAuthProvider, signOut as fbSignOut } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { deleteAllLocalData } from './storage';

export async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user.uid;
}

export async function signOut() {
    await fbSignOut(auth);
    // Does NOT clear localStorage — user keeps their local data
}

export async function deleteAccount() {
    const uid = auth.currentUser?.uid;
    if (uid) {
        // Deletes Firestore document users/{uid}/scrolltopsy
        // Using a subcollection document to satisfy typical Firestore path requirements
        await deleteDoc(doc(db, 'users', uid, 'scrolltopsy', 'data'));
        await deleteAllLocalData();
        await fbSignOut(auth);
    }
}
