// PRIVACY: never log session content
// PRIVACY: never store device identifiers
// PRIVACY: never send raw timestamps to Firestore
// PRIVACY: Firestore receives aggregates only

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getProfile, getSessions } from './storage';
import { buildWeeklyStats } from './database';
import { encrypt, decrypt } from './encryption';

export async function syncToFirestore(uid) {
  const [profile, sessions] = await Promise.all([getProfile(), getSessions()]);
  const weeklyStats = buildWeeklyStats(sessions);
  const encryptedWeeklyStats = await encrypt(weeklyStats, uid);

  await setDoc(doc(db, 'users', uid), {
    totalSessions: profile.totalSessions,
    totalMins: profile.totalMins,
    longestSessionMins: profile.longestSessionMins,
    scrolltype: profile.scrolltype,
    worstHour: profile.worstHour,
    worstDay: profile.worstDay,
    weeklyStats: encryptedWeeklyStats,
    lastSyncAt: serverTimestamp(),
  }, { merge: true });
}

export async function restoreFromFirestore(uid) {
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (!docSnap.exists()) return null;

  const remote = docSnap.data();
  let weeklyStats = [];

  if (remote.weeklyStats) {
    weeklyStats = (await decrypt(remote.weeklyStats, uid)) ?? [];
  }

  return {
    weeklyStats,
    meta: {
      totalSessions: remote.totalSessions,
      totalMins: remote.totalMins,
      longestSessionMins: remote.longestSessionMins,
      scrolltype: remote.scrolltype,
      worstHour: remote.worstHour,
      worstDay: remote.worstDay,
      lastSyncAt: remote.lastSyncAt,
    },
  };
}
