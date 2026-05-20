const APP_DATA_KEY = 'sct_app_data';

const KNOWN_PACKAGES = {
  'com.instagram.android': 'Instagram',
  'com.zhiliaoapp.musically': 'TikTok',
  'com.ss.android.ugc.trill': 'TikTok',
  'com.ss.android.ugc.aweme': 'TikTok',
  'com.google.android.youtube': 'YouTube',
  'com.twitter.android': 'X / Twitter',
  'com.x.android.app': 'X / Twitter',
  'com.reddit.frontpage': 'Reddit',
  'com.facebook.katana': 'Facebook',
  'com.snapchat.android': 'Snapchat',
  'com.pinterest': 'Pinterest',
  'com.linkedin.android': 'LinkedIn',
  'com.tumblr': 'Tumblr',
  'tv.twitch.android.app': 'Twitch',
  'com.bereal.ft': 'BeReal',
};

export function normaliseName(rawName, packageName) {
  if (packageName && KNOWN_PACKAGES[packageName]) return KNOWN_PACKAGES[packageName];
  return rawName || null;
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(APP_DATA_KEY) || '{}');
  } catch {
    return {};
  }
}

function save(data) {
  localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
}

export function storeAppForSession(sessionId, appName) {
  if (!sessionId || !appName) return;
  const data = load();
  data[sessionId] = appName;
  save(data);
}

export function getAppForSession(sessionId) {
  return load()[sessionId] ?? null;
}

export function getTopApp(sessions) {
  if (!sessions || sessions.length === 0) return null;
  const map = load();
  const counts = {};
  for (const s of sessions) {
    const app = map[s.id];
    if (app) counts[app] = (counts[app] || 0) + 1;
  }
  if (Object.keys(counts).length === 0) return null;
  return Object.entries(counts).reduce(
    (best, [k, v]) => (v > best[1] ? [k, v] : best),
    ['', -1]
  )[0];
}
