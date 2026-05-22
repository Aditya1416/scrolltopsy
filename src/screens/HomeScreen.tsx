import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, AppState, Dimensions, ScrollView, StatusBar,
  StyleSheet, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Defs, Pattern, Rect, Circle as SvgDot } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import { usageStatsModule, trackingServiceModule, AppUsage } from '../lib/nativeModules';
import { analyzeUsage, classifyScrolltype, predictRisk, getTopCategory } from '../lib/behaviorEngine';
import { loadLearnedApps } from '../lib/learnedApps';
import { CATEGORY_LABELS } from '../lib/appCategories';
import MonoText from '../components/MonoText';
import SettingsModal from './SettingsModal';

const { width } = Dimensions.get('window');
const CIRCUMFERENCE = 2 * Math.PI * 80;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props { navigation: any; user: any; }

interface State {
  hasPermission: boolean | null;
  stats: AppUsage[];
  totalDoomMins: number;
  byCategory: Record<string, number>;
  topApps: Array<{ appName: string; mins: number; category: string }>;
  scrolltype: string;
  risk: 'low' | 'medium' | 'high';
  serviceRunning: boolean;
}

const RISK_COLOR: Record<string, string> = {
  low: C.textSub,
  medium: '#c8953a',
  high: C.alarm,
};

