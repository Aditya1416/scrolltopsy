import { useState } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  ScrollView, Alert, Share,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { signInWithGoogle, signOut, deleteAccount, acceptPrivacy } from '../lib/auth';
import { syncToFirestore } from '../lib/sync';
import { deleteAllData, getData } from '../lib/storage';
import { LANGUAGES, setLanguage } from '../i18n';
import MonoText from '../components/MonoText';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import AccountModal from './AccountModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  user: any;
}

const PERIODS = [
  { key: 'today', label: 'today' },
  { key: 'week',  label: 'week' },
  { key: 'month', label: 'month' },
  { key: 'year',  label: 'year' },
] as const;
type Period = typeof PERIODS[number]['key'];

function filterByPeriod(sessions: any[], period: Period) {
  const now = new Date();
  return sessions.filter(s => {
    const d = new Date(s.startedAt);
    if (period === 'today') return d.toDateString() === now.toDateString();
    if (period === 'week') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    if (period === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (period === 'year') return d.getFullYear() === now.getFullYear();
    return true;
  });
}

function formatDuration(mins: number) {
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function SettingsModal({ visible, onClose, user }: Props) {
  const insets = useSafeAreaInsets();
  const { C, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [backupStatus, setBackupStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [sharePeriod, setSharePeriod] = useState<Period>('week');
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showAccount, setShowAccount] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      if (result?.requiresConsent) await acceptPrivacy(result.user);
      onClose();
    } catch (e: any) {
      Alert.alert(t('login_sign_in_failed'), e.message || 'unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await syncToFirestore(user.uid);
      setBackupStatus(t('settings_backed_up'));
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (e: any) {
      setBackupStatus(e.message || t('settings_backup_failed'));
      setTimeout(() => setBackupStatus(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleShareStats = async () => {
    try {
      const data = await getData();
      const filtered = filterByPeriod(data.sessions ?? [], sharePeriod);
      const totalMins = filtered.reduce((s: number, sess: any) => s + sess.durationMins, 0);
      const count = filtered.length;
      const longest = filtered.reduce((m: number, sess: any) => Math.max(m, sess.durationMins), 0);
      const periodLabel = PERIODS.find(p => p.key === sharePeriod)?.label ?? sharePeriod;

      const days = sharePeriod === 'today' ? 1 : sharePeriod === 'week' ? 7 : sharePeriod === 'month' ? 30 : 365;
      const dailyAvg = days > 1 ? Math.round(totalMins / days) : totalMins;

      const text =
        `scrolltopsy · ${periodLabel} report\n` +
        `${'─'.repeat(28)}\n` +
        `sessions:       ${count}\n` +
        `total time:     ${formatDuration(totalMins)}\n` +
        (days > 1 ? `daily avg:      ${formatDuration(dailyAvg)}\n` : '') +
        (longest > 0 ? `longest:        ${formatDuration(longest)}\n` : '') +
        (data.scrolltype ? `type:           ${data.scrolltype}\n` : '') +
        `${'─'.repeat(28)}\n` +
        `#scrolltopsy #screentime #digitalwellness`;

      await Share.share({ message: text });
    } catch {/* dismissed */ }
  };

  const handleDelete = () => {
    Alert.alert(
      t('settings_delete_confirm'),
      t('settings_delete_body'),
      [
        { text: t('settings_delete_cancel'), style: 'cancel' },
        {
          text: t('settings_delete_btn'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllData();
              if (user) await deleteAccount(user.uid);
              onClose();
            } catch (e: any) {
              Alert.alert('error', e.message);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
        <View style={[styles.panel, { backgroundColor: C.surface, borderTopColor: C.glassBorder, paddingBottom: insets.bottom + 24 }]}>
          <View style={[styles.handle, { backgroundColor: C.glassBorder }]} />
          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Account / Profile */}
            {user ? (
              <>
                <TouchableOpacity onPress={() => setShowAccount(true)} style={styles.accountRow}>
                  <View style={[styles.avatarSmall, { borderColor: C.alarm }]}>
                    <MonoText bold size={13} color={C.alarm}>
                      {(user.displayName?.split(' ').map((w: string) => w[0]).join('').toUpperCase() ?? 'U').slice(0, 2)}
                    </MonoText>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <MonoText size={12} color={C.textSub}>
                      {user.displayName?.split(' ')[0]?.toLowerCase() ?? t('settings_signed_in')}
                    </MonoText>
                    <MonoText size={9} color={C.textMuted}>
                      {user.email?.replace(/(.{2}).*(@.*)/, '$1…$2') ?? ''}
                    </MonoText>
                  </View>
                  <MonoText size={10} color={user?.emailVerified ? '#1D9E75' : C.alarm}>
                    {user?.emailVerified ? t('settings_verified') : t('settings_not_verified')}
                  </MonoText>
                </TouchableOpacity>

                <Row label={t('settings_backup')} onPress={handleBackup} loading={loading} C={C} />
                {backupStatus ? <MonoText size={10} color={C.textSub} style={styles.statusText}>{backupStatus}</MonoText> : null}

                {/* Share analytics */}
                <View style={[styles.analyticsBlock, { borderBottomColor: C.separator }]}>
                  <MonoText size={13} color={C.textSub} style={{ marginBottom: 10 }}>share progress</MonoText>
                  <View style={styles.periodRow}>
                    {PERIODS.map(p => (
                      <TouchableOpacity
                        key={p.key}
                        style={[styles.periodChip, { borderColor: sharePeriod === p.key ? C.alarm : C.separator }]}
                        onPress={() => setSharePeriod(p.key)}
                      >
                        <MonoText size={9} color={sharePeriod === p.key ? C.alarm : C.textMuted}>{p.label}</MonoText>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TouchableOpacity style={[styles.shareBtn, { backgroundColor: C.alarmDim }]} onPress={handleShareStats}>
                    <MonoText size={11} color={C.alarm}>share stats →</MonoText>
                  </TouchableOpacity>
                </View>

                <Row label={t('settings_sign_out')} onPress={handleSignOut} C={C} />
                <Row label={t('settings_delete')} onPress={handleDelete} danger C={C} />
              </>
            ) : (
              <Row label={loading ? t('login_signing_in') : t('login_sign_in')} onPress={handleSignIn} loading={loading} C={C} />
            )}

            <View style={[styles.divider, { backgroundColor: C.separator }]} />

            {/* Light / dark toggle */}
            <TouchableOpacity style={[styles.themeRow, { borderBottomColor: C.separator }]} onPress={toggleTheme}>
              <MonoText size={13} color={C.textSub} style={{ flex: 1 }}>
                {isDark ? t('settings_light_mode') : t('settings_dark_mode')}
              </MonoText>
              <MonoText size={11} color={C.textMuted}>{isDark ? '○' : '●'}</MonoText>
            </TouchableOpacity>

            {/* Language selector */}
            <TouchableOpacity style={[styles.themeRow, { borderBottomColor: C.separator }]} onPress={() => setShowLangPicker(v => !v)}>
              <MonoText size={13} color={C.textSub} style={{ flex: 1 }}>{t('settings_language')}</MonoText>
              <MonoText size={11} color={C.textMuted}>{LANGUAGES.find(l => l.code === i18n.language)?.label ?? 'English'}</MonoText>
            </TouchableOpacity>
            {showLangPicker && (
              <View style={styles.langList}>
                {LANGUAGES.map(lang => (
                  <TouchableOpacity
                    key={lang.code}
                    style={styles.langRow}
                    onPress={() => { setLanguage(lang.code); setShowLangPicker(false); }}
                  >
                    <MonoText size={11} color={i18n.language === lang.code ? C.alarm : C.textSub}>{lang.label}</MonoText>
                    {i18n.language === lang.code && <MonoText size={10} color={C.alarm}>●</MonoText>}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: C.separator }]} />
            <TouchableOpacity onPress={() => setShowPrivacy(true)}>
              <MonoText size={10} color={C.textMuted} style={[styles.row, { borderBottomColor: C.separator }]}>
                {t('settings_privacy')}
              </MonoText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      <PrivacyPolicyModal visible={showPrivacy} onClose={() => setShowPrivacy(false)} />
      <AccountModal
        visible={showAccount}
        onClose={() => setShowAccount(false)}
        displayName={user?.displayName}
        email={user?.email}
      />
    </>
  );
}

function Row({ label, onPress, danger, loading, C }: { label: string; onPress: () => void; danger?: boolean; loading?: boolean; C: any }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading}>
      <MonoText size={13} color={danger ? C.alarm : C.textSub} style={[styles.row, { borderBottomColor: C.separator }]}>
        {label}
      </MonoText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  panel: {
    borderTopWidth: 0.5,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
    maxHeight: '80%',
  },
  handle: {
    width: 32, height: 3, borderRadius: 2,
    alignSelf: 'center', marginBottom: 20,
  },
  row: { paddingVertical: 14, borderBottomWidth: 0.5 },
  themeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5 },
  accountRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: 'transparent',
    marginBottom: 4,
  },
  avatarSmall: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 1, alignItems: 'center', justifyContent: 'center',
  },
  statusText: { paddingVertical: 6, paddingLeft: 4 },
  divider: { height: 0.5, marginVertical: 12 },
  langList: { paddingLeft: 12, paddingBottom: 8 },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  analyticsBlock: { paddingVertical: 14, borderBottomWidth: 0.5 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  periodChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 0.5, borderRadius: 2,
  },
  shareBtn: {
    paddingVertical: 10, paddingHorizontal: 16,
    borderRadius: 2, alignSelf: 'flex-start',
  },
});
