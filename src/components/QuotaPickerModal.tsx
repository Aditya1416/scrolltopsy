import { useEffect, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import MonoText from './MonoText';

interface Props {
  visible: boolean;
  appName: string;
  currentLimit: number; // minutes, 0 = none
  currentForceStop: boolean;
  onSet: (limitMins: number, forceStop: boolean) => void;
  onRemove: () => void;
  onClose: () => void;
}

const PRESETS = [
  { label: '15m', mins: 15 },
  { label: '30m', mins: 30 },
  { label: '1h',  mins: 60 },
  { label: '2h',  mins: 120 },
];

export default function QuotaPickerModal({ visible, appName, currentLimit, currentForceStop, onSet, onRemove, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { C } = useTheme();
  const { t } = useTranslation();
  const [hours, setHours] = useState(0);
  const [mins, setMins] = useState(0);
  const [forceStop, setForceStop] = useState(false);

  useEffect(() => {
    if (visible) {
      setHours(Math.floor((currentLimit || 0) / 60));
      setMins((currentLimit || 0) % 60);
      setForceStop(currentForceStop);
    }
  }, [visible, currentLimit, currentForceStop]);

  const totalMins = hours * 60 + mins;

  const bump = (fn: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fn();
  };

  const adjHours = (d: number) => bump(() => setHours(h => Math.max(0, Math.min(12, h + d))));

  const adjMins = (d: number) => bump(() => {
    const next = mins + d;
    if (next < 0) {
      if (hours > 0) { setHours(h => h - 1); setMins(55); }
    } else if (next >= 60) {
      if (hours < 12) { setHours(h => h + 1); setMins(0); }
    } else {
      setMins(next);
    }
  });

  const handlePreset = (m: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setHours(Math.floor(m / 60));
    setMins(m % 60);
  };

  const handleSet = () => {
    if (totalMins === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSet(totalMins, forceStop);
    onClose();
  };

  const handleRemove = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    onRemove();
    onClose();
  };

  const limitLabel = totalMins > 0
    ? `${hours > 0 ? `${hours}h` : ''}${mins > 0 ? `${mins}m` : ''}`
    : '—';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: C.surface, borderTopColor: C.glassBorder, paddingBottom: insets.bottom + 40 }]}>

        <View style={[styles.handle, { backgroundColor: C.textMuted }]} />

        <MonoText size={9} color={C.textSub} style={styles.title}>
          {t('quota_daily_limit', { app: appName })}
        </MonoText>

        {/* Clock display */}
        <View style={styles.clockRow}>
          {/* Hours */}
          <View style={styles.unit}>
            <TouchableOpacity onPress={() => adjHours(1)} hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}>
              <MonoText size={22} color={C.text}>+</MonoText>
            </TouchableOpacity>
            <MonoText bold size={64} color={hours > 0 ? C.text : C.separator} style={styles.digit}>
              {String(hours).padStart(2, '0')}
            </MonoText>
            <TouchableOpacity onPress={() => adjHours(-1)} hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}>
              <MonoText size={22} color={C.text}>−</MonoText>
            </TouchableOpacity>
            <MonoText size={8} color={C.textMuted} style={styles.unitLabel}>{t('quota_hours')}</MonoText>
          </View>

          <MonoText bold size={56} color={C.alarm} style={styles.colon}>:</MonoText>

          {/* Minutes */}
          <View style={styles.unit}>
            <TouchableOpacity onPress={() => adjMins(5)} hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}>
              <MonoText size={22} color={C.text}>+</MonoText>
            </TouchableOpacity>
            <MonoText bold size={64} color={mins > 0 || hours > 0 ? C.text : C.separator} style={styles.digit}>
              {String(mins).padStart(2, '0')}
            </MonoText>
            <TouchableOpacity onPress={() => adjMins(-5)} hitSlop={{ top: 16, bottom: 16, left: 24, right: 24 }}>
              <MonoText size={22} color={C.text}>−</MonoText>
            </TouchableOpacity>
            <MonoText size={8} color={C.textMuted} style={styles.unitLabel}>{t('quota_mins')}</MonoText>
          </View>
        </View>

        {/* Quick presets */}
        <View style={styles.presets}>
          {PRESETS.map(p => (
            <TouchableOpacity
              key={p.mins}
              style={[styles.preset, { borderColor: totalMins === p.mins ? C.alarm : C.glassBorder }]}
              onPress={() => handlePreset(p.mins)}
            >
              <MonoText size={11} color={totalMins === p.mins ? C.alarm : C.text}>{p.label}</MonoText>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* Force-stop toggle */}
        <TouchableOpacity
          style={styles.forceStopRow}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setForceStop(v => !v); }}
          activeOpacity={0.7}
        >
          <View style={{ flex: 1 }}>
            <MonoText size={11} color={forceStop ? C.text : C.textMuted}>{t('quota_force_stop_label')}</MonoText>
            <MonoText size={9} color={C.textMuted} style={{ marginTop: 2 }}>{t('quota_force_stop_desc')}</MonoText>
          </View>
          <View style={[styles.togglePill, { backgroundColor: forceStop ? C.alarmDim : C.surface2 }]}>
            <View style={[styles.toggleThumb, { backgroundColor: forceStop ? C.alarm : C.textMuted, alignSelf: forceStop ? 'flex-end' : 'flex-start' }]} />
          </View>
        </TouchableOpacity>

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* Set button */}
        <TouchableOpacity
          style={[styles.setBtn, totalMins === 0 && { backgroundColor: C.inputBg }]}
          onPress={handleSet}
          disabled={totalMins === 0}
        >
          <MonoText bold size={13} color={totalMins > 0 ? '#000000' : C.textMuted}>
            {t('quota_set', { limit: limitLabel })}
          </MonoText>
        </TouchableOpacity>

        {/* Remove (only if limit already set) */}
        {currentLimit > 0 && (
          <TouchableOpacity style={styles.removeBtn} onPress={handleRemove}>
            <MonoText size={11} color={C.alarm}>{t('quota_remove')}</MonoText>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
          <MonoText size={11} color={C.textSub}>{t('cancel')}</MonoText>
        </TouchableOpacity>

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)' },
  sheet: {
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 12,
    borderTopWidth: 0.5,
  },
  handle: { width: 36, height: 3, borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  title: { textAlign: 'center', marginBottom: 28, letterSpacing: 1 },
  clockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 28 },
  unit: { alignItems: 'center', width: 110 },
  digit: { lineHeight: 72, letterSpacing: -2 },
  unitLabel: { marginTop: 8, letterSpacing: 2 },
  colon: { paddingBottom: 20, paddingHorizontal: 4 },
  presets: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 28 },
  preset: {
    paddingHorizontal: 18, paddingVertical: 9,
    borderWidth: 0.5, borderRadius: 2,
  },
  divider: { height: 0.5, marginBottom: 16 },
  forceStopRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginBottom: 16 },
  togglePill: { width: 36, height: 20, borderRadius: 10, justifyContent: 'center', paddingHorizontal: 2 },
  toggleThumb: { width: 16, height: 16, borderRadius: 8 },
  setBtn: {
    backgroundColor: '#E24B4A', paddingVertical: 16,
    alignItems: 'center', borderRadius: 2, marginBottom: 12,
  },
  removeBtn: { paddingVertical: 14, alignItems: 'center', marginBottom: 2 },
  cancelBtn: { paddingVertical: 12, alignItems: 'center' },
});
