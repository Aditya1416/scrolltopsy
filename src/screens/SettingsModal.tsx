import { useState } from 'react';
import {
  Modal, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback,
  Linking, ScrollView, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C } from '../theme';
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
      <View style={[styles.panel, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          {user ? (
            <>
              <MonoText size={12} color={C.textSub} style={styles.userName}>
                {user.displayName?.split(' ')[0]?.toLowerCase() || 'signed in'}
              </MonoText>
              <MonoText size={10} color={C.textMuted} style={{ marginBottom: 20 }}>
                {user.email?.replace(/(.{2}).*(@.*)/, '$1…$2') || ''}
              </MonoText>
              <Row label="back up my data" onPress={handleBackup} loading={loading} />
              {backupStatus ? <MonoText size={10} color={C.textSub} style={styles.statusText}>{backupStatus}</MonoText> : null}
              <Row label="share this week" onPress={handleShare} />
              {shareUrl ? <MonoText size={9} color={C.textSub} style={styles.statusText}>{shareUrl}</MonoText> : null}
              <Row label="sign out" onPress={handleSignOut} />
              <Row label="delete all my data" onPress={handleDelete} danger />
            </>
          ) : (
            <>
              <Row label={loading ? 'signing in…' : 'sign in with google →'} onPress={handleSignIn} loading={loading} />
            </>
          )}
          <View style={styles.divider} />
          <TouchableOpacity onPress={() => Linking.openURL('https://scrolltopsy.vercel.app/privacy')}>
            <MonoText size={10} color={C.textMuted} style={styles.row}>privacy policy</MonoText>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

function Row({ label, onPress, danger, loading }: { label: string; onPress: () => void; danger?: boolean; loading?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={loading}>
      <MonoText size={13} color={danger ? C.alarm : C.textSub} style={styles.row}>
        {label}
      </MonoText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  panel: {
    backgroundColor: '#0a0a0a',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 16,
    maxHeight: '70%',
  },
  handle: {
    width: 32,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  row: { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  userName: { marginBottom: 4 },
  statusText: { paddingVertical: 6, paddingLeft: 4 },
  divider: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.05)', marginVertical: 12 },
});
