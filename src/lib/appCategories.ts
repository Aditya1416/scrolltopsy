export type AppCategory = 'social' | 'entertainment' | 'news' | 'games' | 'shopping' | 'messaging' | 'browser' | 'productivity' | 'other';

export interface AppMeta {
  name: string;
  category: AppCategory;
}

const APP_MAP: Record<string, AppMeta> = {
  // ── Social ──────────────────────────────────────────────────────────────────
  'com.instagram.android': { name: 'Instagram', category: 'social' },
  'com.facebook.katana': { name: 'Facebook', category: 'social' },
  'com.twitter.android': { name: 'Twitter/X', category: 'social' },
  'com.x.android': { name: 'X', category: 'social' },
  'com.snapchat.android': { name: 'Snapchat', category: 'social' },
  'com.reddit.frontpage': { name: 'Reddit', category: 'social' },
  'com.pinterest': { name: 'Pinterest', category: 'social' },
  'com.linkedin.android': { name: 'LinkedIn', category: 'social' },
  'com.discord': { name: 'Discord', category: 'social' },
  'com.zhiliaoapp.musically': { name: 'TikTok', category: 'social' },
  'com.ss.android.ugc.trill': { name: 'TikTok', category: 'social' },
  'com.ss.android.ugc.aweme': { name: 'TikTok', category: 'social' },
  'com.tumblr': { name: 'Tumblr', category: 'social' },
  'com.vkontakte.android': { name: 'VK', category: 'social' },
  'com.quora.android': { name: 'Quora', category: 'social' },
  'com.medium.android': { name: 'Medium', category: 'social' },
  'com.bereal.app': { name: 'BeReal', category: 'social' },
  'app.threads.android': { name: 'Threads', category: 'social' },
  'com.sharechat.android': { name: 'ShareChat', category: 'social' },
  'com.josh.android': { name: 'Josh', category: 'social' },
  'com.mojapp.android': { name: 'Moj', category: 'social' },
  'com.mxtakatak': { name: 'MX TakaTak', category: 'social' },
  'com.roposo.android': { name: 'Roposo', category: 'social' },
  'com.chingari.app': { name: 'Chingari', category: 'social' },
  'com.koo.app': { name: 'Koo', category: 'social' },
  'com.google.android.youtube.shorts': { name: 'YouTube Shorts', category: 'social' },
  'com.mastodon.app': { name: 'Mastodon', category: 'social' },
  'xyz.blueskyweb.app': { name: 'Bluesky', category: 'social' },
  // ── Messaging ───────────────────────────────────────────────────────────────
  'com.whatsapp': { name: 'WhatsApp', category: 'messaging' },
  'com.whatsapp.w4b': { name: 'WhatsApp Business', category: 'messaging' },
  'org.telegram.messenger': { name: 'Telegram', category: 'messaging' },
  'org.telegram.plus': { name: 'Telegram', category: 'messaging' },
  'org.thoughtcrime.securesms': { name: 'Signal', category: 'messaging' },
  'com.google.android.gm': { name: 'Gmail', category: 'messaging' },
  'com.microsoft.teams': { name: 'Teams', category: 'messaging' },
  'com.slack': { name: 'Slack', category: 'messaging' },
  'com.facebook.orca': { name: 'Messenger', category: 'messaging' },
  'jp.naver.line.android': { name: 'LINE', category: 'messaging' },
  'com.viber.voip': { name: 'Viber', category: 'messaging' },
  'com.skype.raider': { name: 'Skype', category: 'messaging' },
  'com.google.android.apps.messaging': { name: 'Messages', category: 'messaging' },
  'com.microsoft.outlook': { name: 'Outlook', category: 'messaging' },
  'com.yahoo.mobile.client.android.mail': { name: 'Yahoo Mail', category: 'messaging' },
  'com.snapchat.android.2': { name: 'Snapchat', category: 'messaging' },
  // ── Entertainment ───────────────────────────────────────────────────────────
  'com.google.android.youtube': { name: 'YouTube', category: 'entertainment' },
  'com.netflix.mediaclient': { name: 'Netflix', category: 'entertainment' },
  'com.amazon.avod.thirdpartyclient': { name: 'Prime Video', category: 'entertainment' },
  'com.disney.disneyplus': { name: 'Disney+', category: 'entertainment' },
  'com.hotstar': { name: 'Hotstar', category: 'entertainment' },
  'in.jio.cinema': { name: 'JioCinema', category: 'entertainment' },
  'com.spotify.music': { name: 'Spotify', category: 'entertainment' },
  'com.MXTech.MXPlayer': { name: 'MX Player', category: 'entertainment' },
  'com.mxtech.videoplayer.ad': { name: 'MX Player', category: 'entertainment' },
  'com.twitch.android.viewer': { name: 'Twitch', category: 'entertainment' },
  'tv.twitch.android.app': { name: 'Twitch', category: 'entertainment' },
  'com.hulu.plus': { name: 'Hulu', category: 'entertainment' },
  'com.apple.android.music': { name: 'Apple Music', category: 'entertainment' },
  'com.gaana': { name: 'Gaana', category: 'entertainment' },
  'com.jio.media.ondemand': { name: 'JioSaavn', category: 'entertainment' },
  'com.wynk.music': { name: 'Wynk Music', category: 'entertainment' },
  'com.jiomeet.normal': { name: 'JioMeet', category: 'entertainment' },
  'com.zee5.android': { name: 'ZEE5', category: 'entertainment' },
  'com.sonyliv': { name: 'SonyLIV', category: 'entertainment' },
  'com.voot.android': { name: 'Voot', category: 'entertainment' },
  'com.altbalaji.android': { name: 'ALTBalaji', category: 'entertainment' },
  'com.erosnow.android': { name: 'ErosNow', category: 'entertainment' },
  'com.mxplayer.pro': { name: 'MX Player Pro', category: 'entertainment' },
  'com.vlcforandroid.vlcdirectpro': { name: 'VLC', category: 'entertainment' },
  'org.videolan.vlc': { name: 'VLC', category: 'entertainment' },
  'com.google.android.apps.youtube.music': { name: 'YouTube Music', category: 'entertainment' },
  'com.soundcloud.android': { name: 'SoundCloud', category: 'entertainment' },
  'com.jiotv.ottlive': { name: 'JioTV', category: 'entertainment' },
  'com.tatasky': { name: 'Tata Play', category: 'entertainment' },
  'in.startv.hotstar': { name: 'Hotstar', category: 'entertainment' },
  'com.mango.android': { name: 'Mango', category: 'entertainment' },
  // ── News ────────────────────────────────────────────────────────────────────
  'com.google.android.apps.magazines': { name: 'Google News', category: 'news' },
  'com.bbc.news': { name: 'BBC News', category: 'news' },
  'com.inshorts.newsbucket': { name: 'Inshorts', category: 'news' },
  'com.ndtv.news': { name: 'NDTV', category: 'news' },
  'com.abcnews.mobile': { name: 'ABC News', category: 'news' },
  'com.cnn.mobile.android.phone': { name: 'CNN', category: 'news' },
  'com.theguardian.android': { name: 'The Guardian', category: 'news' },
  'flipboard.app': { name: 'Flipboard', category: 'news' },
  'com.dailyhunt': { name: 'DailyHunt', category: 'news' },
  'com.newshunt': { name: 'NewsHunt', category: 'news' },
  'com.abplive': { name: 'ABP Live', category: 'news' },
  'com.aajtak.mobile': { name: 'Aaj Tak', category: 'news' },
  'com.timesinternet.inshorts': { name: 'Times Now', category: 'news' },
  'com.timesinternet.mobile.timpani': { name: 'Times of India', category: 'news' },
  'com.htmedia.htmobileapp': { name: 'Hindustan Times', category: 'news' },
  'com.thehindu.app': { name: 'The Hindu', category: 'news' },
  'com.nytimes.android': { name: 'NY Times', category: 'news' },
  'com.washingtonpost.android': { name: 'Washington Post', category: 'news' },
  'com.india.today': { name: 'India Today', category: 'news' },
  // ── Games ───────────────────────────────────────────────────────────────────
  'com.pubg.mobile': { name: 'PUBG Mobile', category: 'games' },
  'com.supercell.clashofclans': { name: 'Clash of Clans', category: 'games' },
  'com.supercell.clashroyale': { name: 'Clash Royale', category: 'games' },
  'com.supercell.brawlstars': { name: 'Brawl Stars', category: 'games' },
  'com.mojang.minecraftpe': { name: 'Minecraft', category: 'games' },
  'com.tencent.ig': { name: 'BGMI', category: 'games' },
  'com.pubg.krmobile': { name: 'PUBG Mobile KR', category: 'games' },
  'com.king.candycrushsaga': { name: 'Candy Crush', category: 'games' },
  'com.king.candycrushsodasaga': { name: 'Candy Crush Soda', category: 'games' },
  'com.rovio.angrybirdsreloaded': { name: 'Angry Birds', category: 'games' },
  'com.activision.callofduty.shooter': { name: 'Call of Duty', category: 'games' },
  'com.garena.freefireth': { name: 'Free Fire', category: 'games' },
  'com.miniclip.eightballpool': { name: '8 Ball Pool', category: 'games' },
  'com.roblox.client': { name: 'Roblox', category: 'games' },
  'com.zynga.scramble': { name: 'Zynga Game', category: 'games' },
  'com.epicgames.fortnite': { name: 'Fortnite', category: 'games' },
  'com.ea.game.fifamobile_row': { name: 'EA FC Mobile', category: 'games' },
  'com.ea.gp.fifamobile': { name: 'EA FC Mobile', category: 'games' },
  'com.dreamplug.technologies': { name: 'Dream11', category: 'games' },
  'com.dream11.fantasy': { name: 'Dream11', category: 'games' },
  'com.mpl.fantasy': { name: 'MPL', category: 'games' },
  'com.ludo.king': { name: 'Ludo King', category: 'games' },
  'com.gametion.ludokinggame': { name: 'Ludo King', category: 'games' },
  'com.innersloth.spacemafia': { name: 'Among Us', category: 'games' },
  'com.half.brick.fruitninja': { name: 'Fruit Ninja', category: 'games' },
  'com.dts.subway.surfers': { name: 'Subway Surfers', category: 'games' },
  'com.kiloo.subwaysurf': { name: 'Subway Surfers', category: 'games' },
  'com.imangi.templerun2': { name: 'Temple Run', category: 'games' },
  'com.wb.goog.mkobile': { name: 'Mortal Kombat', category: 'games' },
  'com.popcap.pvzfree': { name: 'Plants vs Zombies', category: 'games' },
  'com.ea.game.pvzfree_row': { name: 'Plants vs Zombies', category: 'games' },
  'com.outfit7.talkingtom2': { name: 'Talking Tom', category: 'games' },
  'com.google.android.play.games': { name: 'Play Games', category: 'games' },
  // ── Browser ─────────────────────────────────────────────────────────────────
  'com.android.chrome': { name: 'Chrome', category: 'browser' },
  'com.brave.browser': { name: 'Brave', category: 'browser' },
  'org.mozilla.firefox': { name: 'Firefox', category: 'browser' },
  'com.microsoft.emmx': { name: 'Edge', category: 'browser' },
  'com.opera.browser': { name: 'Opera', category: 'browser' },
  'com.opera.mini.native': { name: 'Opera Mini', category: 'browser' },
  'com.UCMobile.intl': { name: 'UC Browser', category: 'browser' },
  'com.uc.browser.en': { name: 'UC Browser', category: 'browser' },
  'com.sec.android.app.sbrowser': { name: 'Samsung Internet', category: 'browser' },
  'com.duckduckgo.mobile.android': { name: 'DuckDuckGo', category: 'browser' },
  'com.mi.globalbrowser': { name: 'Mi Browser', category: 'browser' },
  'com.heytap.browser': { name: 'OPPO Browser', category: 'browser' },
  'com.coloros.browser': { name: 'ColorOS Browser', category: 'browser' },
  'com.vivo.browser': { name: 'Vivo Browser', category: 'browser' },
  'com.realme.browser': { name: 'Realme Browser', category: 'browser' },
  'com.kiwibrowser.browser': { name: 'Kiwi Browser', category: 'browser' },
  // ── Shopping ────────────────────────────────────────────────────────────────
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
  'com.blinkit.consumer': { name: 'Blinkit', category: 'shopping' },
  'com.grofers.customerapp': { name: 'Blinkit', category: 'shopping' },
  'com.zeptonow.app': { name: 'Zepto', category: 'shopping' },
  'com.bigbasket.app': { name: 'BigBasket', category: 'shopping' },
  'com.jpl.jiomart': { name: 'JioMart', category: 'shopping' },
  'com.snapdeal.main': { name: 'Snapdeal', category: 'shopping' },
  'com.paytmmall.android': { name: 'Paytm Mall', category: 'shopping' },
  'com.shopsy.android': { name: 'Shopsy', category: 'shopping' },
  // ── Productivity ────────────────────────────────────────────────────────────
  'com.google.android.apps.docs': { name: 'Google Docs', category: 'productivity' },
  'com.google.android.apps.sheets': { name: 'Google Sheets', category: 'productivity' },
  'com.google.android.apps.slides': { name: 'Google Slides', category: 'productivity' },
  'com.microsoft.office.word': { name: 'Word', category: 'productivity' },
  'com.microsoft.office.excel': { name: 'Excel', category: 'productivity' },
  'com.microsoft.office.powerpoint': { name: 'PowerPoint', category: 'productivity' },
  'com.google.android.calendar': { name: 'Google Calendar', category: 'productivity' },
  'com.microsoft.launcher': { name: 'Microsoft Launcher', category: 'productivity' },
  'com.todoist.android': { name: 'Todoist', category: 'productivity' },
  'com.duolingo': { name: 'Duolingo', category: 'productivity' },
  'com.notion.android': { name: 'Notion', category: 'productivity' },
  'com.google.android.keep': { name: 'Google Keep', category: 'productivity' },
  'com.evernote': { name: 'Evernote', category: 'productivity' },
  'com.ticktick.task': { name: 'TickTick', category: 'productivity' },
  'com.google.android.apps.tasks': { name: 'Google Tasks', category: 'productivity' },
  'com.adobe.reader': { name: 'Acrobat Reader', category: 'productivity' },
  'com.google.android.apps.searchlite': { name: 'Google Search', category: 'productivity' },
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
  const { getLearnedApp } = require('./learnedApps');
  const learned = getLearnedApp(packageName);
  if (learned) return learned.name;
  return nativeLabel || (packageName.split('.').pop() ?? packageName);
}

export function getAppMeta(packageName: string, androidCategory?: number): AppMeta {
  if (APP_MAP[packageName]) return APP_MAP[packageName];
  const { getLearnedApp } = require('./learnedApps');
  const learned = getLearnedApp(packageName);
  if (learned) return { name: learned.name, category: learned.category };
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
