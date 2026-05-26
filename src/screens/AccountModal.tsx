import { useEffect, useState } from 'react';
import {
  Modal, View, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Image, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { getUserProfile, saveUserProfile, UserProfile } from '../lib/storage';
import MonoText from '../components/MonoText';

interface Props {
  visible: boolean;
  onClose: () => void;
  displayName?: string;
  email?: string;
}

const GENDERS: { key: UserProfile['gender']; label: string }[] = [
  { key: 'male', label: 'male' },
  { key: 'female', label: 'female' },
  { key: 'other', label: 'other' },
  { key: 'prefer_not', label: 'prefer not to say' },
];

export default function AccountModal({ visible, onClose, displayName, email }: Props) {
  const insets = useSafeAreaInsets();
  const { C } = useTheme();
  const [profile, setProfile] = useState<UserProfile>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (visible) {
      getUserProfile().then(setProfile);
      setSaved(false);
    }
  }, [visible]);

  const set = (key: keyof UserProfile, value: any) =>
    setProfile(p => ({ ...p, [key]: value }));

  const handleSave = async () => {
    await saveUserProfile(profile);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('permission needed', 'allow access to photos to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets[0]) {
      set('photoUri', result.assets[0].uri);
    }
  };

  const initials = (displayName ?? 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={[styles.root, { backgroundColor: C.void, paddingTop: insets.top }]}>
          <View style={[styles.header, { borderBottomColor: C.separator }]}>
            <MonoText size={11} color={C.textSub} style={{ flex: 1 }}>profile</MonoText>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <MonoText size={11} color={C.textMuted}>cancel</MonoText>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 60 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar */}
            <View style={styles.avatarArea}>
              <TouchableOpacity onPress={handlePickPhoto} activeOpacity={0.8}>
                <View style={[styles.avatar, { borderColor: C.alarm }]}>
                  {profile.photoUri ? (
                    <Image source={{ uri: profile.photoUri }} style={styles.avatarImage} />
                  ) : (
                    <MonoText bold size={28} color={C.alarm}>{initials}</MonoText>
                  )}
                </View>
                <MonoText size={8} color={C.textMuted} style={{ textAlign: 'center', marginTop: 6 }}>
                  tap to change
                </MonoText>
              </TouchableOpacity>
              {displayName ? (
                <MonoText size={12} color={C.text} style={{ marginTop: 8 }}>
                  {displayName.toLowerCase()}
                </MonoText>
              ) : null}
              {email ? (
                <MonoText size={9} color={C.textMuted} style={{ marginTop: 4 }}>
                  {email}
                </MonoText>
              ) : null}
            </View>

            <View style={[styles.divider, { backgroundColor: C.separator }]} />

            {/* Age */}
            <Field label="age" C={C}>
              <TextInput
                style={[styles.input, { color: C.text, borderBottomColor: C.separator }]}
                keyboardType="number-pad"
                maxLength={3}
                placeholder="—"
                placeholderTextColor={C.textMuted}
                value={profile.age ? String(profile.age) : ''}
                onChangeText={v => set('age', v ? parseInt(v, 10) : undefined)}
              />
            </Field>

            {/* Gender */}
            <Field label="gender" C={C}>
              <View style={styles.genderRow}>
                {GENDERS.map(g => (
                  <TouchableOpacity
                    key={g.key}
                    style={[
                      styles.genderChip,
                      { borderColor: profile.gender === g.key ? C.alarm : C.separator },
                    ]}
                    onPress={() => set('gender', g.key)}
                  >
                    <MonoText
                      size={9}
                      color={profile.gender === g.key ? C.alarm : C.textMuted}
                    >
                      {g.label}
                    </MonoText>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            {/* Birthday */}
            <Field label="birthday" C={C}>
              <TextInput
                style={[styles.input, { color: C.text, borderBottomColor: C.separator }]}
                placeholder="dd/mm/yyyy"
                placeholderTextColor={C.textMuted}
                keyboardType="number-pad"
                maxLength={10}
                value={profile.birthday ?? ''}
                onChangeText={v => set('birthday', v)}
              />
            </Field>

            {/* Phone */}
            <Field label="phone" C={C}>
              <TextInput
                style={[styles.input, { color: C.text, borderBottomColor: C.separator }]}
                placeholder="—"
                placeholderTextColor={C.textMuted}
                keyboardType="phone-pad"
                maxLength={15}
                value={profile.phone ?? ''}
                onChangeText={v => set('phone', v)}
              />
            </Field>

            {/* Pincode */}
            <Field label="pincode" C={C}>
              <TextInput
                style={[styles.input, { color: C.text, borderBottomColor: C.separator }]}
                placeholder="—"
                placeholderTextColor={C.textMuted}
                keyboardType="number-pad"
                maxLength={10}
                value={profile.pincode ?? ''}
                onChangeText={v => set('pincode', v)}
              />
            </Field>

            <MonoText size={9} color={C.textMuted} style={styles.hint}>
              stored locally only. never uploaded.
            </MonoText>

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: saved ? C.textMuted : C.alarm }]}
              onPress={handleSave}
            >
              <MonoText bold size={12} color="#000">
                {saved ? 'saved.' : 'save profile'}
              </MonoText>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, children, C }: { label: string; children: React.ReactNode; C: any }) {
  return (
    <View style={styles.field}>
      <MonoText size={8} color={C.textMuted} style={styles.fieldLabel}>{label}</MonoText>
      {children}
    </View>
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
  avatarArea: { alignItems: 'center', paddingVertical: 24 },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  divider: { height: 0.5, marginBottom: 24 },
  field: { marginBottom: 24 },
  fieldLabel: { letterSpacing: 2, marginBottom: 8 },
  input: {
    fontSize: 14,
    fontFamily: 'SpaceMono_400Regular',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
  },
  genderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  genderChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderRadius: 2,
  },
  hint: { marginBottom: 24, lineHeight: 16 },
  saveBtn: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 2,
  },
});
