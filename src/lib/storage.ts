import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'sct_data_v3';

export interface Session {
  id: string;
  startedAt: number;
  durationMins: number;
}

export interface StorageData {
  sessions: Session[];
  totalSessions: number;
  totalMins: number;
  longestSessionMins: number;
  scrolltype: string;
  lastShameId: string;
}

const DEFAULT: StorageData = {
  sessions: [], totalSessions: 0, totalMins: 0,
  longestSessionMins: 0, scrolltype: '', lastShameId: '',
};

export async function getData(): Promise<StorageData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch { return { ...DEFAULT }; }
}

export async function saveSession(durationMins: number): Promise<StorageData> {
  const data = await getData();
  const session: Session = {
    id: Math.random().toString(36).slice(2),
    startedAt: Date.now(),
    durationMins: Math.max(1, durationMins),
  };
  data.sessions = [...data.sessions, session];
  data.totalSessions += 1;
  data.totalMins += durationMins;
  if (durationMins > data.longestSessionMins) {
    data.longestSessionMins = durationMins;
  }
  if (data.totalSessions >= 7) {
    data.scrolltype = computeScrolltype(data.sessions);
  }
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

export async function getTodayMins(): Promise<number> {
  const data = await getData();
  const today = new Date().toDateString();
  return data.sessions
    .filter(s => new Date(s.startedAt).toDateString() === today)
    .reduce((sum, s) => sum + s.durationMins, 0);
}

export async function getTodaySessions(): Promise<Session[]> {
  const data = await getData();
  const today = new Date().toDateString();
  return data.sessions
    .filter(s => new Date(s.startedAt).toDateString() === today)
    .slice(-5)
    .reverse();
}

export async function deleteAllData(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

function computeScrolltype(sessions: Session[]): string {
  const hours = sessions.map(s => new Date(s.startedAt).getHours());
  const counts = new Array(24).fill(0);
  hours.forEach(h => counts[h]++);
  const worstHour = counts.indexOf(Math.max(...counts));
  if (worstHour >= 22 || worstHour <= 2) return 'late-night doom merchant';
  if (worstHour >= 6 && worstHour <= 9) return 'morning anxiety checker';
  const longest = Math.max(...sessions.map(s => s.durationMins));
  if (longest > 45) return 'deep void diver';
  if (sessions.length > 28) return 'compulsive refresher';
  const days = sessions.map(s => new Date(s.startedAt).getDay());
  const weekendCount = days.filter(d => d === 0 || d === 6).length;
  if (weekendCount / days.length > 0.5) return 'weekend void walker';
  return 'casual self-saboteur';
}
