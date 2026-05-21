import { View, StyleSheet, ViewStyle } from 'react-native';
import { C } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.glass,
    borderWidth: 0.5,
    borderColor: C.glassBorder,
    borderRadius: 12,
    padding: 16,
  },
});
