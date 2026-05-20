import { getSessions, getProfile } from './storage.js';
import { getTopApp } from './appData.js';

function getTimeOfDay(hour) {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function getGreetingTime() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return 'morning';
  if (h >= 12 && h < 18) return 'afternoon';
  if (h >= 18 && h < 22) return 'evening';
  return 'still up';
}

export async function analysePatterns() {
  const [sessions, profile] = await Promise.all([getSessions(), getProfile()]);
  const now = Date.now();
  const msPerDay = 86400000;
  const today = new Date().toDateString();

  const worstHour = profile.worstHour;
  const worstDay = profile.worstDay;
  const peakSessionLength = profile.longestSessionMins;

  const sessionCountToday = sessions.filter(
    s => new Date(s.timestamp).toDateString() === today
  ).length;

  const sevenDaysAgo = now - 7 * msPerDay;
  const recentSessions = sessions.filter(s => s.timestamp >= sevenDaysAgo);
  const averageSessionMins = recentSessions.length > 0
    ? recentSessions.reduce((sum, s) => sum + s.durationMins, 0) / recentSessions.length
    : 0;

  const allTimeAvg = sessions.length > 0
    ? sessions.reduce((sum, s) => sum + s.durationMins, 0) / sessions.length
    : 0;

  const ratio = allTimeAvg > 0 ? averageSessionMins / allTimeAvg : 1;
  const currentMomentumScore = Math.min(100, Math.round(ratio * 50));

  const timeWindows = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  for (const s of sessions) {
    timeWindows[getTimeOfDay(s.hour)] += 1;
  }
  const triggerPattern = Object.entries(timeWindows).reduce(
    (best, [k, v]) => (v > best[1] ? [k, v] : best),
    ['morning', -1]
  )[0];

  const fourteenDaysAgo = now - 14 * msPerDay;
  const dailyMins = {};
  sessions
    .filter(s => s.timestamp >= fourteenDaysAgo)
    .forEach(s => {
      const d = new Date(s.timestamp).toDateString();
      dailyMins[d] = (dailyMins[d] || 0) + s.durationMins;
    });

  const dayKeys = Array.from({ length: 14 }, (_, i) =>
    new Date(now - (i + 1) * msPerDay).toDateString()
  );

  let recentStreak = 0;
  for (const d of dayKeys) {
    if (dailyMins[d]) recentStreak++;
    else break;
  }
  const streakBroken = !dailyMins[today] && recentStreak >= 3;

  let improvingStreak = 0;
  for (let i = 0; i < dayKeys.length - 1; i++) {
    const curr = dailyMins[dayKeys[i]] || 0;
    const prev = dailyMins[dayKeys[i + 1]] || 0;
    if (curr > 0 && curr < prev) improvingStreak++;
    else break;
  }

  const prevSessions = sessions.filter(
    s => s.timestamp >= fourteenDaysAgo && s.timestamp < sevenDaysAgo
  );
  const prevAvg = prevSessions.length > 0
    ? prevSessions.reduce((sum, s) => sum + s.durationMins, 0) / prevSessions.length
    : 0;
  const relapsing = recentSessions.length > 0 && prevAvg > 0 && averageSessionMins > prevAvg;

  const topApp = getTopApp(sessions);

  const patterns = {
    worstHour,
    worstDay,
    averageSessionMins: Math.round(averageSessionMins * 10) / 10,
    streakBroken,
    relapsing,
    improvingStreak,
    sessionCountToday,
    triggerPattern,
    peakSessionLength,
    currentMomentumScore,
    topApp,
  };

  localStorage.setItem('sct_patterns', JSON.stringify(patterns));
  return patterns;
}

export function getPersonalisedShameContext(durationMins) {
  let patterns = null;
  try {
    const raw = localStorage.getItem('sct_patterns');
    if (raw) patterns = JSON.parse(raw);
  } catch (_) {}

  const currentHour = new Date().getHours();
  const timeContext = getTimeOfDay(currentHour);
  const tier =
    durationMins < 5 ? 'tier1' :
    durationMins < 15 ? 'tier2' :
    durationMins < 30 ? 'tier3' :
    durationMins < 60 ? 'tier4' : 'tier5';

  if (!patterns) {
    return { tier, timeContext, patternMatch: false, isRelapsing: false, streakBroken: false, sessionCountToday: 0, momentumScore: 50 };
  }

  return {
    tier,
    timeContext,
    patternMatch: patterns.triggerPattern === timeContext,
    isRelapsing: patterns.relapsing,
    streakBroken: patterns.streakBroken,
    sessionCountToday: patterns.sessionCountToday,
    momentumScore: patterns.currentMomentumScore,
  };
}

export function getPersonalisedGreeting(firstName) {
  const name = firstName || '';
  const time = getGreetingTime();
  const namePart = name ? `, ${name}` : '';

  let patterns = null;
  try {
    const raw = localStorage.getItem('sct_patterns');
    if (raw) patterns = JSON.parse(raw);
  } catch (_) {}

  if (!patterns) return `good ${time}${namePart}.`;

  const currentHour = new Date().getHours();

  if (patterns.improvingStreak > 3) {
    return `good ${time}${namePart}. cleaner than yesterday.`;
  }
  if (patterns.relapsing) {
    return `back again${namePart}.`;
  }
  if (patterns.worstHour !== -1 && patterns.worstHour === currentHour) {
    return `right on schedule${namePart}.`;
  }
  return `good ${time}${namePart}.`;
}

const PATTERNS_DATE_KEY = 'sct_patterns_date';

export async function maybeAnalysePatternsToday() {
  const today = new Date().toDateString();
  if (localStorage.getItem(PATTERNS_DATE_KEY) === today) return;
  await analysePatterns();
  localStorage.setItem(PATTERNS_DATE_KEY, today);
}

export function getContextualSuffix(context) {
  if (!context) return '';
  if (context.streakBroken) return 'you were doing well.';
  if (context.isRelapsing) return 'this week is above your average.';
  if (context.timeContext === 'night') return 'it is past midnight.';
  if (context.patternMatch) return 'this is your pattern.';
  if (context.sessionCountToday > 3) return `this is session ${context.sessionCountToday} today.`;
  return '';
}
