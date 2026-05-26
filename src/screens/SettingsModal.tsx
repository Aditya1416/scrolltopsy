import { useState } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  Linking, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { signInWithGoogle, signOut, deleteAccount, acceptPrivacy } from '../lib/auth';
import { syncToFirestore } from '../lib/sync';
import { deleteAllData } from '../lib/storage';
import { LANGUAGES, setLanguage } from '../i18n';
import MonoText from '../components/MonoText';

interface Props {
  visible: boolean;
  onClose: () => void;
  user: any;
}

export default function SettingsModal({ visible, onClose, user }: Props) {
  const insets = useSafeAreaInsets();
  const { C, isDark, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const [backupStatus, setBackupStatus] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      if (result?.requiresConsent) {
        await acceptPrivacy(result.user);
      }
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

  const handleShare = async () => {
    if (!user) return;
    setShareUrl(`scrolltopsy.vercel.app/week/${user.uid.slice(0, 8)}`);
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
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      <View style={[styles.panel, { backgroundColor: C.surface, borderTopColor: C.glassBorder, paddingBottom: insets.bottom + 24 }]}>
        <View style={[styles.handle, { backgroundColor: C.glassBorder }]} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {user ? (
            <>
              <MonoText size={12} color={C.textSub} style={styles.userName}>
                {user.displayName?.split(' ')[0]?.toLowerCase() || t('settings_signed_in')}
              </MonoText>
              <MonoText size={10} color={C.textMuted}>
                {user.email?.replace(/(.{2}).*(@.*)/, '$1…$2') || ''}
              </MonoText>
              <MonoText size={10} color={user?.emailVerified ? '#1D9E75' : C.alarm} style={{ marginTop: 4, marginBottom: 20 }}>
                {user?.emailVerified ? t('settings_verified') : t('settings_not_verified')}
              </MonoText>
              <Row label={t('settings_backup')} onPress={handleBackup} loading={loading} C={C} />
              {backupStatus ? <MonoText size={10} color={C.textSub} style={styles.statusText}>{backupStatus}</MonoText> : null}
              <Row label={t('settings_share')} onPress={handleShare} C={C} />
              {shareUrl ? <MonoText size={9} color={C.textSub} style={styles.statusText}>{shareUrl}</MonoText> : null}
              <Row label={t('settings_sign_out')} onPress={handleSignOut} C={C} />
              <Row label={t('settings_delete')} onPress={handleDelete} danger C={C} />
            </>
          ) : (
            <>
              <Row label={loading ? t('login_signing_in') : t('login_sign_in')} onPress={handleSignIn} loading={loading} C={C} />
            </>
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
          <TouchableOpacity onPress={() => Linking.openURL('https://scrolltopsy.vercel.app/privacy')}>
            <MonoText size={10} color={C.textMuted} style={[styles.row, { borderBottomColor: C.separator }]}>{t('settings_privacy')}</MonoText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
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
    maxHeight: '70%',
  },
  handle: {
    width: 32,
    height: 3,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  row: { paddingVertical: 14, borderBottomWidth: 0.5 },
  themeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 0.5 },
  userName: { marginBottom: 4 },
  statusText: { paddingVertical: 6, paddingLeft: 4 },
  divider: { height: 0.5, marginVertical: 12 },
  langList: { paddingLeft: 12, paddingBottom: 8 },
  langRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
});
