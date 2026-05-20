// App-aware scrolltype classification.
// Called after saveSession with fresh profile, patterns, and topApp name.
// Falls back to the storage.js scrolltype when topApp is null.

export function classifyWithApp(profile, patterns, topApp) {
  const wh = profile.worstHour;
  const isNight = wh >= 22 || wh <= 2;
  const isMorning = wh >= 6 && wh <= 9;

  if (!topApp) {
    if (patterns?.relapsing && patterns?.sessionCountToday > 3) {
      return 'compulsive relapse engine';
    }
    return profile.scrolltype;
  }

  const app = topApp.toLowerCase().trim();

  switch (app) {
    case 'instagram':
      if (isNight) return 'late-night instagram void diver';
      if (isMorning) return 'morning instagram anxiety checker';
      return 'instagram rabbit hole diver';

    case 'tiktok':
      if (isNight) return 'late-night tiktok spiral navigator';
      return 'tiktok time sink architect';

    case 'youtube':
      if (isNight) return 'late-night youtube abyss crawler';
      if (profile.longestSessionMins > 45) return 'youtube deep dive diver';
      return 'youtube rabbit hole explorer';

    case 'x / twitter':
      if (isMorning) return 'morning anxiety twitter checker';
      return 'x / twitter doom feeder';

    case 'reddit':
      return 'reddit thread archaeologist';

    case 'facebook':
      return 'facebook memory lane wanderer';

    case 'snapchat':
      return 'snapchat streak prisoner';

    case 'linkedin':
      return 'linkedin professional procrastinator';

    case 'pinterest':
      return 'pinterest inspiration hoarder';

    default:
      if (isNight) return `late-night ${app} doom merchant`;
      return `${app} scroll consumer`;
  }
}
