import { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/lib/firebase';
import { configureGoogleSignIn } from './src/lib/auth';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import ShameScreen from './src/screens/ShameScreen';

SplashScreen.preventAutoHideAsync();
configureGoogleSignIn();

const Stack = createStackNavigator();

function AppContent() {
  const { C } = useTheme();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    if (user !== undefined) SplashScreen.hideAsync();
  }, [user]);

  useEffect(() => {
    const timeout = setTimeout(() => setUser(null), 5000);
    const unsub = onAuthStateChanged(auth, u => { clearTimeout(timeout); setUser(u ?? null); });
    return () => { unsub(); clearTimeout(timeout); };
  }, []);

  if (user === undefined) return <View style={[styles.splash, { backgroundColor: C.void }]} />;

  if (!user) {
    return <LoginScreen onLoginSuccess={() => {}} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: C.void },
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Home">{props => <HomeScreen {...props} user={user} />}</Stack.Screen>
        <Stack.Screen name="Tracking" component={TrackingScreen} />
        <Stack.Screen name="Shame" component={ShameScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1 },
});
