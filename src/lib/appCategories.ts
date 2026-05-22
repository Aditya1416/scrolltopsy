export type AppCategory = 'social' | 'entertainment' | 'news' | 'games' | 'shopping' | 'messaging' | 'browser' | 'productivity' | 'other';

export interface AppMeta {
  name: string;
  category: AppCategory;
}

const APP_MAP: Record<string, AppMeta> = {
  'com.instagram.android': { name: 'Instagram', category: 'social' },
  'com.facebook.katana': { name: 'Facebook', category: 'social' },
  'com.twitter.android': { name: 'Twitter/X', category: 'social' },
  'com.snapchat.android': { name: 'Snapchat', category: 'social' },
  'com.reddit.frontpage': { name: 'Reddit', category: 'social' },
  'com.pinterest': { name: 'Pinterest', category: 'social' },
  'com.linkedin.android': { name: 'LinkedIn', category: 'social' },
  'com.discord': { name: 'Discord', category: 'social' },
  'com.zhiliaoapp.musically': { name: 'TikTok', category: 'social' },
  'com.ss.android.ugc.trill': { name: 'TikTok', category: 'social' },
  'com.tumblr': { name: 'Tumblr', category: 'social' },
  'com.vkontakte.android': { name: 'VK', category: 'social' },
  'com.quora.android': { name: 'Quora', category: 'social' },
  'com.medium.android': { name: 'Medium', category: 'social' },
  'com.bereal.app': { name: 'BeReal', category: 'social' },
  'com.whatsapp': { name: 'WhatsApp', category: 'messaging' },
  'org.telegram.messenger': { name: 'Telegram', category: 'messaging' },
  'com.google.android.gm': { name: 'Gmail', category: 'messaging' },
  'com.microsoft.teams': { name: 'Teams', category: 'messaging' },
  'com.slack': { name: 'Slack', category: 'messaging' },
  'com.facebook.orca': { name: 'Messenger', category: 'messaging' },
  'jp.naver.line.android': { name: 'LINE', category: 'messaging' },
  'com.viber.voip': { name: 'Viber', category: 'messaging' },
  'com.skype.raider': { name: 'Skype', category: 'messaging' },
  'com.google.android.apps.messaging': { name: 'Messages', category: 'messaging' },
  'com.google.android.youtube': { name: 'YouTube', category: 'entertainment' },
  'com.netflix.mediaclient': { name: 'Netflix', category: 'entertainment' },
  'com.amazon.avod.thirdpartyclient': { name: 'Prime Video', category: 'entertainment' },
  'com.disney.disneyplus': { name: 'Disney+', category: 'entertainment' },
  'com.hotstar': { name: 'Hotstar', category: 'entertainment' },
  'in.jio.cinema': { name: 'JioCinema', category: 'entertainment' },
  'com.spotify.music': { name: 'Spotify', category: 'entertainment' },
  'com.MXTech.MXPlayer': { name: 'MX Player', category: 'entertainment' },
  'com.twitch.android.viewer': { name: 'Twitch', category: 'entertainment' },
  'tv.twitch.android.app': { name: 'Twitch', category: 'entertainment' },
  'com.hulu.plus': { name: 'Hulu', category: 'entertainment' },
  'com.apple.android.music': { name: 'Apple Music', category: 'entertainment' },
  'com.gaana': { name: 'Gaana', category: 'entertainment' },
  'com.jio.media.ondemand': { name: 'JioSaavn', category: 'entertainment' },
  'com.wynk.music': { name: 'Wynk Music', category: 'entertainment' },
  'com.jiomeet.normal': { name: 'JioMeet', category: 'entertainment' },
  'com.google.android.apps.magazines': { name: 'Google News', category: 'news' },
  'com.bbc.news': { name: 'BBC News', category: 'news' },
  'com.inshorts.newsbucket': { name: 'Inshorts', category: 'news' },
  'com.ndtv.news': { name: 'NDTV', category: 'news' },
  'com.abcnews.mobile': { name: 'ABC News', category: 'news' },
  'com.cnn.mobile.android.phone': { name: 'CNN', category: 'news' },
  'com.theguardian.android': { name: 'The Guardian', category: 'news' },
  'flipboard.app': { name: 'Flipboard', category: 'news' },
  'com.pubg.mobile': { name: 'PUBG Mobile', category: 'games' },
  'com.supercell.clashofclans': { name: 'Clash of Clans', category: 'games' },
  'com.supercell.clashroyale': { name: 'Clash Royale', category: 'games' },
  'com.mojang.minecraftpe': { name: 'Minecraft', category: 'games' },
  'com.tencent.ig': { name: 'BGMI', category: 'games' },
  'com.king.candycrushsaga': { name: 'Candy Crush', category: 'games' },
  'com.rovio.angrybirdsreloaded': { name: 'Angry Birds', category: 'games' },
  'com.activision.callofduty.shooter': { name: 'Call of Duty', category: 'games' },
  'com.garena.freefireth': { name: 'Free Fire', category: 'games' },
  'com.miniclip.eightballpool': { name: '8 Ball Pool', category: 'games' },
  'com.roblox.client': { name: 'Roblox', category: 'games' },
  'com.zynga.scramble': { name: 'Zynga Game', category: 'games' },
  'com.supercell.brawlstars': { name: 'Brawl Stars', category: 'games' },
  'com.android.chrome': { name: 'Chrome', category: 'browser' },
  'com.brave.browser': { name: 'Brave', category: 'browser' },
  'org.mozilla.firefox': { name: 'Firefox', category: 'browser' },
  'com.microsoft.emmx': { name: 'Edge', category: 'browser' },
  'com.opera.browser': { name: 'Opera', category: 'browser' },
  'com.UCMobile.intl': { name: 'UC Browser', category: 'browser' },
  'com.sec.android.app.sbrowser': { name: 'Samsung Browser', category: 'browser' },
  'com.duckduckgo.mobile.android': { name: 'DuckDuckGo', category: 'browser' },
  'com.flipkart.android': { name: 'Flipkart', category: 'shopping' },
  'com.amazon.mShop.android.shopping': { name: 'Amazon', category: 'shopping' },
  'com.meesho.supply': { name: 'Meesho', category: 'shopping' },
  'com.myntra.android': { name: 'Myntra', category: 'shopping' },
  'com.ajio.mobile': { name: 'AJIO', category: 'shopping' },
  'com.nykaa.android': { name: 'Nykaa', category: 'shopping' },
  'com.ebay.mobile': { name: 'eBay', category: 'shopping' },
  'com.wish.android': { name: 'Wish', category: 'shopping' },
  'com.zomato.android': { name: 'Zomato', category: 'shopping' },
  'in.swiggy.android': { name: 'Swiggy', category: 'shopping' },
  'com.google.android.apps.docs': { name: 'Google Docs', category: 'productivity' },
  'com.google.android.apps.sheets': { name: 'Google Sheets', category: 'productivity' },
  'com.microsoft.office.word': { name: 'Word', category: 'productivity' },
  'com.microsoft.office.excel': { name: 'Excel', category: 'productivity' },
  'com.microsoft.office.powerpoint': { name: 'PowerPoint', category: 'productivity' },
  'com.google.android.calendar': { name: 'Google Calendar', category: 'productivity' },
  'com.microsoft.launcher': { name: 'Microsoft Launcher', category: 'productivity' },
  'com.todoist.android': { name: 'Todoist', category: 'productivity' },
  'com.duolingo': { name: 'Duolingo', category: 'productivity' },
  'com.notion.android': { name: 'Notion', category: 'productivity' },
};

