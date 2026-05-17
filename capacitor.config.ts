import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.scrolltopsy.android',
  appName: 'Scrolltopsy',
  webDir: 'dist',
  android: {
    buildOptions: {
      releaseType: 'APK'
    }
  },
  server: {
    androidScheme: 'https',
    cleartext: false
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#0a0a0a',
      showSpinnerOnFullScreen: false,
      launchAutoHide: true,
      launchShowDuration: 0,
      androidSplashResourceName: 'splash',
      splashFullScreen: true,
      splashImmersive: true
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  }
};

export default config;
