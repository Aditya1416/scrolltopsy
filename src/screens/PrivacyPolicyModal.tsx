import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import MonoText from '../components/MonoText';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SECTIONS = [
  {
    heading: 'what we collect',
    body:
      'session durations — when you manually track a scrolling session, the duration in minutes is saved locally on your device.\n\napp usage statistics — on android, we read time-spent-per-app from the system usage stats api. we read totals only (no app content, no notifications, no messages).\n\nweekly aggregates — if you sign in, session counts and total minutes for the week are synced to firestore. raw session timestamps are never uploaded.',
  },
  {
    heading: 'what we do not collect',
    body:
      '— app content, messages, or screenshots\n— contacts or call logs\n— location data\n— device identifiers (IMEI, advertising ID, etc.)\n— cross-device tracking\n— behavioral profiles sold to third parties\n\nthere are no analytics sdks, tracking pixels, or fingerprinting in this app.',
  },
  {
    heading: 'profile data',
    body:
      'if you fill in your profile (age, gender, birthday, phone, pincode), this information is stored locally on your device only. it is used solely to personalise shame messages. it is never uploaded, shared, or linked to your account.',
  },
  {
    heading: 'authentication',
    body:
      'sign-in is handled by firebase authentication (google). we receive your name, email address, and a firebase uid. your email is used to identify your firestore backup slot. it is not used for marketing.',
  },
  {
    heading: 'data retention',
    body:
      'local data stays until you delete it (settings → delete all my data) or uninstall the app.\n\nfirestore data is associated with your uid and deleted when you use "delete all my data" while signed in.',
  },
  {
    heading: 'third-party services',
    body:
      'firebase (google) — authentication and firestore backup.\n\nno data is shared with any other third party.\nno advertising networks are used.',
  },
  {
    heading: 'contact',
    body: 'questions? aditya161499@gmail.com',
  },
];

export default function PrivacyPolicyModal({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const { C } = useTheme();

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: C.void, paddingTop: insets.top }]}>
        <View style={[styles.header, { borderBottomColor: C.separator }]}>
          <MonoText size={11} color={C.textSub} style={{ flex: 1 }}>privacy policy</MonoText>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <MonoText size={11} color={C.alarm}>close</MonoText>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          <MonoText size={9} color={C.textMuted} style={{ marginBottom: 28, lineHeight: 16 }}>
            last updated: may 2026
          </MonoText>
          {SECTIONS.map(s => (
            <View key={s.heading} style={styles.section}>
              <MonoText bold size={10} color={C.alarm} style={styles.sectionHeading}>
                {s.heading}
              </MonoText>
              <MonoText size={10} color={C.textSub} style={styles.sectionBody}>
                {s.body}
              </MonoText>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  content: { paddingHorizontal: 24, paddingTop: 24 },
  section: { marginBottom: 28 },
  sectionHeading: { letterSpacing: 1, marginBottom: 10 },
  sectionBody: { lineHeight: 20 },
});
