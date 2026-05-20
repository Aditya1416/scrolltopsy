import { registerPlugin } from '@capacitor/core';

const UsageStats = registerPlugin('UsageStats');

const isNative = () => window.Capacitor?.isNativePlatform?.() === true;

export async function hasUsagePermission() {
  if (!isNative()) return false;
  try {
    const { granted } = await UsageStats.hasPermission();
    return granted === true;
  } catch {
    return false;
  }
}

export async function requestUsagePermission() {
  if (!isNative()) return;
  try {
    await UsageStats.requestPermission();
  } catch {}
}

export async function detectTopApp(startTimeMs, endTimeMs) {
  if (!isNative()) return null;
  try {
    const result = await UsageStats.queryTopApp({
      startTime: startTimeMs,
      endTime: endTimeMs ?? Date.now(),
    });
    if (!result.detected) return null;
    return {
      packageName: result.packageName,
      appName: result.appName,
      foregroundMs: result.foregroundMs,
    };
  } catch {
    return null;
  }
}
