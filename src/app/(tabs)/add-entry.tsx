import { StyleSheet, ScrollView, Platform, View, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrainingTypeButton } from '@/components/ui/training-type-button';
import { Spacing } from '@/constants/theme';
import { useState, useEffect, useCallback } from 'react';
import { apiService, Equipment } from '@/services/api';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

export default function AddEntryScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ type?: string }>();
  
  const [trainingType, setTrainingType] = useState<'swimming' | 'cycling' | 'running'>('running');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('none');
  const [showDropdown, setShowDropdown] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [calories, setCalories] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchEquipment = async () => {
    try {
      const data = await apiService.getEquipment();
      setEquipmentList(data);
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEquipment();
    }, [])
  );

  useEffect(() => {
    if (params.type === 'swimming' || params.type === 'cycling' || params.type === 'running') {
      setTrainingType(params.type);
    }
  }, [params.type]);

  const handleSave = async () => {
    if (!duration || !distance || !date) {
      Alert.alert('Błąd', 'Proszę podać datę, czas i dystans treningu.');
      return;
    }

    setIsSaving(true);
    try {
      // Create full ISO string for the backend
      const fullDate = new Date(date);
      const now = new Date();
      fullDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

      await apiService.createTrainingEntry({
        type: trainingType,
        title: title || `${trainingType.charAt(0).toUpperCase() + trainingType.slice(1)} Training`,
        date: fullDate.toISOString(),
        duration: parseInt(duration, 10),
        distance: parseFloat(distance),
        calories: parseInt(calories, 10) || 0,
        avgHeartRate: parseInt(heartRate, 10) || 0,
        notes: notes,
        equipmentId: selectedEquipmentId === 'none' ? undefined : selectedEquipmentId,
      });
      router.back();
    } catch (error) {
      console.error('Failed to save training:', error);
      Alert.alert('Błąd', 'Nie udało się zapisać treningu. Spróbuj ponownie.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredEquipment = equipmentList.filter(e => {
    if (trainingType === 'running') return e.category.toLowerCase() === 'shoes';
    if (trainingType === 'cycling') return e.category.toLowerCase() === 'bike';
    return true;
  });

  const selectedEquipmentName = selectedEquipmentId === 'none' 
    ? 'Wybierz sprzęt...' 
    : equipmentList.find(e => e.id === selectedEquipmentId)?.name || 'Wybierz sprzęt...';

  const containerPadding = Platform.select({
    web: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
    default: {
      paddingHorizontal: Spacing.four,
      paddingTop: Math.max(insets.top, Spacing.three),
      paddingBottom: insets.bottom + Spacing.three,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.scrollContent, containerPadding]}
      bounces={false}
    >
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Dodaj wpis</ThemedText>
        </ThemedView>

        {/* Typ Treningu */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Typ aktywności</ThemedText>
          <View style={styles.trainingGrid}>
            <TrainingTypeButton
              type="swimming"
              onPress={() => {
                setTrainingType('swimming');
                setSelectedEquipmentId('none');
              }}
              selected={trainingType === 'swimming'}
            />
            <TrainingTypeButton
              type="cycling"
              onPress={() => {
                setTrainingType('cycling');
                setSelectedEquipmentId('none');
              }}
              selected={trainingType === 'cycling'}
            />
            <TrainingTypeButton
              type="running"
              onPress={() => {
                setTrainingType('running');
                setSelectedEquipmentId('none');
              }}
              selected={trainingType === 'running'}
            />
          </View>
        </ThemedView>

        {/* Data Aktywności */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Data aktywności</ThemedText>
          <Input
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />
        </ThemedView>

        {/* Sprzęt Dropdown (Custom implementation for consistency) */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sprzęt</ThemedText>
          {filteredEquipment.length > 0 ? (
            <View>
              <Pressable
                onPress={() => setShowDropdown(!showDropdown)}
                style={[styles.dropdownTrigger, { backgroundColor: theme.backgroundElement }]}
              >
                <ThemedText style={{ color: selectedEquipmentId === 'none' ? theme.textSecondary : theme.text }}>
                  {selectedEquipmentName}
                </ThemedText>
                <MaterialCommunityIcons 
                  name={showDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.textSecondary} 
                />
              </Pressable>
              
              {showDropdown && (
                <ThemedView style={[styles.dropdownList, { backgroundColor: theme.backgroundElement }]}>
                  <Pressable
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedEquipmentId('none');
                      setShowDropdown(false);
                    }}
                  >
                    <ThemedText>Brak (nie doliczaj dystansu)</ThemedText>
                  </Pressable>
                  {filteredEquipment.map((item) => (
                    <Pressable
                      key={item.id}
                      style={[styles.dropdownItem, { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' }]}
                      onPress={() => {
                        setSelectedEquipmentId(item.id);
                        setShowDropdown(false);
                      }}
                    >
                      <View style={styles.dropdownItemContent}>
                        <MaterialCommunityIcons 
                          name={item.category.toLowerCase() === 'shoes' ? 'run' : 'bike'} 
                          size={16} 
                          color={theme.text} 
                        />
                        <ThemedText>{item.name}</ThemedText>
                      </View>
                    </Pressable>
                  ))}
                </ThemedView>
              )}
            </View>
          ) : (
            <Pressable 
              onPress={() => router.push("/equipment" as any)}
              style={[styles.emptyEquipment, { backgroundColor: theme.backgroundElement }]}
            >
              <MaterialCommunityIcons name="plus-circle-outline" size={20} color={theme.textSecondary} />
              <ThemedText type="small" themeColor="textSecondary">
                Brak sprzętu. Dotknij, aby dodać.
              </ThemedText>
            </Pressable>
          )}
        </ThemedView>

        {/* Reszta Pól */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Nazwa aktywności</ThemedText>
          <Input
            placeholder="Np. Poranny rozruch"
            value={title}
            onChangeText={setTitle}
          />
        </ThemedView>

        <View style={styles.row}>
          <ThemedView style={[styles.section, { flex: 1 }]}>
            <ThemedText style={styles.sectionTitle}>Czas (min)</ThemedText>
            <Input
              placeholder="60"
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
            />
          </ThemedView>
          <ThemedView style={[styles.section, { flex: 1 }]}>
            <ThemedText style={styles.sectionTitle}>Dystans (km)</ThemedText>
            <Input
              placeholder="0.00"
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
            />
          </ThemedView>
        </View>

        <View style={styles.row}>
          <ThemedView style={[styles.section, { flex: 1 }]}>
            <ThemedText style={styles.sectionTitle}>Kalorie</ThemedText>
            <Input
              placeholder="0"
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
            />
          </ThemedView>
          <ThemedView style={[styles.section, { flex: 1 }]}>
            <ThemedText style={styles.sectionTitle}>Tętno (bpm)</ThemedText>
            <Input
              placeholder="120"
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="numeric"
            />
          </ThemedView>
        </View>

        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Notatki</ThemedText>
          <Input
            placeholder="Dodaj notatki..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </ThemedView>

        <ThemedView style={styles.actions}>
          <Button
            title={isSaving ? "Zapisywanie..." : "Zapisz trening"}
            onPress={handleSave}
            variant="primary"
            disabled={isSaving}
          />
          <Button
            title="Anuluj"
            onPress={() => router.back()}
            variant="secondary"
            disabled={isSaving}
          />
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  container: { gap: Spacing.three },
  header: { marginBottom: Spacing.one },
  title: { fontSize: 24, fontWeight: '700' },
  section: { gap: Spacing.one },
  sectionTitle: { fontSize: 13, fontWeight: '600', opacity: 0.7 },
  trainingGrid: { flexDirection: 'row', gap: Spacing.two },
  row: { flexDirection: 'row', gap: Spacing.two },
  dropdownTrigger: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dropdownList: {
    marginTop: 4,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  dropdownItem: {
    padding: 16,
  },
  dropdownItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emptyEquipment: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  actions: { gap: Spacing.two, marginTop: Spacing.two },
});
