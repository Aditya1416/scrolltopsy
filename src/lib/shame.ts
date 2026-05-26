// App-specific intercept messages — keyed by package name substring
const APP_MESSAGES: Record<string, string[]> = {
  instagram: [
    "you checked whether anyone liked you.\nthe number changed nothing.",
    "instagram sells you the feeling that everyone else\nis living a life you're missing.\nyou just paid with {mins} minutes.",
    "you came back to see if anything changed.\nnothing did. it never does.",
    "you opened instagram because you were bored.\nyou'll close it feeling worse.\nthis is not a coincidence.",
    "the reel is 30 seconds.\nyou watched {mins} minutes of them.\nno thought you had was your own.",
    "you scrolled past {mins} minutes of people\nperforming happiness for an algorithm.\nnone of it was real. including how it made you feel.",
  ],
  tiktok: [
    "tiktok's entire purpose is to make {mins} minutes\nfeel like 5.\nit worked on you again.",
    "the algorithm learned something about your insecurities today.\nyou paid for that lesson with {mins} minutes.",
    "{mins} minutes. your attention span\nis now slightly shorter than it was this morning.",
    "you were going to do something.\ntiktok remembered that you say that every time.",
    "designed by engineers to be unputdownable.\nyou just confirmed their product works.",
  ],
  youtube: [
    "you spent {mins} minutes watching someone else\ndo the thing you said you wanted to do.",
    "{mins} minutes of passive consumption.\nno skill gained. no conversation had. no step taken.",
    "the autoplay feature exists because\nyou've proven you won't stop yourself.\nit was right.",
    "you were avoiding something.\nyoutube held you in that avoidance for {mins} minutes.\nit's still there.",
    "{mins} minutes. your to-do list didn't shrink\nwhile you were gone.",
  ],
  'youtube.music': [
    "you called it background music.\nyou meant distraction.",
    "{mins} minutes of audio chosen by an algorithm\nthat profits from your continued presence.",
    "you weren't enjoying music.\nyou were postponing the silence\nwhere your thoughts live.",
  ],
  tiktok_music: [
    "a music app that's also a tracking device.\n{mins} minutes of data about your taste donated freely.",
  ],
  twitter: [
    "{mins} minutes of other people's anger.\nyou absorbed it. you'll carry it.",
    "you checked twitter to understand the world.\nyou left more confused and more anxious.\nas designed.",
    "{mins} minutes scrolling through outrage.\nnone of it required your presence.\nall of it got it anyway.",
  ],
  reddit: [
    "{mins} minutes proving to strangers\nyou're smarter than them.\nnobody won.",
    "reddit gave you the feeling of being informed\nwithout the inconvenience of doing anything about it.",
    "{mins} minutes in communities that exist\nto make you feel like you belong somewhere.\nyou left feeling the same as before.",
  ],
  snapchat: [
    "you checked your streak.\nthe streak is a leash they put on you\nand told you to maintain.",
    "{mins} minutes documenting your life for people\nyou wouldn't call if something was wrong.",
    "snap exists to make you afraid\nof being forgotten.\n{mins} minutes spent feeding that fear.",
  ],
  facebook: [
    "{mins} minutes on a platform\nthat knows more about your psychology\nthan your closest friends.",
    "you opened facebook.\nsomebody's algorithm flagged this\nas engagement. you were the product.",
    "{mins} minutes of content that made you feel\nslightly worse about people you used to care about.",
  ],
  whatsapp: [
    "you checked whatsapp {mins} minutes ago.\nyou're checking it again.\nthey didn't suddenly need you.",
    "the message you're afraid to miss\nwas not there. it never is when you check compulsively.",
    "{mins} minutes monitoring other people's activity timestamps.\nthis is not connection. this is anxiety.",
  ],
  games: [
    "{mins} minutes in a world designed to be\nmore rewarding than your actual life.\nby design, not coincidence.",
    "the game gave you a sense of progress.\nyour real-life tasks did not progress during this time.",
    "{mins} minutes. the dopamine was engineered.\nthe achievement was not real.\nyou knew this. you played anyway.",
  ],
  clash: [
    "{mins} minutes attacking strangers\nto generate metrics for supercell's quarterly report.",
    "clash royale exists because you need\nthe feeling of winning something.\nit gave you that feeling in exchange for {mins} minutes.",
  ],
  pubg: [
    "{mins} minutes of manufactured survival instinct.\nyour actual survival instincts were unexercised.",
    "victory royale requires {mins} minutes of your finite life.\nno skill gained transfers outside the game.",
  ],
  shopping: [
    "you came for one thing.\nyou stayed for {mins} minutes of things you don't need.",
    "the cart you filled will mostly not be purchased.\nthe {mins} minutes spent filling it are already gone.",
    "retail therapy isn't therapy.\n{mins} minutes of browsing changed nothing about how you feel.",
  ],
  amazon: [
    "{mins} minutes adding things to a cart\nto feel like you're solving a problem.",
    "amazon's interface is designed to make spending feel like decision-making.\nyou spent {mins} minutes making no decisions.",
  ],
  flipkart: [
    "{mins} minutes comparing products\nyou'll buy the same one you had in mind anyway.",
  ],
  news: [
    "{mins} minutes consuming news\nthat required no action from you\nand produced none.",
    "you checked the news to feel informed.\nyou feel anxious instead.\nthis happens every time.",
    "{mins} minutes of events happening to other people\nin places you cannot affect.\nyour presence here changed nothing.",
  ],
  netflix: [
    "you said one more episode {mins} minutes ago.",
    "{mins} minutes of content designed to end\non a moment that makes stopping feel wrong.",
    "you were tired. netflix kept you awake\nso you'd be more tired tomorrow.\n{mins} minutes spent getting worse.",
  ],
  spotify: [
    "{mins} minutes choosing what to listen to\ninstead of listening to anything.",
    "you opened spotify.\nyou scrolled for {mins} minutes.\nyou may or may not have played music.",
  ],
  chrome: [
    "{mins} minutes of browsing\nwith no destination in mind.",
    "you opened a browser looking for something.\n{mins} minutes later you're not sure what it was.",
  ],
};

