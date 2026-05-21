export const SHAME_DICTIONARY = {
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

export function selectTier(mins: number): string {
  if (mins < 5) return 'tier1';
  if (mins < 15) return 'tier2';
  if (mins < 30) return 'tier3';
  if (mins < 60) return 'tier4';
  return 'tier5';
}

export function getShameMessage(mins: number, lastId: string, count: number): { message: string; id: string } {
  const tier = selectTier(mins) as keyof typeof SHAME_DICTIONARY;
  const pool = SHAME_DICTIONARY[tier];
  const available = pool.filter((_, i) => `${tier}-${i}` !== lastId);
  const source = available.length > 0 ? available : pool;
  const index = count % source.length;
  const raw = source[index];
  const message = raw.replace(/{mins}/g, String(mins)).replace(/{count}/g, String(count));
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
