import { useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from '../theme';
import { getData } from '../lib/storage';
import { getShameMessage, getEquivalences } from '../lib/shame';
import GlassCard from '../components/GlassCard';
import MonoText from '../components/MonoText';

interface Props {
  navigation: any;
  route: { params: { durationMins: number } };
}

export default function ShameScreen({ navigation, route }: Props) {
  const { durationMins } = route.params;
  const insets = useSafeAreaInsets();
  const eq = getEquivalences(durationMins);

  const [message, setMessage] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const [data, setData] = useState<any>(null);

  const fadeHeader = useRef(new Animated.Value(0)).current;
  const scaleNumber = useRef(new Animated.Value(0.8)).current;
  const fadeNumber = useRef(new Animated.Value(0)).current;
  const fadeLabel = useRef(new Animated.Value(0)).current;
  const fadeDivider = useRef(new Animated.Value(0)).current;
  const fadeLedger = useRef(new Animated.Value(0)).current;
  const fadeNote = useRef(new Animated.Value(0)).current;
  const fadeStats = useRef(new Animated.Value(0)).current;
  const fadeScrolltype = useRef(new Animated.Value(0)).current;
  const scaleScrolltype = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    getData().then(d => {
      const { message: msg, id } = getShameMessage(durationMins, d.lastShameId, d.totalSessions);
      setMessage(msg);
      setData(d);
    });

    Animated.sequence([
      Animated.delay(200),
      Animated.timing(fadeHeader, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scaleNumber, { toValue: 1, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeNumber, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.delay(400),
      Animated.timing(fadeLabel, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(200),
      Animated.timing(fadeDivider, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(200),
      Animated.timing(fadeLedger, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(fadeNote, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(500),
      Animated.timing(fadeStats, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(fadeScrolltype, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(scaleScrolltype, { toValue: 1, friction: 7, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // Typewriter fires when message arrives and fadeNote animates in
  useEffect(() => {
    if (!message) return;
    const tid = setTimeout(() => {
      let i = 0;
      const id = setInterval(() => {
        setDisplayedText(message.slice(0, i + 1));
        i++;
        if (i >= message.length) clearInterval(id);
      }, 18);
    }, 1900);
    return () => clearTimeout(tid);
  }, [message]);

  const ledger = [
    { label: 'pages you could have read', value: String(eq.pages) },
    { label: 'steps you could have walked', value: eq.steps.toLocaleString() },
    { label: 'lines of code', value: String(eq.lines) },
    { label: 'fraction of a power nap', value: `${eq.nap}%` },
  ];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* Header */}
      <Animated.View style={{ opacity: fadeHeader, marginBottom: 32 }}>
        <MonoText size={9} color={C.textMuted}>autopsy complete</MonoText>
      </Animated.View>

      {/* Big number */}
      <Animated.View style={{ transform: [{ scale: scaleNumber }], opacity: fadeNumber, alignItems: 'center' }}>
        <MonoText
          bold size={88} color={C.alarm}
          style={{
            textShadowColor: 'rgba(226,75,74,0.5)',
            textShadowRadius: 30,
            textShadowOffset: { width: 0, height: 0 },
          }}
        >
          {String(durationMins)}
        </MonoText>
      </Animated.View>

      {/* Label */}
      <Animated.View style={{ opacity: fadeLabel, marginBottom: 24 }}>
        <MonoText size={11} color={C.textMuted}>minutes unrecoverable</MonoText>
      </Animated.View>

      {/* Divider */}
      <Animated.View style={[styles.divider, { opacity: fadeDivider }]} />

      {/* Ledger */}
      <Animated.View style={{ opacity: fadeLedger, width: '100%', marginBottom: 24, marginTop: 16 }}>
        {ledger.map((row, i) => (
          <View key={i} style={styles.ledgerRow}>
            <MonoText size={11} color={C.textMuted}>{row.label}</MonoText>
            <View style={styles.ledgerDots} />
            <MonoText size={11} color={C.textSub}>{row.value}</MonoText>
          </View>
        ))}
      </Animated.View>

      {/* Physician's note */}
      <Animated.View style={{ opacity: fadeNote, width: '100%', marginBottom: 20 }}>
        <GlassCard>
          <MonoText italic size={11} color={C.textSub} style={{ lineHeight: 18 }}>
            {displayedText}{displayedText.length < message.length ? '▊' : ''}
          </MonoText>
        </GlassCard>
      </Animated.View>

      {/* Session stats */}
      {data && (
        <Animated.View style={{ opacity: fadeStats, marginBottom: 20 }}>
          <MonoText size={10} color={C.textMuted}>
            {`today: ${data.sessions?.filter((s: any) => new Date(s.startedAt).toDateString() === new Date().toDateString()).reduce((a: number, s: any) => a + s.durationMins, 0)}m  ·  session ${data.totalSessions}  ·  total: ${data.totalMins}m`}
          </MonoText>
        </Animated.View>
      )}

      {/* Scrolltype card */}
      {data?.scrolltype ? (
        <Animated.View style={{ opacity: fadeScrolltype, transform: [{ scale: scaleScrolltype }], width: '100%', marginBottom: 32 }}>
          <GlassCard style={{ borderColor: 'rgba(226,75,74,0.3)' }}>
            <MonoText size={9} color={C.textMuted} style={{ marginBottom: 4 }}>classification</MonoText>
            <MonoText size={13} color={C.textSub}>{data.scrolltype}</MonoText>
          </GlassCard>
        </Animated.View>
      ) : null}

      {/* Footnotes */}
      <View style={styles.footnotes}>
        <TouchableOpacity onPress={() => navigation.replace('Tracking')}>
          <MonoText size={9} color={C.textMuted} style={{ opacity: 0.4 }}>go again</MonoText>
        </TouchableOpacity>
        <MonoText size={9} color={C.textMuted} style={{ opacity: 0.4 }}>  ·  </MonoText>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <MonoText size={9} color={C.textMuted} style={{ opacity: 0.4 }}>done for now</MonoText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.void },
  content: { paddingHorizontal: 24, alignItems: 'center' },
  divider: { width: '100%', height: 0.5, backgroundColor: 'rgba(255,255,255,0.08)' },
  ledgerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  ledgerDots: { flex: 1, height: 1, marginHorizontal: 8, borderStyle: 'dotted', borderBottomWidth: 1, borderColor: C.textMuted },
  footnotes: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
});