// Time-of-day context messages
const TIME_MESSAGES: Record<string, string[]> = {
  latenight: [
    "it is past midnight. this is not leisure.\nthis is what avoiding sleep looks like.",
    "late-night scrolling is a symptom.\nyou're treating the symptom with more of the cause.",
    "you are awake at this hour because tomorrow feels too heavy\nand the screen makes it easier to not think about it.",
    "the things you're avoiding\ngrow sharper at this hour, not smaller.\nthe scroll doesn't help. you know this.",
    "your body is exhausted.\nyou gave it a screen instead of rest.\ntomorrow will confirm this was wrong.",
  ],
  earlymorning: [
    "your eyes weren't fully open\nand you reached for a screen.\nthe day hasn't started and you've already lost time.",
    "first thought of the day:\nan algorithm selected for you.\nnot you.",
    "morning is when your brain is sharpest.\nyou spent it here.",
  ],
  workhours: [
    "whatever you were supposed to be doing\nis still unfinished.",
    "this happened during working hours.\nyou'll feel this at the end of the day.",
    "procrastination is just fear\nwith better PR.\nyou just spent {mins} minutes proving that.",
  ],
  afternoon: [
    "the afternoon slump is real.\nyou fed it with dopamine instead of water or movement.",
    "{mins} minutes of the most cognitively available\nhours of the afternoon. spent here.",
  ],
};

// Repeat-session escalation messages
const REPEAT_MESSAGES = [
  "this is session {count} today.\nthat's not a number someone checks once.",
  "you've been here {count} times today.\nthe first time was a choice. by now it's a reflex.",
  "session {count}. the fact that you've counted\ntells you something. the fact that you're here again tells you more.",
  "{count} times today. at some point the word\n'quick check' stops applying.",
  "you said you were done {count} times today.\nthe word 'done' is doing a lot of work.",
];