// Android ApplicationInfo.category constants (API 26+)
const ANDROID_CAT_GAME = 0;
const ANDROID_CAT_AUDIO = 1;
const ANDROID_CAT_VIDEO = 2;
const ANDROID_CAT_IMAGE = 3;
const ANDROID_CAT_SOCIAL = 4;
const ANDROID_CAT_NEWS = 5;
const ANDROID_CAT_MAPS = 6;
const ANDROID_CAT_PRODUCTIVITY = 7;

export function mapAndroidCategory(cat: number): AppCategory {
  switch (cat) {
    case ANDROID_CAT_GAME: return 'games';
    case ANDROID_CAT_AUDIO:
    case ANDROID_CAT_VIDEO: return 'entertainment';
    case ANDROID_CAT_IMAGE: return 'social';
    case ANDROID_CAT_SOCIAL: return 'social';
    case ANDROID_CAT_NEWS: return 'news';
    case ANDROID_CAT_MAPS: return 'other';
    case ANDROID_CAT_PRODUCTIVITY: return 'productivity';
    default: return 'other';
  }
}

function inferCategoryFromPackage(pkg: string): AppCategory {
  const p = pkg.toLowerCase();
  if (/game|play|puzzle|chess|word|quiz|trivia/.test(p)) return 'games';
  if (/news|daily|times|express|herald|report|buzz/.test(p)) return 'news';
  if (/video|music|stream|media|player|movie|film|tv\./.test(p)) return 'entertainment';
  if (/shop|store|buy|mart|cart|deal|sale|fashion/.test(p)) return 'shopping';
  if (/chat|message|talk|meet|call|voice|sms/.test(p)) return 'messaging';
  if (/browser|web|surf/.test(p)) return 'browser';
  if (/social|photo|share|snap|post|feed|story/.test(p)) return 'social';
  return 'other';
}

export function getBestName(packageName: string, nativeLabel: string): string {
  if (APP_MAP[packageName]) return APP_MAP[packageName].name;
  return nativeLabel || (packageName.split('.').pop() ?? packageName);
}

export function getAppMeta(packageName: string, androidCategory?: number): AppMeta {
  if (APP_MAP[packageName]) return APP_MAP[packageName];
  const category = androidCategory !== undefined && androidCategory >= 0
    ? mapAndroidCategory(androidCategory)
    : inferCategoryFromPackage(packageName);
  const name = packageName.split('.').filter(p => p.length > 2 && !/^(com|org|net|app|android|google|microsoft|samsung|huawei|xiaomi|oppo|vivo|realme|oneplus)$/.test(p)).pop()
    ?? packageName.split('.').pop()
    ?? packageName;
  return { name: name.charAt(0).toUpperCase() + name.slice(1), category };
}

export const CATEGORY_LABELS: Record<AppCategory, string> = {
  social: 'social media',
  entertainment: 'entertainment',
  news: 'news',
  games: 'games',
  shopping: 'shopping',
  messaging: 'messaging',
  browser: 'browsing',
  productivity: 'productivity',
  other: 'other',
};

export const DOOMSCROLL_CATEGORIES: AppCategory[] = ['social', 'entertainment', 'news', 'games'];
