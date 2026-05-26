import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, AppState, Dimensions, Modal, PermissionsAndroid, Platform,
  ScrollView, StatusBar, StyleSheet, TouchableOpacity, View,
} from 'react-native';
import Svg, { Circle, Path, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
import { usageStatsModule, trackingServiceModule, AppUsage, AppSession } from '../lib/nativeModules';
import { analyzeUsage, classifyScrolltype, predictRisk, getTopCategory } from '../lib/behaviorEngine';
import { loadLearnedApps } from '../lib/learnedApps';
import { quotaModule } from '../lib/quotaModule';
import { CATEGORY_LABELS } from '../lib/appCategories';
import { getShameMessage } from '../lib/shame';
import MonoText from '../components/MonoText';
import QuotaPickerModal from '../components/QuotaPickerModal';
import SettingsModal from './SettingsModal';

const CIRCUMFERENCE = 2 * Math.PI * 80;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const PIE_COLORS = ['#E24B4A', '#c8953a', '#4a8fe2', '#6caf3e', '#9b59b6', '#1abc9c'];

interface Props { navigation: any; user: any; }

interface State {
  hasPermission: boolean | null;
  stats: AppUsage[];
  totalDoomMins: number;
  byCategory: Record<string, number>;
  topApps: Array<{ packageName: string; appName: string; mins: number; category: string }>;
  scrolltype: string;
  risk: 'low' | 'medium' | 'high';
  serviceRunning: boolean;
}

interface SliceData {
  packageName: string;
  appName: string;
  mins: number;
  pct: number;
  color: string;
  startAngle: number;
  endAngle: number;
}

const RISK_COLOR: Record<string, string> = {
  low: '#666666',
  medium: '#c8953a',
  high: C.alarm,
};

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, innerR: number, sa: number, ea: number): string {
  const span = ea - sa;
  if (span >= 359.99) {
    const mid = sa + 0.01;
    const p1 = polar(cx, cy, r, sa);
    const p2 = polar(cx, cy, r, mid);
    const p3 = polar(cx, cy, innerR, mid);
    const p4 = polar(cx, cy, innerR, sa);
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 1 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${innerR} ${innerR} 0 1 0 ${p4.x} ${p4.y} Z`;
  }
  const largeArc = span > 180 ? 1 : 0;
  const p1 = polar(cx, cy, r, sa);
  const p2 = polar(cx, cy, r, ea);
  const p3 = polar(cx, cy, innerR, ea);
  const p4 = polar(cx, cy, innerR, sa);
  return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${largeArc} 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${p4.x} ${p4.y} Z`;
}

function buildSlices(topApps: Array<{ packageName: string; appName: string; mins: number }>): SliceData[] {
  const relevant = topApps.slice(0, 6);
  const total = relevant.reduce((s, a) => s + a.mins, 0);
  if (total === 0) return [];
  let angle = 0;
  return relevant.map((app, i) => {
    const pct = app.mins / total;
    const span = pct * 360;
    const sa = angle;
    const ea = angle + span;
    angle = ea;
    return { packageName: app.packageName, appName: app.appName, mins: app.mins, pct, color: PIE_COLORS[i % PIE_COLORS.length], startAngle: sa, endAngle: ea };
  });
}

function formatSessionTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export default function HomeScreen({ navigation, user }: Props) {
  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);
  const [quotas, setQuotas] = useState<Record<string, number>>({});
  const [quotaPicker, setQuotaPicker] = useState<{ packageName: string; appName: string } | null>(null);
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

  const [pieFlipped, setPieFlipped] = useState(false);
  const [selectedSlice, setSelectedSlice] = useState<SliceData | null>(null);
  const [sliceSessions, setSliceSessions] = useState<AppSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

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

      const [stats, running, q] = await Promise.all([
        usageStatsModule.getUsageStats(1),
        trackingServiceModule.isRunning(),
        quotaModule.getAllQuotas(),
      ]);

      const { totalDoomMins, byCategory, topApps } = analyzeUsage(stats);
      const topCat = getTopCategory(byCategory);
      const hour = new Date().getHours();
      const scrolltype = classifyScrolltype(totalDoomMins, hour, topCat);
      const risk = predictRisk(totalDoomMins);

      setState({ hasPermission: true, stats, totalDoomMins, byCategory, topApps, scrolltype, risk, serviceRunning: running });
      setQuotas(q);

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

  const slices = useMemo(() => buildSlices(state.topApps), [state.topApps]);

  const frontOpacity = flipAnim.interpolate({ inputRange: [0.45, 0.55], outputRange: [1, 0] });
  const backOpacity = flipAnim.interpolate({ inputRange: [0.45, 0.55], outputRange: [0, 1] });
  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });

  const handleArcPress = () => {
    if (slices.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const toValue = pieFlipped ? 0 : 1;
    Animated.spring(flipAnim, { toValue, useNativeDriver: true, friction: 7, tension: 60 }).start();
    setPieFlipped(v => !v);
  };

  const handleSlicePress = async (slice: SliceData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedSlice(slice);
    setLoadingSessions(true);
    setSliceSessions([]);
    try {
      const sessions = await usageStatsModule.getAppSessions(slice.packageName, 1);
      setSliceSessions(sessions);
    } catch {
      setSliceSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleToggleService = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (state.serviceRunning) {
      await trackingServiceModule.stop();
    } else {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        await PermissionsAndroid.request('android.permission.POST_NOTIFICATIONS');
      }
      await trackingServiceModule.start();
    }
    const running = await trackingServiceModule.isRunning();
    setState(s => ({ ...s, serviceRunning: running }));
  };

  const handleSetQuota = (packageName: string, appName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setQuotaPicker({ packageName, appName });
  };

  const handleQuotaSet = async (limitMins: number) => {
    if (!quotaPicker) return;
    await quotaModule.setQuota(quotaPicker.packageName, limitMins);
    setQuotas(q => ({ ...q, [quotaPicker.packageName]: limitMins }));
  };

  const handleQuotaRemove = async () => {
    if (!quotaPicker) return;
    await quotaModule.clearQuota(quotaPicker.packageName);
    setQuotas(q => { const n = { ...q }; delete n[quotaPicker.packageName]; return n; });
  };

  const handleRequestPermission = () => {
    usageStatsModule.requestPermission();
  };

  const hour = new Date().getHours();
  const timeLabel = hour < 6 ? 'still up' : hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : hour < 22 ? 'evening' : 'still up';
  const firstName = user?.displayName?.split(' ')[0]?.toLowerCase() ?? '';

  const sliceQuota = selectedSlice ? (quotas[selectedSlice.packageName] ?? 0) : 0;
  const sliceIsOver = sliceQuota > 0 && (selectedSlice?.mins ?? 0) > sliceQuota;
  const sliceOverMins = sliceIsOver ? (selectedSlice!.mins - sliceQuota) : 0;
  const shameMsg = sliceIsOver ? getShameMessage(sliceOverMins, '', sliceSessions.length).message : null;

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
            {Platform.OS === 'ios' ? (
              <>
                <MonoText bold size={13} color={C.alarm} style={{ marginBottom: 8 }}>ios detected</MonoText>
                <MonoText size={11} color={C.textSub} style={{ lineHeight: 20 }}>
                  background tracking and auto usage stats{'\n'}are android-only features.{'\n\n'}
                  you can still track sessions manually{'\n'}using the button below.
                </MonoText>
              </>
            ) : (
              <>
                <MonoText bold size={13} color={C.alarm} style={{ marginBottom: 8 }}>usage permission needed</MonoText>
                <MonoText size={11} color={C.textSub} style={{ lineHeight: 20, marginBottom: 16 }}>
                  scrolltopsy needs access to usage stats{'\n'}to automatically track your doomscrolling.{'\n'}no manual input required.
                </MonoText>
                <TouchableOpacity style={styles.permBtn} onPress={handleRequestPermission}>
                  <MonoText bold size={12} color="#000">grant access →</MonoText>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : (
          <>
            <View style={styles.arcCard}>
              {/* 3D flip container */}
              <View style={styles.flipContainer}>
                {/* FRONT — arc progress */}
                <Animated.View style={[
                  styles.arcFace,
                  { transform: [{ perspective: 800 }, { rotateY: frontRotate }], opacity: frontOpacity },
                ]}>
                  <TouchableOpacity onPress={handleArcPress} activeOpacity={slices.length > 0 ? 0.85 : 1}>
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
                      {slices.length > 0 && (
                        <MonoText size={8} color="rgba(255,255,255,0.18)" style={{ marginTop: 6 }}>tap for breakdown</MonoText>
                      )}
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                {/* BACK — pie chart */}
                <Animated.View style={[
                  styles.arcFace,
                  { transform: [{ perspective: 800 }, { rotateY: backRotate }], opacity: backOpacity },
                ]}>
                  <Svg width={200} height={200} viewBox="0 0 200 200">
                    {slices.map(slice => (
                      <Path
                        key={slice.packageName}
                        d={slicePath(100, 100, 78, 34, slice.startAngle, slice.endAngle)}
                        fill={slice.color}
                        onPress={() => handleSlicePress(slice)}
                      />
                    ))}
                    {/* donut hole — tap to flip back */}
                    <Circle cx="100" cy="100" r="34" fill="#000" onPress={handleArcPress} />
                    <SvgText
                      x="100" y="106"
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.35)"
                      fontSize="18"
                      onPress={handleArcPress}
                    >↩</SvgText>
                  </Svg>
                </Animated.View>
              </View>

              {/* Legend (shown when flipped) */}
              {pieFlipped && slices.length > 0 && (
                <View style={styles.legend}>
                  {slices.map(slice => (
                    <TouchableOpacity key={slice.packageName} onPress={() => handleSlicePress(slice)} style={styles.legendItem}>
                      <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                      <MonoText size={9} color={C.textSub} style={{ flex: 1 }}>{slice.appName}</MonoText>
                      <MonoText size={9} color={slice.color} style={{ marginLeft: 6 }}>{Math.round(slice.pct * 100)}%</MonoText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

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
                <MonoText size={9} color={C.textMuted} style={{ marginBottom: 10 }}>
                  top offenders today  <MonoText size={8} color='#444444'>· tap to set limit</MonoText>
                </MonoText>
                {state.topApps.map((app, i) => {
                  const quota = quotas[app.packageName] || 0;
                  const isOver = quota > 0 && app.mins > quota;
                  const overMins = isOver ? app.mins - quota : 0;
                  return (
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
                      <TouchableOpacity
                        style={styles.appLeft}
                        onPress={() => handleSetQuota(app.packageName, app.appName)}
                        activeOpacity={0.6}
                      >
                        <MonoText size={11} color={isOver ? C.alarm : C.text}>{app.appName}</MonoText>
                        <View style={[styles.catBadge, app.category === 'social' || app.category === 'entertainment' ? styles.catBadgeRed : {}]}>
                          <MonoText size={8} color={C.textMuted}>{CATEGORY_LABELS[app.category as keyof typeof CATEGORY_LABELS] ?? app.category}</MonoText>
                        </View>
                        {quota > 0 && (
                          <View style={[styles.quotaBadge, isOver ? styles.quotaBadgeOver : {}]}>
                            <MonoText size={8} color={isOver ? C.alarm : '#888888'}>
                              {isOver ? `+${overMins}m` : `≤${quota}m`}
                            </MonoText>
                          </View>
                        )}
                      </TouchableOpacity>
                      <MonoText size={11} color={isOver ? C.alarm : app.mins > 60 ? '#c8953a' : '#aaaaaa'}>{`${app.mins}m`}</MonoText>
                    </Animated.View>
                  );
                })}
              </View>
            )}

            {Object.keys(state.byCategory).length > 0 && (
              <View style={styles.catBreakdown}>
                <MonoText size={9} color={C.textMuted} style={{ marginBottom: 10 }}>by category</MonoText>
                {Object.entries(state.byCategory)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, mins]) => (
                    <View key={cat} style={styles.catRow}>
                      <MonoText size={10} color='#888888'>{CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS] ?? cat}</MonoText>
                      <View style={styles.catBarTrack}>
                        <View style={[styles.catBarFill, { width: `${Math.min((mins / Math.max(state.totalDoomMins, 1)) * 100, 100)}%` }]} />
                      </View>
                      <MonoText size={10} color='#888888' style={{ width: 36, textAlign: 'right' }}>{`${mins}m`}</MonoText>
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
          <MonoText size={12} color={state.serviceRunning ? C.alarm : '#aaaaaa'}>
            {state.serviceRunning ? '● tracking active — tap to stop' : '○ start background tracking'}
          </MonoText>
        </TouchableOpacity>
      </View>

      {/* Slice detail modal */}
      <Modal
        visible={selectedSlice !== null}
        animationType="slide"
        transparent
        presentationStyle="overFullScreen"
        onRequestClose={() => setSelectedSlice(null)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedSlice(null)} />
        <View style={[styles.slicePanel, { paddingBottom: insets.bottom + 24 }]}>
          <View style={styles.panelHandle} />

          {selectedSlice && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.sliceHeader}>
                <View style={[styles.sliceHeaderDot, { backgroundColor: selectedSlice.color }]} />
                <MonoText bold size={15} color={C.text}>{selectedSlice.appName}</MonoText>
              </View>
              <MonoText size={11} color={C.textSub} style={{ marginBottom: 4 }}>
                {selectedSlice.mins}m today  ·  {Math.round(selectedSlice.pct * 100)}% of doom time
              </MonoText>
              {sliceQuota > 0 && (
                <MonoText size={10} color={sliceIsOver ? C.alarm : '#888888'} style={{ marginBottom: 16 }}>
                  {sliceIsOver ? `limit: ${sliceQuota}m  ·  +${sliceOverMins}m over` : `limit: ${sliceQuota}m  ·  within quota`}
                </MonoText>
              )}

              {/* Shame message */}
              {shameMsg && (
                <View style={styles.shameBox}>
                  <MonoText size={10} color={C.alarm} style={{ lineHeight: 18 }}>{shameMsg}</MonoText>
                </View>
              )}

              {/* Sessions */}
              <MonoText size={9} color={C.textMuted} style={{ marginTop: 16, marginBottom: 8 }}>
                {loadingSessions ? 'loading sessions…' : `sessions today (${sliceSessions.length})`}
              </MonoText>

              {!loadingSessions && sliceSessions.length === 0 && (
                <MonoText size={10} color={C.textMuted}>no sessions recorded.</MonoText>
              )}

              {sliceSessions.map((session, i) => {
                const durationMins = Math.max(1, Math.ceil(session.durationMs / 60_000));
                return (
                  <View key={i} style={styles.sessionRow}>
                    <MonoText size={11} color={C.textSub}>
                      {formatSessionTime(session.startTime)} → {formatSessionTime(session.endTime)}
                    </MonoText>
                    <MonoText size={11} color={durationMins >= 30 ? C.alarm : durationMins >= 10 ? '#c8953a' : '#888888'}>
                      {durationMins}m
                    </MonoText>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      </Modal>

      <SettingsModal
        visible={showSettings}
        onClose={() => { setShowSettings(false); load(); }}
        user={user}
      />

      <QuotaPickerModal
        visible={quotaPicker !== null}
        appName={quotaPicker?.appName ?? ''}
        currentLimit={quotaPicker ? (quotas[quotaPicker.packageName] || 0) : 0}
        onSet={handleQuotaSet}
        onRemove={handleQuotaRemove}
        onClose={() => setQuotaPicker(null)}
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
  flipContainer: { width: 200, height: 200 },
  arcFace: {
    position: 'absolute',
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
  },
  arcCenter: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: { width: '100%', marginTop: 12, paddingHorizontal: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  riskRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  topAppsSection: { width: '100%', marginTop: 16 },
  appRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  appLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  catBadge: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.04)' },
  catBadgeRed: { backgroundColor: 'rgba(226,75,74,0.08)' },
  quotaBadge: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.04)' },
  quotaBadgeOver: { backgroundColor: 'rgba(226,75,74,0.12)' },
  catBreakdown: { width: '100%', marginTop: 24 },
  catRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  catBarTrack: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 10, overflow: 'hidden' },
  catBarFill: { height: '100%', backgroundColor: C.alarm },
  bottomArea: { alignItems: 'center', paddingHorizontal: 24 },
  ctaDivider: { width: '100%', height: 0.5, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 4 },
  sessionBtn: { paddingVertical: 14, alignItems: 'center' },
  serviceBtn: { paddingVertical: 12, alignItems: 'center' },
  // Slice detail modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  slicePanel: {
    backgroundColor: '#0a0a0a',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
    maxHeight: '65%',
  },
  panelHandle: {
    width: 32, height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sliceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  sliceHeaderDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  shameBox: {
    marginTop: 8,
    padding: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(226,75,74,0.25)',
    borderRadius: 4,
    backgroundColor: 'rgba(226,75,74,0.04)',
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
});
