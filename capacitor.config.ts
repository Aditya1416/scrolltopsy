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
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '203371134876-konb605dmugl54691capabrc1nqldgjt.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  }
};

export default config;
