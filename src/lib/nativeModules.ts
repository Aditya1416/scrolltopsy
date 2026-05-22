import { NativeModules } from 'react-native';

const { UsageStats, TrackingService, OverlayPermission } = NativeModules;

export interface AppUsage {
  packageName: string;
  appName: string;
  totalMs: number;
  lastUsed: number;
}

export const usageStatsModule = {
  hasPermission: (): Promise<boolean> => UsageStats?.hasPermission() ?? Promise.resolve(false),
  requestPermission: () => UsageStats?.requestPermission(),
  getUsageStats: (days: number): Promise<AppUsage[]> =>
    UsageStats?.getUsageStats(days) ?? Promise.resolve([]),
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
