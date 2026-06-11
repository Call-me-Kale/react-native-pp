import React from 'react';
import { StyleSheet, Pressable, ViewStyle } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

interface SegmentedControlProps {
  options: string[];
  selectedIndex: number;
  onChange: (index: number) => void;
  style?: ViewStyle;
}

export function SegmentedControl({ options, selectedIndex, onChange, style }: SegmentedControlProps) {
  const theme = useTheme();

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.backgroundElement }, style]}>
      {options.map((option, index) => {
        const isSelected = selectedIndex === index;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(index)}
            style={[
              styles.segment,
              isSelected && { backgroundColor: theme.background, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }
            ]}
          >
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.text,
                { color: isSelected ? '#1DB954' : theme.textSecondary }
              ]}
            >
              {option}
            </ThemedText>
          </Pressable>
        );
      })}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 44,
    borderRadius: 12,
    padding: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
  },
});
