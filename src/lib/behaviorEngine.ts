import { AppUsage } from './nativeModules';
import { getAppMeta, getBestName, AppCategory, DOOMSCROLL_CATEGORIES, mapAndroidCategory } from './appCategories';
import { saveLearnedApps } from './learnedApps';

export interface UsageAnalysis {
  totalDoomMins: number;
  byCategory: Record<string, number>;
  topApps: Array<{ packageName: string; appName: string; mins: number; category: string }>;
}

export interface BehaviorPattern {
  peakDoomHour: number;
  worstCategory: AppCategory;
  weeklyTrendMins: number[];
  predictedRiskToday: 'low' | 'medium' | 'high';
  scrolltype: string;
  totalDoomMins: number;
}

export function analyzeUsage(stats: AppUsage[]): UsageAnalysis {
  // Deduplicate by packageName — native layer can return multiple entries per package
  const deduped = Object.values(
    stats.reduce<Record<string, AppUsage>>((acc, a) => {
      if (acc[a.packageName]) {
        acc[a.packageName] = { ...acc[a.packageName], totalMs: acc[a.packageName].totalMs + a.totalMs };
      } else {
        acc[a.packageName] = { ...a };
      }
      return acc;
    }, {})
  );

  const getMeta = (a: AppUsage) => getAppMeta(a.packageName, a.appCategory);

  const doomApps = deduped.filter(a => DOOMSCROLL_CATEGORIES.includes(getMeta(a).category));
  const totalDoomMins = Math.round(doomApps.reduce((sum, a) => sum + a.totalMs, 0) / 60000);

  const byCategory: Record<string, number> = {};
  for (const app of doomApps) {
    const cat = getMeta(app).category;
    byCategory[cat] = (byCategory[cat] ?? 0) + Math.round(app.totalMs / 60000);
  }

  const mapped = deduped.map(a => ({
    packageName: a.packageName,
    appName: getBestName(a.packageName, a.appName),
    mins: Math.round(a.totalMs / 60000),
    category: getMeta(a).category,
  }));

  const topApps = mapped
    .filter(a => a.mins >= 1)
    .sort((a, b) => b.mins - a.mins)
    .slice(0, 5)
    .map(({ packageName, appName, mins, category }) => ({ packageName, appName, mins, category }));

  // Persist newly encountered apps for self-learning
  saveLearnedApps(
    mapped
      .filter(a => a.mins >= 1)
      .map(a => ({ packageName: a.packageName, name: a.appName, category: a.category as AppCategory }))
  );

  return { totalDoomMins, byCategory, topApps };
}

export function classifyScrolltype(totalMins: number, worstHour: number, topCategory: AppCategory): string {
  if (worstHour >= 22 || worstHour <= 2) return 'late-night doom merchant';
  if (worstHour >= 6 && worstHour <= 9) return 'morning anxiety checker';
  if (totalMins > 180) return 'deep void diver';
  if (topCategory === 'news') return 'dread mainliner';
  if (topCategory === 'shopping') return 'retail therapy escapist';
  return 'casual self-saboteur';
}

export function predictRisk(totalMins: number): 'low' | 'medium' | 'high' {
  if (totalMins > 120) return 'high';
  if (totalMins > 45) return 'medium';
  return 'low';
}

export function getTopCategory(byCategory: Record<string, number>): AppCategory {
  const entries = Object.entries(byCategory);
  if (entries.length === 0) return 'social';
  const top = entries.sort((a, b) => b[1] - a[1])[0];
  return top[0] as AppCategory;
}
