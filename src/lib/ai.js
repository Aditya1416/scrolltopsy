export const SHAME_DICTIONARY = {

  // TIER 1 — under 5 minutes. Dry, almost indifferent.
  tier1: [
    "duration: {mins} minutes. within expected parameters.",
    "{mins} minutes. the feed released you early today.",
    "session logged. {mins} minutes. below your average.",
    "a brief visit. {mins} minutes returned to the algorithm.",
    "{mins} minutes. you noticed. that is atypical.",
    "short session. the habit is still present.",
    "{mins} minutes consumed. the reflex is intact.",
    "you stopped at {mins} minutes. this will not always happen.",
    "early termination at {mins} minutes. noted.",
    "{mins} minutes. the pattern continues at low intensity.",
    "session: {mins} min. you checked in. you left. the app is still there.",
    "brief exposure. {mins} minutes. the urge satisfied at low cost today.",
  ],

  // TIER 2 — 5 to 15 minutes. Matter-of-fact, slightly pointed.
  tier2: [
    "{mins} minutes of your finite time transferred to an algorithm.",
    "session complete. duration: {mins} minutes. value received: none.",
    "{mins} minutes elapsed. you will not remember what you saw.",
    "time lost: {mins} minutes. that decision was made for you, not by you.",
    "{mins} minutes. the platform logged this as engagement. you logged it as nothing.",
    "you spent {mins} minutes reading content selected to retain you. it worked.",
    "{mins} minutes. this is the {count}th session today. the reflex is reliable.",
    "engagement recorded: {mins} minutes. your attention was the product.",
    "{mins} minutes elapsed since you decided to stop. you have not stopped.",
    "session duration: {mins} minutes. no information was gained. no connection was made.",
    "{mins} minutes. the content was designed to feel urgent. none of it was.",
    "you gave {mins} minutes to a system that does not know your name.",
  ],

  // TIER 3 — 15 to 30 minutes. Clinical observation, no comfort.
  tier3: [
    "{mins} minutes. a significant portion of this hour is gone.",
    "prognosis: {mins} minutes elapsed. recurrence: likely within 2 hours.",
    "{mins} minutes consumed. this is above your recent average. the trend is upward.",
    "assessment: {mins} minutes. you were aware this would happen. you proceeded.",
    "{mins} minutes. this is not relaxation. the cortisol data would confirm this.",
    "the session lasted {mins} minutes. you felt worse at the end than the beginning.",
    "{mins} minutes transferred. the thing you were avoiding is still waiting.",
    "duration: {mins} minutes. you thought about stopping at least once. you did not.",
    "{mins} minutes. your attention has a market value. you gave it away.",
    "session log: {mins} minutes. the algorithm improved its model of you today.",
    "{mins} minutes. nothing you read changed anything. you knew this before you started.",
    "time invoice: {mins} minutes billed. no services rendered to you.",
  ],

  // TIER 4 — 30 to 60 minutes. Cold precision. No warmth anywhere.
  tier4: [
    "{mins} minutes. this is now a significant event in your day.",
    "half an hour. the algorithm held your attention for half an hour.",
    "{mins} minutes elapsed. you will remember none of it by tomorrow morning.",
    "clinical note: {mins} minutes of unrecoverable time. prognosis unchanged.",
    "{mins} minutes. someone, somewhere, received a bonus because of this session.",
    "duration: {mins} minutes. the people who built this product are not your friends.",
    "{mins} minutes. you were present for none of it.",
    "assessment: {mins} minutes lost to a system optimised against your interests.",
    "{mins} minutes. the task you postponed for this has not completed itself.",
    "session summary: {mins} minutes. engagement: total. benefit: zero.",
    "{mins} minutes. you will do this again today. the data suggests this with confidence.",
    "time of death: {mins} minutes of this hour. cause: habitual.",
  ],

  // TIER 5 — over 60 minutes. Quiet devastation. Final.
  tier5: [
    "over an hour. the algorithm won this session decisively.",
    "{mins} minutes. this is approaching the duration of a full sleep cycle.",
    "duration: {mins} minutes. this will not appear on your resume.",
    "{mins} minutes. you will not get a refund.",
    "assessment: {mins} minutes elapsed. this is now a material portion of your waking day.",
    "an hour of your life has been logged as engagement metrics somewhere.",
    "{mins} minutes. the people you care about did not see you during this time.",
    "duration: {mins} minutes. this is longer than most meaningful conversations.",
    "{mins} minutes. the algorithm knows your schedule better than you do now.",
    "session logged: {mins} minutes. this was not a choice. it was a design outcome.",
    "over an hour elapsed. your future self will not remember what justified this.",
    "{mins} minutes. this is the longest session you have recorded. that is data.",
  ],

};

// Tier selection logic
export function selectTier(mins) {
  if (mins < 5) return 'tier1';
  if (mins < 15) return 'tier2';
  if (mins < 30) return 'tier3';
  if (mins < 60) return 'tier4';
  return 'tier5';
}

// Message selection with {mins} interpolation and repeat prevention
export function getShameMessage(mins, lastMessageId, sessionCountToday) {
  const tier = selectTier(mins);
  const pool = SHAME_DICTIONARY[tier];

  // Filter out the last shown message to prevent immediate repeat
  const available = pool.filter((_, i) => `${tier}-${i}` !== lastMessageId);
  const source = available.length > 0 ? available : pool;

  // Rotate based on session count today for variety
  const index = sessionCountToday % source.length;
  const raw = source[index];
  const message = raw
    .replace(/{mins}/g, mins)
    .replace(/{count}/g, sessionCountToday);

  const id = `${tier}-${pool.indexOf(source[index])}`;
  return { message, id };
}

// Backwards compatibility layer for App.jsx
class AIController {
    constructor() {
        this.ready = true;
    }

    loadModel(onProgressCallback) {
        if (onProgressCallback) {
            onProgressCallback({ status: 'ready' });
        }
    }

    async generateShameMessage(minutes) {
        return new Promise(async (resolve) => {
            try {
                // dynamically import storage to avoid circular dependencies if any
                const { getProfile, replaceProfile } = await import('./storage.js');
                const profile = await getProfile();
                
                const { message, id } = getShameMessage(minutes, profile.lastShameMessageId, profile.totalSessions);
                
                // Save the id so we don't repeat next time
                profile.lastShameMessageId = id;
                await replaceProfile(profile);

                setTimeout(() => {
                    resolve(message);
                }, 800);
            } catch(e) {
                // Fallback if storage fails
                const { message } = getShameMessage(minutes, null, 1);
                resolve(message);
            }
        });
    }
}

export const ai = new AIController();
