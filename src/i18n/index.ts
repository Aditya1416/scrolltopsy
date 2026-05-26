import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en';
import hi from './locales/hi';
import hin from './locales/hin';
import es from './locales/es';
import fr from './locales/fr';
import de from './locales/de';
import pt from './locales/pt';
import ja from './locales/ja';
import ko from './locales/ko';
import zh from './locales/zh';
import ar from './locales/ar';
import bn from './locales/bn';

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hin', label: 'Hinglish' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'bn', label: 'বাংলা' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
];

const STORAGE_KEY = 'sct_language';

export async function initI18n() {
  const stored = await AsyncStorage.getItem(STORAGE_KEY).catch(() => null);
  const deviceLang = getLocales()[0]?.languageCode ?? 'en';
  const lng = stored ?? (LANGUAGES.some(l => l.code === deviceLang) ? deviceLang : 'en');

  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v4',
      resources: {
        en: { translation: en },
        hin: { translation: hin },
        hi: { translation: hi },
        bn: { translation: bn },
        es: { translation: es },
        fr: { translation: fr },
        de: { translation: de },
        pt: { translation: pt },
        ja: { translation: ja },
        ko: { translation: ko },
        zh: { translation: zh },
        ar: { translation: ar },
      },
      lng,
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
    });

  return i18n;
}

export async function setLanguage(code: string) {
  await AsyncStorage.setItem(STORAGE_KEY, code);
  await i18n.changeLanguage(code);
}

export default i18n;
