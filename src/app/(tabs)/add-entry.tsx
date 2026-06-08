import { StyleSheet, ScrollView, Platform, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrainingTypeButton } from '@/components/ui/training-type-button';
import { Spacing } from '@/constants/theme';
import { useState, useEffect } from 'react';
import { apiService } from '@/services/api';

export default function AddEntryScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  
  const [trainingType, setTrainingType] = useState<'swimming' | 'cycling' | 'running'>('running');

  useEffect(() => {
    if (params.type === 'swimming' || params.type === 'cycling' || params.type === 'running') {
      setTrainingType(params.type);
    }
  }, [params.type]);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const containerPadding = Platform.select({
    web: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
    default: {
      paddingHorizontal: Spacing.four,
      paddingTop: Math.max(insets.top, Spacing.three),
      paddingBottom: insets.bottom + Spacing.three,
    },
  });

  const handleSave = async () => {
    if (!duration || !distance) {
      Alert.alert('Błąd', 'Proszę podać czas i dystans treningu.');
      return;
    }

    setIsSaving(true);
    try {
      await apiService.createTrainingEntry({
        type: trainingType,
        title: title || `${trainingType.charAt(0).toUpperCase() + trainingType.slice(1)} Training`,
        date: new Date().toISOString(),
        duration: parseInt(duration, 10),
        distance: parseFloat(distance),
        calories: parseInt(calories, 10) || 0,
        avgHeartRate: parseInt(heartRate, 10) || 0,
        notes: notes,
      });
      router.back();
    } catch (error) {
      console.error('Failed to save training:', error);
      Alert.alert('Błąd', 'Nie udało się zapisać treningu. Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
    }
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
            value={title}
            onChangeText={setTitle}
          />
        </ThemedView>

        {/* Czas treningu */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Czas treningu (minuty)</ThemedText>
          <Input
            placeholder="60"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
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
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </ThemedView>

        {/* Actions */}
        <ThemedView style={styles.actions}>
          <Button
            title={isSaving ? "Zapisywanie..." : "Zapisz"}
            onPress={handleSave}
            variant="primary"
            disabled={isSaving}
          />
          <Button
            title="Anuluj"
            onPress={() => {
              router.back();
            }}
            variant="secondary"
            disabled={isSaving}
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
