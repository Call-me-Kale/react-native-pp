import { StyleSheet, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export interface TrainingTypeButtonProps {
  type: 'swimming' | 'cycling' | 'running';
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPress: () => void;
  selected?: boolean;
}

const trainingConfig = {
  swimming: {
    label: 'Pływanie',
    color: '#3B82F6',
    icon: 'waves' as const,
  },
  cycling: {
    label: 'Rower',
    color: '#10B981',
    icon: 'bike' as const,
  },
  running: {
    label: 'Bieg',
    color: '#F97316',
    icon: 'run' as const,
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
          borderColor: selected ? config.color : 'transparent',
          borderWidth: 1,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={36}
        color={selected ? '#ffffff' : config.color}
        style={styles.icon}
      />
      <ThemedText
        type="defaultSemiBold"
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
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
  },
});
