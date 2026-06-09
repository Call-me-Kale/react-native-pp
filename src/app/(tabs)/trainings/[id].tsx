import { StyleSheet, ScrollView, Platform, View, Alert, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { apiService, TrainingEntry, Equipment } from '@/services/api';

export default function TrainingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  
  const [training, setTraining] = useState<TrainingEntry | null>(null);
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setError('Brak ID treningu');
        setLoading(false);
        return;
      }
      try {
        console.log('Loading training details for ID:', id);
        const data = await apiService.getTrainingById(id);
        setTraining(data);
        
        if (data.equipmentId) {
          try {
            const equipData = await apiService.getEquipmentById(data.equipmentId);
            setEquipment(equipData);
          } catch (e) {
            console.warn('Failed to load equipment info:', e);
          }
        }
      } catch (error: any) {
        console.error('Failed to load training details:', error);
        setError(error.message || 'Wystąpił błąd podczas ładowania danych');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Usuń trening',
      'Czy na pewno chcesz usunąć ten trening? Tej operacji nie można cofnąć.',
      [
        { text: 'Anuluj', style: 'cancel' },
        { 
          text: 'Usuń', 
          style: 'destructive',
          onPress: async () => {
            if (!id) return;
            setIsDeleting(true);
            try {
              await apiService.deleteTrainingEntry(id);
              router.replace('/(tabs)/trainings');
            } catch (err) {
              Alert.alert('Błąd', 'Nie udało się usunąć treningu.');
              console.error(err);
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'swimming': return 'waves';
      case 'cycling': return 'bike';
      case 'running': return 'run';
      default: return 'help-circle';
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.center, { backgroundColor: theme.background }]}>
        <ThemedText>Ładowanie szczegółów...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !training) {
    return (
      <ThemedView style={[styles.center, { backgroundColor: theme.background }]}>
        <ThemedText style={{ color: '#EF4444', marginBottom: 10 }}>{error || 'Nie znaleziono treningu.'}</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={{ color: '#1DB954' }}>Wróć do listy</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, backgroundColor: theme.background }}>
      <Stack.Screen 
        options={{ 
          title: 'Szczegóły treningu',
          headerTransparent: true,
          headerTintColor: theme.text,
          headerBackTitle: 'Powrót',
          headerRight: () => (
            <Pressable onPress={handleDelete} style={{ marginRight: 15 }}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </Pressable>
          )
        }} 
      />
      
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + Spacing.four }
        ]}
      >
        <ThemedView style={styles.header}>
          <ThemedView style={[styles.iconContainer, { backgroundColor: theme.backgroundElement }]}>
            <MaterialCommunityIcons name={getIcon(training.type) as any} size={40} color="#1DB954" />
          </ThemedView>
          <ThemedText style={styles.title}>{training.title || training.type.toUpperCase()}</ThemedText>
          <ThemedText themeColor="textSecondary" style={styles.date}>{formatDate(training.date)}</ThemedText>
        </ThemedView>

        <ThemedView style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">DYSTANS</ThemedText>
            <ThemedText style={styles.statValue}>{training.distance} km</ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">CZAS</ThemedText>
            <ThemedText style={styles.statValue}>{training.duration} min</ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">KALORIE</ThemedText>
            <ThemedText style={styles.statValue}>{training.calories} kcal</ThemedText>
          </Card>
          <Card style={styles.statCard}>
            <ThemedText type="small" themeColor="textSecondary">TĘTNO ŚR.</ThemedText>
            <ThemedText style={styles.statValue}>{training.avgHeartRate} bpm</ThemedText>
          </Card>
        </ThemedView>

        {equipment && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Użyty sprzęt</ThemedText>
            <Card style={styles.equipmentCard}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#1DB954" />
              <ThemedView>
                <ThemedText type="defaultSemiBold">{equipment.name}</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">{equipment.brand} {equipment.model}</ThemedText>
              </ThemedView>
            </Card>
          </ThemedView>
        )}

        {training.notes && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Notatki</ThemedText>
            <Card>
              <ThemedText>{training.notes}</ThemedText>
            </Card>
          </ThemedView>
        )}

        <ThemedView style={{ marginTop: Spacing.four }}>
          <Button 
            title={isDeleting ? "Usuwanie..." : "Usuń trening"} 
            variant="secondary" 
            onPress={handleDelete}
            textStyle={{ color: '#EF4444' }}
            disabled={isDeleting}
          />
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  date: {
    fontSize: 14,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.three,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  section: {
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  equipmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.three,
  },
});
