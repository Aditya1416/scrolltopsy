import { NativeModules } from 'react-native';

const { UsageStats, TrackingService, OverlayPermission, AppBlocker } = NativeModules;

export interface AppUsage {
  packageName: string;
  appName: string;
  totalMs: number;
  lastUsed: number;
  appCategory?: number;
}

export interface AppSession {
  startTime: number;
  endTime: number;
  durationMs: number;
}

export const usageStatsModule = {
  hasPermission: (): Promise<boolean> => UsageStats?.hasPermission() ?? Promise.resolve(false),
  requestPermission: () => UsageStats?.requestPermission(),
  getUsageStats: (days: number): Promise<AppUsage[]> =>
    UsageStats?.getUsageStats(days) ?? Promise.resolve([]),
  getAppSessions: (packageName: string, days: number): Promise<AppSession[]> =>
    UsageStats?.getAppSessions(packageName, days) ?? Promise.resolve([]),
  getCurrentForegroundApp: (): Promise<{ packageName: string; appName: string } | null> =>
    UsageStats?.getCurrentForegroundApp() ?? Promise.resolve(null),
};

export const trackingServiceModule = {
  start: () => TrackingService?.startService(),
  stop: () => TrackingService?.stopService(),
  isRunning: (): Promise<boolean> => TrackingService?.isRunning() ?? Promise.resolve(false),
};

export const overlayModule = {
  hasPermission: (): Promise<boolean> => OverlayPermission?.hasPermission() ?? Promise.resolve(false),
  requestPermission: () => OverlayPermission?.requestPermission(),
};

export const blockerModule = {
  setForceStop: (packageName: string, enabled: boolean): void =>
    AppBlocker?.setForceStop(packageName, enabled),
  isForceStopEnabled: (packageName: string): Promise<boolean> =>
    AppBlocker?.isForceStopEnabled(packageName) ?? Promise.resolve(false),
  blockApp: (packageName: string, screenCount: number): void =>
    AppBlocker?.blockApp(packageName, screenCount),
  unblockApp: (packageName: string): void => AppBlocker?.unblockApp(packageName),
  clearGauntlet: (packageName: string): void => AppBlocker?.clearGauntlet(packageName),
  setTheme: (isDark: boolean): void => AppBlocker?.setThemeDark(isDark),
  getBlockedApps: (): Promise<Array<{ packageName: string; screenCount: number; blockedAt: number }>> =>
    AppBlocker?.getBlockedApps() ?? Promise.resolve([]),
  hasOverlayPermission: (): Promise<boolean> =>
    AppBlocker?.hasOverlayPermission() ?? Promise.resolve(false),
  requestOverlayPermission: (): void => AppBlocker?.requestOverlayPermission(),
  hasAccessibilityPermission: (): Promise<boolean> =>
    AppBlocker?.hasAccessibilityPermission() ?? Promise.resolve(false),
  requestAccessibilityPermission: (): void => AppBlocker?.requestAccessibilityPermission(),
};
