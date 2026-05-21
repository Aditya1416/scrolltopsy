import { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, TouchableOpacity, AppState, AppStateStatus,
  Animated, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from '../theme';
import { saveSession } from '../lib/storage';
import MonoText from '../components/MonoText';

const SESSION_KEY = 'sct_session_start';

interface Props { navigation: any; }

export default function TrackingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const startTimeRef = useRef<string>('');
  const [elapsed, setElapsed] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const init = async () => {
      const stored = await AsyncStorage.getItem(SESSION_KEY);
      const now = Date.now().toString();
      if (!stored) await AsyncStorage.setItem(SESSION_KEY, now);
      startTimeRef.current = stored ?? now;
      setElapsed(Math.floor((Date.now() - parseInt(startTimeRef.current)) / 1000));
    };
    init();

    const id = setInterval(() => {
      if (startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - parseInt(startTimeRef.current)) / 1000));
      }
    }, 1000);

    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active' && startTimeRef.current) {
        setElapsed(Math.floor((Date.now() - parseInt(startTimeRef.current)) / 1000));
      }
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const pulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  const mins = Math.floor(elapsed / 60);
  const secs = (elapsed % 60).toString().padStart(2, '0');
  const timerStr = `${mins}:${secs}`;

  const handleDone = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const durationMins = Math.max(1, Math.ceil(elapsed / 60));
    await saveSession(durationMins);
    await AsyncStorage.removeItem(SESSION_KEY);
    navigation.replace('Shame', { durationMins });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Pulsing glow */}
      <Animated.View
        style={[styles.pulse, { opacity: pulseOpacity }]}
        pointerEvents="none"
      />

      {/* Timer */}
      <View style={styles.timerArea}>
        <MonoText
          bold
          size={80}
          color={C.alarm}
          style={{
            textShadowColor: 'rgba(226,75,74,0.4)',
            textShadowRadius: 20,
            textShadowOffset: { width: 0, height: 0 },
          }}
        >
          {timerStr}
        </MonoText>
        <MonoText size={10} color={C.textMuted} style={{ marginTop: 8 }}>
          still scrolling
        </MonoText>
      </View>

      {/* Done button */}
      <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
        <MonoText size={13} color={C.textSub} style={{ paddingVertical: 20 }}>
          i'm done
        </MonoText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.void,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(226,75,74,0.06)',
    alignSelf: 'center',
    top: '30%',
  },
  timerArea: { alignItems: 'center' },
  doneBtn: { position: 'absolute', bottom: 60, alignItems: 'center' },
});
