import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface TrainingTypeButtonProps {
  type: 'swimming' | 'cycling' | 'running';
  icon?: string;
  onPress: () => void;
  selected?: boolean;
}

const trainingConfig = {
  swimming: {
    label: 'Pływanie',
    color: '#3B82F6',
    icon: '💧',
  },
  cycling: {
    label: 'Rower',
    color: '#10B981',
    icon: '🚴',
  },
  running: {
    label: 'Bieg',
    color: '#F97316',
    icon: '🏃',
  },
};

export function TrainingTypeButton({
  type,
  onPress,
  selected = false,
}: TrainingTypeButtonProps) {
  const theme = useTheme();
  const config = trainingConfig[type];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: selected ? config.color : theme.backgroundElement,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <ThemedText
        style={[
          styles.icon,
          { fontSize: 32 },
        ]}
      >
        {config.icon}
      </ThemedText>
      <ThemedText
        type="small"
        style={[
          styles.label,
          { color: selected ? '#ffffff' : theme.text },
        ]}
      >
        {config.label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    minWidth: '48%',
  },
  icon: {
    marginBottom: 8,
  },
  label: {
    fontWeight: '600',
  },
});
