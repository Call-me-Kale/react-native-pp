import { StyleSheet, ScrollView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrainingTypeButton } from '@/components/ui/training-type-button';
import { Spacing } from '@/constants/theme';
import { useState } from 'react';

export default function AddEntryScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const [trainingType, setTrainingType] = useState<'swimming' | 'cycling' | 'running'>('running');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [heartRate, setHeartRate] = useState('');

  const containerPadding = Platform.select({
    web: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
    default: {
      paddingHorizontal: Spacing.four,
      paddingTop: Math.max(insets.top, Spacing.three),
      paddingBottom: insets.bottom + Spacing.three,
    },
  });

  const handleSave = () => {
    // TODO: Save entry to API when implemented
    router.back();
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.scrollContent, containerPadding]}
      bounces={false}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Dodaj wpis</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Aktywność
          </ThemedText>
        </ThemedView>

        {/* Training Type Selection */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Typ</ThemedText>
          <View style={styles.trainingGrid}>
            <TrainingTypeButton
              type="swimming"
              onPress={() => setTrainingType('swimming')}
              selected={trainingType === 'swimming'}
            />
            <TrainingTypeButton
              type="cycling"
              onPress={() => setTrainingType('cycling')}
              selected={trainingType === 'cycling'}
            />
            <TrainingTypeButton
              type="running"
              onPress={() => setTrainingType('running')}
              selected={trainingType === 'running'}
            />
          </View>
        </ThemedView>

        {/* Nazwa aktywności */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Nazwa aktywności</ThemedText>
          <Input
            placeholder="Np. Poranny rozruch"
            value={duration}
            onChangeText={setDuration}
          />
        </ThemedView>

        {/* Czas treningu */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Czas treningu (minuty)</ThemedText>
          <Input
            placeholder="hh:mm:ss"
            value={duration}
            onChangeText={setDuration}
            keyboardType="decimal-pad"
          />
        </ThemedView>

        {/* Dystans */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Dystans przybył (km)</ThemedText>
          <Input
            placeholder="0.00"
            value={distance}
            onChangeText={setDistance}
            keyboardType="decimal-pad"
          />
        </ThemedView>

        {/* Spalane kalorie */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Spalane kalorie</ThemedText>
          <Input
            placeholder="0"
            value={calories}
            onChangeText={setCalories}
            keyboardType="numeric"
          />
        </ThemedView>

        {/* Średnie tętno */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Średnie tętno (bpm)</ThemedText>
          <Input
            placeholder="120"
            value={heartRate}
            onChangeText={setHeartRate}
            keyboardType="numeric"
          />
        </ThemedView>

        {/* Notatki */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notatki</ThemedText>
          <Input
            placeholder="Dodaj notatki do treningu..."
            value={distance}
            onChangeText={setDistance}
            multiline
            numberOfLines={4}
          />
        </ThemedView>

        {/* Actions */}
        <ThemedView style={styles.actions}>
          <Button
            title="Zapisz"
            onPress={handleSave}
            variant="primary"
          />
          <Button
            title="Anuluj"
            onPress={() => {
              router.back();
            }}
            variant="secondary"
          />
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    gap: Spacing.three,
  },
  header: {
    gap: Spacing.one,
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  trainingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
  actions: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
});
