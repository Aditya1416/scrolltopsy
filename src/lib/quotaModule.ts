import { NativeModules } from 'react-native';
const { AppQuota } = NativeModules;

export const quotaModule = {
  setQuota: (packageName: string, limitMins: number): Promise<void> =>
    AppQuota?.setQuota(packageName, limitMins) ?? Promise.resolve(),
  clearQuota: (packageName: string): Promise<void> =>
    AppQuota?.clearQuota(packageName) ?? Promise.resolve(),
  getQuota: (packageName: string): Promise<number> =>
    AppQuota?.getQuota(packageName) ?? Promise.resolve(0),
  getAllQuotas: (): Promise<Record<string, number>> =>
    AppQuota?.getAllQuotas() ?? Promise.resolve({}),
};
