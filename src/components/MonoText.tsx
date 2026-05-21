import { Text, TextStyle } from 'react-native';
import { F, C } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: TextStyle | TextStyle[];
  bold?: boolean;
  italic?: boolean;
  size?: number;
  color?: string;
}

export default function MonoText({ children, style, bold, italic, size = 12, color }: Props) {
  const family = bold ? F.monoBold : italic ? F.monoItalic : F.mono;
  return (
    <Text style={[{ fontFamily: family, fontSize: size, color: color ?? C.text }, style]}>
      {children}
    </Text>
  );
}
