import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { getData } from './storage';
import { usageStatsModule } from './nativeModules';
import { analyzeUsage, classifyScrolltype, getTopCategory } from './behaviorEngine';

export async function syncToFirestore(uid: string): Promise<void> {
  const [data, weekStats] = await Promise.all([
    getData(),
    usageStatsModule.getUsageStats(7).catch(() => []),
  ]);

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

  const { totalDoomMins, byCategory, topApps } = analyzeUsage(weekStats);
  const topCat = getTopCategory(byCategory);
  const hour = new Date().getHours();
  const scrolltype = data.scrolltype || classifyScrolltype(totalDoomMins, hour, topCat);
  const topApp = topApps[0]?.appName ?? '';

  await setDoc(doc(db, 'users', uid), {
    totalSessions: data.totalSessions,
    totalMins: data.totalMins,
    longestSessionMins: data.longestSessionMins,
    scrolltype,
    todayMins,
    weekMins,
    topCategory: topCat,
    topApp,
    lastBackup: serverTimestamp(),
  }, { merge: true });
}
