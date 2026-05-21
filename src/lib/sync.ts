import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getData } from './storage';

export async function syncToFirestore(uid: string): Promise<void> {
  const data = await getData();
  const today = new Date().toDateString();
  const todayMins = data.sessions
    .filter(s => new Date(s.startedAt).toDateString() === today)
    .reduce((sum, s) => sum + s.durationMins, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekMins = data.sessions
    .filter(s => s.startedAt >= weekStart.getTime())
    .reduce((sum, s) => sum + s.durationMins, 0);

  await setDoc(doc(db, 'users', uid), {
    totalSessions: data.totalSessions,
    totalMins: data.totalMins,
    longestSessionMins: data.longestSessionMins,
    scrolltype: data.scrolltype,
    todayMins,
    weekMins,
    lastBackup: serverTimestamp(),
  }, { merge: true });
}
