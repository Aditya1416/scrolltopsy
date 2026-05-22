// PRIVACY: never log session content
// PRIVACY: never store device identifiers
// PRIVACY: never send raw timestamps to Firestore
// PRIVACY: Firestore receives aggregates only

import { doc, getDoc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getSessions } from './storage';
import { thisWeekStart } from './database';

export async function generateToken(uid) {
  const sessions = await getSessions();
  const weekStart = thisWeekStart();

  const weeklyMins = sessions
    .filter(s => s.timestamp >= weekStart.getTime())
    .reduce((sum, s) => sum + s.durationMins, 0);

  const token = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  const expiresAt = Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await setDoc(doc(db, 'accountability', token), {
    ownerUid: uid,
    weeklyMins,
    createdAt: serverTimestamp(),
    expiresAt,
    token,
  });

  return token;
}

export async function getTokenData(token) {
  const docSnap = await getDoc(doc(db, 'accountability', token));
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  const expiresMs = data.expiresAt?.toMillis?.() ?? 0;
  if (expiresMs < Date.now()) return null;

  return {
    weeklyMins: data.weeklyMins,
    createdAt: data.createdAt?.toDate?.() ?? null,
    expiresAt: new Date(expiresMs),
  };
}
