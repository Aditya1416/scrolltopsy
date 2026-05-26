import { View, ViewStyle } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassCard({ children, style }: Props) {
  const { C } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: C.glass,
          borderWidth: 0.5,
          borderColor: C.glassBorder,
          borderRadius: 12,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