// Core shame dictionary — tiers by duration
export const SHAME_DICTIONARY = {
  tier1: [
    "duration: {mins} minutes. within expected parameters.",
    "{mins} minutes. the feed released you early today.",
    "session logged. {mins} minutes. below your average.",
    "{mins} minutes. you noticed. that is atypical.",
    "short session. the habit is still present.",
    "you stopped at {mins} minutes. this will not always happen.",
    "{mins} minutes. the pattern continues at low intensity.",
    "brief exposure. {mins} minutes. the urge satisfied at low cost today.",
    "the compulsion lasted {mins} minutes.\nyou interrupted it. note that this is possible.",
  ],
  tier2: [
    "{mins} minutes of your finite time transferred to an algorithm.",
    "session complete. duration: {mins} minutes. value received: none.",
    "{mins} minutes elapsed. you will not remember what you saw.",
    "time lost: {mins} minutes. that decision was made for you, not by you.",
    "you spent {mins} minutes reading content selected to retain you. it worked.",
    "engagement recorded: {mins} minutes. your attention was the product.",
    "{mins} minutes elapsed since you decided to stop. you have not stopped.",
    "{mins} minutes. the content was designed to feel urgent. none of it was.",
    "you gave {mins} minutes to a system that does not know your name.",
    "the need felt real. the {mins} minutes spent on it\ndidn't make it real. just gone.",
  ],
  tier3: [
    "{mins} minutes. a significant portion of this hour is gone.",
    "prognosis: {mins} minutes elapsed. recurrence: likely within 2 hours.",
    "{mins} minutes consumed. this is above your recent average. the trend is upward.",
    "assessment: {mins} minutes. you were aware this would happen. you proceeded.",
    "{mins} minutes. this is not relaxation. the cortisol data would confirm this.",
    "the session lasted {mins} minutes. you felt worse at the end than the beginning.",
    "{mins} minutes transferred. the thing you were avoiding is still waiting.",
    "duration: {mins} minutes. you thought about stopping at least once. you did not.",
    "{mins} minutes. nothing you read changed anything. you knew this before you started.",
    "you told yourself you'd stop at {mins} minutes.\nyou reached {mins} minutes.\nyou're reading this now.",
    "{mins} minutes. the platform got exactly what it needed from you.\nyou got what, exactly.",
  ],
  tier4: [
    "{mins} minutes. this is now a significant event in your day.",
    "half an hour. the algorithm held your attention for half an hour.",
    "{mins} minutes elapsed. you will remember none of it by tomorrow morning.",
    "clinical note: {mins} minutes of unrecoverable time. prognosis unchanged.",
    "{mins} minutes. someone, somewhere, received a bonus because of this session.",
    "{mins} minutes. you were present for none of it.",
    "assessment: {mins} minutes lost to a system optimised against your interests.",
    "{mins} minutes. the task you postponed for this has not completed itself.",
    "session summary: {mins} minutes. engagement: total. benefit: zero.",
    "{mins} minutes. you will do this again today. the data suggests this with confidence.",
    "time of death: {mins} minutes of this hour. cause: habitual.",
    "you had plans for today.\n{mins} minutes of them went here.\nthe rest are still theoretically possible.",
  ],
  tier5: [
    "over an hour. the algorithm won this session decisively.",
    "{mins} minutes. this is approaching the duration of a full sleep cycle.",
    "{mins} minutes. you will not get a refund.",
    "assessment: {mins} minutes elapsed. this is now a material portion of your waking day.",
    "an hour of your life has been logged as engagement metrics somewhere.",
    "{mins} minutes. the people you care about did not see you during this time.",
    "{mins} minutes. the algorithm knows your schedule better than you do now.",
    "session logged: {mins} minutes. this was not a choice. it was a design outcome.",
    "over an hour elapsed. your future self will not remember what justified this.",
    "{mins} minutes. the word 'addiction' exists to describe a pattern.\nthis is a data point in that pattern.",
    "you lost {mins} minutes today that you'll spend the rest of the day\ntrying to justify.\nyou won't justify them. they're gone.",
    "an hour returned to the feed.\nthe feed didn't notice.\nthe feed never notices.\nthat's the whole point.",
  ],
};

export interface ShameContext {
  pkg?: string;
  appName?: string;
  hour?: number;
  sessionCountToday?: number;
}

export function selectTier(mins: number): string {
  if (mins < 5) return 'tier1';
  if (mins < 15) return 'tier2';
  if (mins < 30) return 'tier3';
  if (mins < 60) return 'tier4';
  return 'tier5';
}

function getTimeSlot(hour: number): string | null {
  if (hour >= 0 && hour < 6) return 'latenight';
  if (hour >= 6 && hour < 9) return 'earlymorning';
  if (hour >= 9 && hour < 17) return 'workhours';
  if (hour >= 14 && hour < 18) return 'afternoon';
  return null;
}

