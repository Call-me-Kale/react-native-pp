import { Pressable, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

export function Button({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const theme = useTheme();

  const getBackgroundColor = () => {
    if (disabled) return theme.backgroundSelected;
    switch (variant) {
      case 'primary':
        return '#1DB954'; // Green for primary
      case 'secondary':
        return theme.backgroundElement;
      case 'danger':
        return '#FF6B6B';
      default:
        return theme.text;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'secondary':
        return theme.text;
      default:
        return '#ffffff';
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <ThemedText
        style={[styles.buttonText, { color: getTextColor() }, textStyle]}
        type="default"
      >
        {loading ? 'Loading...' : title}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
