import { useState } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  Linking, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { signInWithGoogle, signOut, deleteAccount, acceptPrivacy } from '../lib/auth';
import { syncToFirestore } from '../lib/sync';
import { deleteAllData } from '../lib/storage';
import MonoText from '../components/MonoText';

interface Props {
  visible: boolean;
  onClose: () => void;
  user: any;
}

export default function SettingsModal({ visible, onClose, user }: Props) {
  const insets = useSafeAreaInsets();
  const { C, isDark, toggleTheme } = useTheme();
  const [backupStatus, setBackupStatus] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      if (result?.requiresConsent) {
        await acceptPrivacy(result.user);
      }
      onClose();
    } catch (e: any) {
      Alert.alert('sign in failed', e.message || 'unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleBackup = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await syncToFirestore(user.uid);
      setBackupStatus('backed up.');
      setTimeout(() => setBackupStatus(''), 3000);
    } catch (e: any) {
      setBackupStatus(e.message || 'backup failed');
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
      'delete all data',
      'this cannot be undone.',
      [
        { text: 'cancel', style: 'cancel' },
        {
          text: 'delete everything',
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
                {user.displayName?.split(' ')[0]?.toLowerCase() || 'signed in'}
              </MonoText>
              <MonoText size={10} color={C.textMuted}>
                {user.email?.replace(/(.{2}).*(@.*)/, '$1…$2') || ''}
              </MonoText>
              <MonoText size={10} color={user?.emailVerified ? '#1D9E75' : C.alarm} style={{ marginTop: 4, marginBottom: 20 }}>
                {user?.emailVerified ? '✓ verified' : '⚠ not verified — check email'}
              </MonoText>
              <Row label="back up my data" onPress={handleBackup} loading={loading} C={C} />
              {backupStatus ? <MonoText size={10} color={C.textSub} style={styles.statusText}>{backupStatus}</MonoText> : null}
              <Row label="share this week" onPress={handleShare} C={C} />
              {shareUrl ? <MonoText size={9} color={C.textSub} style={styles.statusText}>{shareUrl}</MonoText> : null}
              <Row label="sign out" onPress={handleSignOut} C={C} />
              <Row label="delete all my data" onPress={handleDelete} danger C={C} />
            </>
          ) : (
            <>
              <Row label={loading ? 'signing in…' : 'sign in with google →'} onPress={handleSignIn} loading={loading} C={C} />
            </>
          )}
          <View style={[styles.divider, { backgroundColor: C.separator }]} />

          {/* Light / dark toggle */}
          <TouchableOpacity style={[styles.themeRow, { borderBottomColor: C.separator }]} onPress={toggleTheme}>
            <MonoText size={13} color={C.textSub} style={{ flex: 1 }}>
              {isDark ? 'light mode' : 'dark mode'}
            </MonoText>
            <MonoText size={11} color={C.textMuted}>{isDark ? '○' : '●'}</MonoText>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <TouchableOpacity onPress={() => Linking.openURL('https://scrolltopsy.vercel.app/privacy')}>
            <MonoText size={10} color={C.textMuted} style={[styles.row, { borderBottomColor: C.separator }]}>privacy policy</MonoText>
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
});