function getAppKey(pkg: string): string | null {
  const p = pkg.toLowerCase();
  if (p.includes('instagram')) return 'instagram';
  if (p.includes('tiktok')) return 'tiktok';
  if (p.includes('youtube.music') || p.includes('youtubemusic')) return 'youtube.music';
  if (p.includes('youtube')) return 'youtube';
  if (p.includes('twitter') || p.includes('com.x.')) return 'twitter';
  if (p.includes('reddit')) return 'reddit';
  if (p.includes('snapchat')) return 'snapchat';
  if (p.includes('facebook') || p.includes('fb.katana')) return 'facebook';
  if (p.includes('whatsapp')) return 'whatsapp';
  if (p.includes('clash')) return 'clash';
  if (p.includes('pubg') || p.includes('battlegrounds')) return 'pubg';
  if (p.includes('amazon')) return 'amazon';
  if (p.includes('flipkart')) return 'flipkart';
  if (p.includes('netflix')) return 'netflix';
  if (p.includes('spotify')) return 'spotify';
  if (p.includes('chrome')) return 'chrome';
  if (p.includes('myntra') || p.includes('ajio') || p.includes('nykaa')) return 'shopping';
  if (p.includes('game') || p.includes('play')) return 'games';
  if (p.includes('news') || p.includes('inshorts') || p.includes('ndtv')) return 'news';
  return null;
}

function interpolate(raw: string, mins: number, count: number): string {
  return raw.replace(/{mins}/g, String(mins)).replace(/{count}/g, String(count));
}

export function getShameMessage(
  mins: number,
  lastId: string,
  count: number,
  ctx?: ShameContext
): { message: string; id: string } {
  const hour = ctx?.hour ?? new Date().getHours();
  const pkg = ctx?.pkg ?? '';
  const sessionCount = ctx?.sessionCountToday ?? count;

  // High repeat count (5+ sessions today) — lead with that
  if (sessionCount >= 5 && Math.random() < 0.6) {
    const pool = REPEAT_MESSAGES;
    const raw = pool[sessionCount % pool.length];
    const msg = interpolate(raw, mins, sessionCount);
    return { message: msg, id: `repeat-${sessionCount % pool.length}` };
  }

  // App-specific message (50% chance when pkg known)
  if (pkg) {
    const appKey = getAppKey(pkg);
    if (appKey && APP_MESSAGES[appKey] && Math.random() < 0.55) {
      const pool = APP_MESSAGES[appKey];
      const idx = count % pool.length;
      const raw = pool[idx];
      const id = `app-${appKey}-${idx}`;
      if (id !== lastId) {
        return { message: interpolate(raw, mins, count), id };
      }
    }
  }

  // Time-based message (35% chance)
  const slot = getTimeSlot(hour);
  if (slot && Math.random() < 0.35) {
    const pool = TIME_MESSAGES[slot];
    if (pool) {
      const idx = count % pool.length;
      const id = `time-${slot}-${idx}`;
      if (id !== lastId) {
        return { message: interpolate(pool[idx], mins, count), id };
      }
    }
  }

  // Tier-based fallback
  const tier = selectTier(mins) as keyof typeof SHAME_DICTIONARY;
  const pool = SHAME_DICTIONARY[tier];
  const available = pool.filter((_, i) => `${tier}-${i}` !== lastId);
  const source = available.length > 0 ? available : pool;
  const index = count % source.length;
  const raw = source[index];
  const message = interpolate(raw, mins, count);
  const id = `${tier}-${pool.indexOf(source[index])}`;
  return { message, id };
}

export function getEquivalences(mins: number) {
  return {
    pages: Math.floor(mins * 1.5),
    steps: mins * 100,
    lines: Math.floor(mins * 8),
    nap: Math.round((mins / 20) * 100),
  };
}

// App-specific intercept messages for ShameInterceptActivity (used by Kotlin via SharedPrefs lookup)
// This is the source of truth — the Kotlin side reads the message by index from this exact order.
export function getInterceptMessage(pkg: string, openCount: number): string {
  const appKey = getAppKey(pkg);
  if (appKey && APP_MESSAGES[appKey]) {
    const pool = APP_MESSAGES[appKey];
    return pool[openCount % pool.length].replace(/{mins}/g, '').replace(/\n/g, '\n');
  }
  // Generic intercepts
  const generic = [
    "you said you were done.\nyou lied.",
    "what exactly do you think\nyou'll find in there this time?",
    "you literally set a limit on this.\nyou're here anyway.",
    "you knew this would happen.\npart of you planned for it.",
    "every time you do this\nyou make it harder to stop next time.",
    "reopening it won't feel different.\nyou already know how this ends.",
    "what you're looking for\nisn't in there. but sure.",
    "you set this limit because\nyou knew you couldn't stop.",
    "the slot machine brain wins again.",
    "back again.\nbeen here before, haven't you.",
  ];
  return generic[openCount % generic.length];
}
