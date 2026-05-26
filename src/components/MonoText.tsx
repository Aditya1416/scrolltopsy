import { Text, TextStyle } from 'react-native';
import { F } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface Props {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  bold?: boolean;
  italic?: boolean;
  size?: number;
  color?: string;
}

export default function MonoText({ children, style, bold, italic, size = 12, color }: Props) {
  const { C } = useTheme();
  const family = bold ? F.monoBold : italic ? F.monoItalic : F.mono;
  return (
    <Text style={[{ fontFamily: family, fontSize: size, color: color ?? C.text }, style]}>
      {children}
    </Text>
  );
}
