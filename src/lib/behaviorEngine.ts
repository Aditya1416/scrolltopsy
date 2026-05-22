import { AppUsage } from './nativeModules';
import { getAppMeta, AppCategory, DOOMSCROLL_CATEGORIES } from './appCategories';

export interface UsageAnalysis {
  totalDoomMins: number;
  byCategory: Record<string, number>;
  topApps: Array<{ appName: string; mins: number; category: string }>;
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

  const doomApps = deduped.filter(a => DOOMSCROLL_CATEGORIES.includes(getAppMeta(a.packageName).category));
  const totalDoomMins = Math.round(doomApps.reduce((sum, a) => sum + a.totalMs, 0) / 60000);

  const byCategory: Record<string, number> = {};
  for (const app of doomApps) {
    const cat = getAppMeta(app.packageName).category;
    byCategory[cat] = (byCategory[cat] ?? 0) + Math.round(app.totalMs / 60000);
  }

  const topApps = deduped
    .map(a => ({
      appName: getAppMeta(a.packageName).name,
      mins: Math.round(a.totalMs / 60000),
      category: getAppMeta(a.packageName).category,
    }))
    .filter(a => DOOMSCROLL_CATEGORIES.includes(a.category as AppCategory))
    .sort((a, b) => b.mins - a.mins)
    .slice(0, 5);

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
