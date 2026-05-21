import { useEffect, useState } from 'react';
import { View, StatusBar, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  SpaceMono_400Regular,
  SpaceMono_700Bold,
  SpaceMono_400Regular_Italic,
} from '@expo-google-fonts/space-mono';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './src/lib/firebase';
import { configureGoogleSignIn } from './src/lib/auth';
import HomeScreen from './src/screens/HomeScreen';
import TrackingScreen from './src/screens/TrackingScreen';
import ShameScreen from './src/screens/ShameScreen';

configureGoogleSignIn();

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceMono_400Regular,
    SpaceMono_700Bold,
    SpaceMono_400Regular_Italic,
  });
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const timeout = setTimeout(() => setUser(null), 5000);
    const unsubscribe = onAuthStateChanged(auth, u => {
      clearTimeout(timeout);
      setUser(u ?? null);
    });
    return () => { unsubscribe(); clearTimeout(timeout); };
  }, []);

  if (!fontsLoaded || user === undefined) {
    return <View style={styles.splash} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#000' },
            gestureEnabled: false,
          }}
        >
          <Stack.Screen name="Home">
            {props => <HomeScreen {...props} user={user} />}
          </Stack.Screen>
          <Stack.Screen name="Tracking" component={TrackingScreen} />
          <Stack.Screen name="Shame" component={ShameScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: '#000000' },
});
