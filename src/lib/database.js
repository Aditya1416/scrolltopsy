/**
 * Firestore Schema Documentation
 * ================================
 *
 * Collection: users/{uid}
 * {
 *   uid:                      string,     // Firebase Auth UID
 *   displayName:              string,     // from Google account
 *   photoURL:                 string,     // Google profile photo URL
 *   createdAt:                timestamp,
 *   lastSyncAt:               timestamp,
 *   privacyPolicyAcceptedAt:  timestamp,
 *   privacyPolicyVersion:     string,     // "1.0"
 *   totalSessions:            number,
 *   totalMins:                number,
 *   longestSessionMins:       number,
 *   scrolltype:               string,
 *   worstHour:                number,
 *   worstDay:                 string,
 *   weeklyStats:              string,     // AES-256-GCM encrypted JSON blob
 * }
 *
 * weeklyStats (before encryption):
 * [
 *   { week: "2026-W20", totalMins: number, sessionCount: number },
 *   ...up to 52 entries (1 year rolling)
 * ]
 *
 * Collection: accountability/{tokenId}
 * {
 *   ownerUid:   string,
 *   weeklyMins: number,
 *   createdAt:  timestamp,
 *   expiresAt:  timestamp,   // 7 days from creation
 *   token:      string,      // random 12-char ID
 * }
 */

/**
 * Returns ISO week key for a given date, e.g. "2026-W20".
 * Uses ISO 8601 week numbering (week starts Monday).
 */
export function getWeekKey(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return d.getFullYear() + '-W' + String(weekNo).padStart(2, '0');
}

/**
 * Aggregates a sessions array (from storage.js) into last-52-week stats.
 * Uses session.timestamp — the actual field name in storage.js.
 */
export function buildWeeklyStats(sessions) {
  const weeklyMap = {};
  for (const session of sessions) {
    const week = getWeekKey(new Date(session.timestamp));
    if (!weeklyMap[week]) weeklyMap[week] = { totalMins: 0, sessionCount: 0 };
    weeklyMap[week].totalMins += session.durationMins;
    weeklyMap[week].sessionCount += 1;
  }
  return Object.entries(weeklyMap)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 52)
    .map(([week, stats]) => ({ week, ...stats }));
}

/**
 * Returns a privacy-masked email for display in the settings sheet.
 * "aditya@gmail.com" → "adi***@gmail.com"
 */
export function maskEmail(email) {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const visible = local.slice(0, 3);
  return `${visible}***@${domain}`;
}

/**
 * Returns the start-of-week (Monday 00:00:00) for a given date.
 * Used by accountability.js to filter sessions for the current week.
 */
export function thisWeekStart() {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - (day - 1));
  monday.setHours(0, 0, 0, 0);
  return monday;
}
