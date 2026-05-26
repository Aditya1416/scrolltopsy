import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity, Alert, StatusBar, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import MonoText from '../components/MonoText';
import { signInWithGoogle, acceptPrivacy } from '../lib/auth';
import { useTheme } from '../context/ThemeContext';

interface Props { onLoginSuccess: () => void; }

export default function LoginScreen({ onLoginSuccess }: Props) {
  const insets = useSafeAreaInsets();
  const { C, isDark } = useTheme();
  const { t } = useTranslation();
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
      Alert.alert(t('login_sign_in_failed'), e.message || 'unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: C.void, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={C.void} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <MonoText size={10} color={C.alarm} style={styles.label}>{t('login_brand')}</MonoText>
          <MonoText bold size={28} color={C.text} style={styles.title}>{t('login_title')}</MonoText>
          <View style={[styles.divider, { backgroundColor: C.alarm }]} />
          <MonoText size={11} color={C.textSub} style={styles.body}>{t('login_body')}</MonoText>
          <View style={[styles.permissionsBox, { backgroundColor: C.alarmDim, borderColor: 'rgba(226,75,74,0.2)' }]}>
            <MonoText size={10} color={C.textMuted}>{t('login_requires')}</MonoText>
            {([t('login_perm_usage'), t('login_perm_overlay'), t('login_perm_notifications')] as string[]).map((p: string) => (
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
              {loading ? t('login_signing_in') : t('login_sign_in')}
            </MonoText>
          </TouchableOpacity>
          <MonoText size={9} color={C.textMuted} style={styles.privacyNote}>{t('login_privacy_note')}</MonoText>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: 28, paddingBottom: 16 },
  content: { flex: 1, justifyContent: 'center', paddingTop: 40 },
  label: { marginBottom: 12, letterSpacing: 4 },
  title: { lineHeight: 38, marginBottom: 24 },
  divider: { width: 32, height: 1, marginBottom: 24 },
  body: { lineHeight: 22, marginBottom: 24 },
  permissionsBox: { borderWidth: 0.5, borderRadius: 8, padding: 16 },
  ctaArea: { paddingBottom: 32 },
  signInBtn: { backgroundColor: '#E24B4A', paddingVertical: 16, alignItems: 'center', borderRadius: 2 },
  signInBtnDisabled: { opacity: 0.5 },
  privacyNote: { textAlign: 'center', marginTop: 12, lineHeight: 18 },
});
