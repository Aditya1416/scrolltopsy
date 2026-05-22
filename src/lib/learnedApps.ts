import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppCategory } from './appCategories';

const STORAGE_KEY = '@scrolltopsy_learned_apps';

export interface LearnedApp {
  packageName: string;
  name: string;
  category: AppCategory;
}

let cache: Record<string, LearnedApp> | null = null;

export async function loadLearnedApps(): Promise<void> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
}

export function getLearnedApp(packageName: string): LearnedApp | undefined {
  return cache?.[packageName];
}

export function saveLearnedApps(apps: LearnedApp[]): void {
  if (!cache) return;
  let changed = false;
  for (const app of apps) {
    if (!cache[app.packageName]) {
      cache[app.packageName] = app;
      changed = true;
    }
  }
  if (changed) {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cache)).catch(() => {});
  }
}
