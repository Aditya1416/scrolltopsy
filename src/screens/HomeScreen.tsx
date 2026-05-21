import { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, StatusBar, ScrollView,
} from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect, Circle as SvgDot } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from '../theme';
import { getData, getTodayMins, getTodaySessions, StorageData, Session } from '../lib/storage';
import MonoText from '../components/MonoText';
import SettingsModal from './SettingsModal';

const { width } = Dimensions.get('window');
const CIRCUMFERENCE = 2 * Math.PI * 80;

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  navigation: any;
  user: any;
}

export default function HomeScreen({ navigation, user }: Props) {
  const insets = useSafeAreaInsets();
  const [todayMins, setTodayMins] = useState(0);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [data, setData] = useState<StorageData | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const arcAnim = useRef(new Animated.Value(CIRCUMFERENCE)).current;
  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const badgeAnim = useRef(new Animated.Value(0)).current;
  const sessionAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  const load = useCallback(async () => {
    const [mins, todaySess, d] = await Promise.all([
      getTodayMins(),
      getTodaySessions(),
      getData(),
    ]);
    setTodayMins(mins);
    setSessions(todaySess.slice(0, 3));
    setData(d);

    const progress = Math.min(mins / 60, 1);
    const target = CIRCUMFERENCE - progress * CIRCUMFERENCE;

    setTimeout(() => {
      Animated.timing(arcAnim, {
        toValue: target,
        duration: 1200,
        useNativeDriver: false,
      }).start();
      Animated.timing(greetingOpacity, {
        toValue: 1, duration: 400, delay: 300, useNativeDriver: true,
      }).start();
      if (d.scrolltype) {
        Animated.timing(badgeAnim, {
          toValue: 1, duration: 500, delay: 800, useNativeDriver: true,
        }).start();
      }
      sessionAnims.forEach((anim, i) => {
        Animated.timing(anim, {
          toValue: 1, duration: 300, delay: 500 + i * 80, useNativeDriver: true,
        }).start();
      });
    }, 100);
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', load);
    return unsubscribe;
  }, [navigation, load]);

  const hour = new Date().getHours();
  const timeOfDay = hour < 6 ? 'still up' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 22 ? 'evening' : 'still up';
  const firstName = user?.displayName?.split(' ')[0]?.toLowerCase() || '';

  const handleStartTracking = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('Tracking');
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Dot grid background */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        <Svg width={width} height="100%" style={StyleSheet.absoluteFillObject}>
          <Defs>
            <Pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
              <SvgDot cx="1" cy="1" r="0.8" fill="rgba(255,255,255,0.06)" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#dots)" />
        </Svg>
      </View>

      {/* Top bar */}
      <View style={styles.topBar}>
        <MonoText size={9} color={C.textSub}>
          {`SCR-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}${String(new Date().getDate()).padStart(2,'0')}`}
        </MonoText>
        <TouchableOpacity onPress={() => setShowSettings(true)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={{ color: C.textSub, fontSize: 16 }}>⚙</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        {firstName ? (
          <Animated.View style={{ opacity: greetingOpacity, marginBottom: 8 }}>
            <MonoText italic size={13} color={C.textSub}>
              {`good ${timeOfDay}, ${firstName}.`}
            </MonoText>
          </Animated.View>
        ) : null}

        {/* Arc ring */}
        <View style={styles.arcWrapper}>
          <Svg width={200} height={200} viewBox="0 0 200 200">
            <Circle cx="100" cy="100" r="80" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
            <AnimatedCircle
              cx="100" cy="100" r="80"
              fill="none"
              stroke={C.alarm}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={arcAnim}
              rotation="-90"
              origin="100, 100"
            />
          </Svg>
          <View style={styles.arcCenter}>
            <MonoText bold size={36} color={C.alarm}>{String(todayMins)}</MonoText>
            <MonoText size={9} color={C.textMuted} style={{ marginTop: 2 }}>min wasted today</MonoText>
          </View>
        </View>

        {/* Scrolltype badge */}
        {data?.scrolltype ? (
          <Animated.View style={{ opacity: badgeAnim, alignSelf: 'center', marginBottom: 20 }}>
            <View style={styles.badge}>
              <MonoText size={10} color={C.textSub}>{`classification: ${data.scrolltype}`}</MonoText>
            </View>
          </Animated.View>
        ) : null}

        {/* Session log */}
        {sessions.length > 0 && (
          <View style={styles.sessionLog}>
            {sessions.map((s, i) => (
              <Animated.View
                key={s.id}
                style={[
                  styles.sessionRow,
                  {
                    opacity: sessionAnims[i],
                    transform: [{ translateY: sessionAnims[i].interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
                  },
                ]}
              >
                <MonoText size={11} color={C.textSub}>
                  {formatTime(s.startedAt - s.durationMins * 60000)} — {formatTime(s.startedAt)}
                </MonoText>
                <MonoText size={11} color={C.textSub}>{`${s.durationMins}m`}</MonoText>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* CTA */}
      <View style={[styles.ctaArea, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.ctaDivider} />
        <TouchableOpacity onPress={handleStartTracking}>
          <MonoText size={13} color={C.textSub} style={{ paddingVertical: 16 }}>
            i'm about to doomscroll
          </MonoText>
        </TouchableOpacity>
      </View>

      <SettingsModal
        visible={showSettings}
        onClose={() => { setShowSettings(false); load(); }}
        user={user}
      />
    </View>
  );
}

// Animated SVG circle workaround
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.void },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  scroll: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 20 },
  arcWrapper: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  arcCenter: { position: 'absolute', alignItems: 'center' },
  badge: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(226,75,74,0.3)',
    backgroundColor: 'rgba(226,75,74,0.05)',
  },
  sessionLog: { width: '100%', marginTop: 8 },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  ctaArea: { alignItems: 'center', paddingHorizontal: 24 },
  ctaDivider: { width: '100%', height: 0.5, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 4 },
});
