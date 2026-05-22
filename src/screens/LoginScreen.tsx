import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MonoText from '../components/MonoText';
import { signInWithGoogle, acceptPrivacy } from '../lib/auth';
import { C } from '../theme';

interface Props { onLoginSuccess: () => void; }

export default function LoginScreen({ onLoginSuccess }: Props) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, delay: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, delay: 200, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInWithGoogle();
      if (result?.requiresConsent) await acceptPrivacy(result.user);
    } catch (e: any) {
      Alert.alert('sign in failed', e.message || 'unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <MonoText size={10} color={C.alarm} style={styles.label}>scrolltopsy</MonoText>
        <MonoText bold size={28} color={C.text} style={styles.title}>an autopsy of{'\n'}your screen time.</MonoText>
        <View style={styles.divider} />
        <MonoText size={11} color={C.textSub} style={styles.body}>
          this app reads your usage stats.{'\n'}
          it will show you exactly which apps{'\n'}
          are eating your life, and by how much.{'\n\n'}
          no judgement. just numbers.{'\n'}
          brutal, accurate numbers.
        </MonoText>
        <View style={styles.permissionsBox}>
          <MonoText size={10} color={C.textMuted}>requires access to:</MonoText>
          {['usage statistics', 'display over apps', 'notifications'].map(p => (
            <MonoText key={p} size={10} color={C.textSub} style={{ marginTop: 4 }}>— {p}</MonoText>
          ))}
        </View>
      </Animated.View>
      <Animated.View style={[styles.ctaArea, { opacity: fadeAnim, transform: [{ scale: pulseAnim }] }]}>
        <TouchableOpacity
          style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
          onPress={handleSignIn}
          disabled={loading}
          activeOpacity={0.7}
        >
          <MonoText bold size={13} color="#000">
            {loading ? 'signing in…' : 'sign in with google →'}
          </MonoText>
        </TouchableOpacity>
        <MonoText size={9} color={C.textMuted} style={styles.privacyNote}>
          weekly aggregates sync to firestore.{'\n'}raw sessions stay on your device.
        </MonoText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000', justifyContent: 'space-between', paddingHorizontal: 28 },
  content: { flex: 1, justifyContent: 'center' },
  label: { marginBottom: 12, letterSpacing: 4 },
  title: { lineHeight: 38, marginBottom: 24 },
  divider: { width: 32, height: 1, backgroundColor: C.alarm, marginBottom: 24 },
  body: { lineHeight: 22, marginBottom: 24 },
  permissionsBox: { backgroundColor: 'rgba(226,75,74,0.06)', borderWidth: 0.5, borderColor: 'rgba(226,75,74,0.2)', borderRadius: 8, padding: 16 },
  ctaArea: { paddingBottom: 32 },
  signInBtn: { backgroundColor: C.alarm, paddingVertical: 16, alignItems: 'center', borderRadius: 2 },
  signInBtnDisabled: { opacity: 0.5 },
  privacyNote: { textAlign: 'center', marginTop: 12, lineHeight: 18 },
});