export default function HomeScreen({ navigation, user }: Props) {
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);
  const [state, setState] = useState<State>({
    hasPermission: null,
    stats: [],
    totalDoomMins: 0,
    byCategory: {},
    topApps: [],
    scrolltype: '',
    risk: 'low',
    serviceRunning: false,
  });

  const arcAnim = useRef(new Animated.Value(CIRCUMFERENCE)).current;
  const greetingOpacity = useRef(new Animated.Value(0)).current;
  const listAnims = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(0))).current;

  const load = useCallback(async () => {
    try {
      const perm = await usageStatsModule.hasPermission();
      if (!perm) {
        setState(s => ({ ...s, hasPermission: false }));
        return;
      }

      const [stats, running] = await Promise.all([
        usageStatsModule.getUsageStats(1),
        trackingServiceModule.isRunning(),
      ]);

      const { totalDoomMins, byCategory, topApps } = analyzeUsage(stats);
      const topCat = getTopCategory(byCategory);
      const hour = new Date().getHours();
      const scrolltype = classifyScrolltype(totalDoomMins, hour, topCat);
      const risk = predictRisk(totalDoomMins);

      setState({ hasPermission: true, stats, totalDoomMins, byCategory, topApps, scrolltype, risk, serviceRunning: running });

      const progress = Math.min(totalDoomMins / 120, 1);
      Animated.timing(arcAnim, {
        toValue: CIRCUMFERENCE - progress * CIRCUMFERENCE,
        duration: 1200,
        useNativeDriver: false,
      }).start();
      Animated.timing(greetingOpacity, { toValue: 1, duration: 400, delay: 200, useNativeDriver: true }).start();
      listAnims.forEach((anim, i) => {
        Animated.timing(anim, { toValue: 1, duration: 280, delay: 400 + i * 70, useNativeDriver: true }).start();
      });
    } catch (e) {
      setState(s => ({ ...s, hasPermission: false }));
    }
  }, []);

  useEffect(() => { loadLearnedApps().then(load); }, []);

  useEffect(() => {
    const navUnsub = navigation.addListener('focus', load);
    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next === 'active') load();
    });
    return () => { navUnsub(); appStateSub.remove(); };
  }, [navigation, load]);

  const handleToggleService = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (state.serviceRunning) {
      await trackingServiceModule.stop();
    } else {
      await trackingServiceModule.start();
    }
    const running = await trackingServiceModule.isRunning();
    setState(s => ({ ...s, serviceRunning: running }));
  };

  const handleRequestPermission = () => {
    usageStatsModule.requestPermission();
  };

  const hour = new Date().getHours();
  const timeLabel = hour < 6 ? 'still up' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 22 ? 'evening' : 'still up';
  const firstName = user?.displayName?.split(' ')[0]?.toLowerCase() ?? '';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" translucent />

      <View style={styles.topBar}>
        <MonoText size={9} color={C.textSub}>
          {`SCR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`}
        </MonoText>
        <TouchableOpacity onPress={() => setShowSettings(true)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <MonoText size={16} color={C.textSub}>⚙</MonoText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {firstName ? (
          <Animated.View style={{ opacity: greetingOpacity, marginBottom: 8 }}>
            <MonoText italic size={13} color={C.textSub}>{`good ${timeLabel}, ${firstName}.`}</MonoText>
          </Animated.View>
        ) : null}

        {state.hasPermission === false ? (
          <View style={styles.permBox}>
            <MonoText bold size={13} color={C.alarm} style={{ marginBottom: 8 }}>usage permission needed</MonoText>
            <MonoText size={11} color={C.textSub} style={{ lineHeight: 20, marginBottom: 16 }}>
              scrolltopsy needs access to usage stats{'\n'}to automatically track your doomscrolling.{'\n'}no manual input required.
            </MonoText>
            <TouchableOpacity style={styles.permBtn} onPress={handleRequestPermission}>
              <MonoText bold size={12} color="#000">grant access →</MonoText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.arcCard}>
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
                  <MonoText bold size={36} color={C.alarm}>{String(state.totalDoomMins)}</MonoText>
                  <MonoText size={9} color={C.textMuted} style={{ marginTop: 2 }}>doom mins today</MonoText>
                </View>
              </View>

              <View style={styles.riskRow}>
                <MonoText size={9} color={C.textMuted}>risk:</MonoText>
                <MonoText size={9} color={RISK_COLOR[state.risk]} style={{ marginLeft: 6 }}>{state.risk}</MonoText>
                {state.scrolltype ? (
                  <MonoText size={9} color={C.textMuted} style={{ marginLeft: 12 }}>· {state.scrolltype}</MonoText>
                ) : null}
              </View>
            </View>

            {state.topApps.length > 0 && (
              <View style={styles.topAppsSection}>
                <MonoText size={9} color={C.textMuted} style={{ marginBottom: 10 }}>top offenders today</MonoText>
                {state.topApps.map((app, i) => (
                  <Animated.View
                    key={`${app.appName}-${i}`}
                    style={[
                      styles.appRow,
                      {
                        opacity: listAnims[i],
                        transform: [{ translateX: listAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-12, 0] }) }],
                      },
                    ]}
                  >
                    <View style={styles.appLeft}>
                      <MonoText size={11} color={C.text}>{app.appName}</MonoText>
                      <View style={[styles.catBadge, app.category === 'social' || app.category === 'entertainment' ? styles.catBadgeRed : {}]}>
                        <MonoText size={8} color={C.textMuted}>{CATEGORY_LABELS[app.category as keyof typeof CATEGORY_LABELS] ?? app.category}</MonoText>
                      </View>
                    </View>
                    <MonoText size={11} color={app.mins > 60 ? C.alarm : C.textSub}>{`${app.mins}m`}</MonoText>
                  </Animated.View>
                ))}
              </View>
            )}

            {Object.keys(state.byCategory).length > 0 && (
              <View style={styles.catBreakdown}>
                <MonoText size={9} color={C.textMuted} style={{ marginBottom: 10 }}>by category</MonoText>
                {Object.entries(state.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, mins]) => (
                    <View key={cat} style={styles.catRow}>
                      <MonoText size={10} color={C.textSub}>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}</MonoText>
                      <View style={styles.catBarTrack}>
                        <View style={[styles.catBarFill, { width: `${Math.min((mins / Math.max(state.totalDoomMins, 1)) * 100, 100)}%` }]} />
                      </View>
                      <MonoText size={10} color={C.textSub} style={{ width: 36, textAlign: 'right' }}>{`${mins}m`}</MonoText>
                    </View>
                  ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View style={[styles.bottomArea, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.ctaDivider} />
        <TouchableOpacity style={styles.sessionBtn} onPress={() => navigation.navigate('Tracking')}>
          <MonoText size={12} color={C.alarm}>→ track a session</MonoText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.serviceBtn} onPress={handleToggleService} disabled={state.hasPermission === false}>
          <MonoText size={12} color={state.serviceRunning ? C.alarm : C.textSub}>
            {state.serviceRunning ? '● tracking active — tap to stop' : '○ start background tracking'}
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  scrollView: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12 },
  scroll: { alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24 },
  permBox: { width: '100%', marginTop: 40, padding: 20, borderWidth: 0.5, borderColor: 'rgba(226,75,74,0.3)', borderRadius: 4 },
  permBtn: { backgroundColor: C.alarm, paddingVertical: 14, alignItems: 'center', borderRadius: 2 },
  arcCard: { width: '100%', alignItems: 'center', marginBottom: 8, paddingVertical: 8 },
  arcWrapper: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  arcCenter: { position: 'absolute', alignItems: 'center' },
  riskRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  topAppsSection: { width: '100%', marginTop: 16 },
  appRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  appLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  catBadge: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.04)' },
  catBadgeRed: { backgroundColor: 'rgba(226,75,74,0.08)' },
  catBreakdown: { width: '100%', marginTop: 24 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  catBarTrack: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 10, overflow: 'hidden' },
  catBarFill: { height: '100%', backgroundColor: C.alarm },
  bottomArea: { alignItems: 'center', paddingHorizontal: 24 },
  ctaDivider: { width: '100%', height: 0.5, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 4 },
  sessionBtn: { paddingVertical: 14, alignItems: 'center' },
  serviceBtn: { paddingVertical: 12, alignItems: 'center' },
});
