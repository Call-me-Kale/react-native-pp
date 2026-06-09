import { StyleSheet, ScrollView, Pressable, RefreshControl, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useCallback, useEffect } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { apiService, Equipment, EquipmentLog } from '@/services/api';

export default function EquipmentDetailsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [logs, setLogs] = useState<EquipmentLog[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      const [itemData, logsData] = await Promise.all([
        apiService.getEquipmentById(id),
        apiService.getEquipmentLogs(id),
      ]);
      setEquipment(itemData);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to fetch equipment details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'bike': return 'bike';
      case 'shoes': return 'run';
      default: return 'wrench';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ThemedText>Ładowanie szczegółów...</ThemedText>
      </ThemedView>
    );
  }

  if (!equipment) {
    return (
      <ThemedView style={[styles.container, styles.center]}>
        <ThemedText>Nie znaleziono sprzętu.</ThemedText>
        <Pressable onPress={() => router.back()} style={{ marginTop: 20 }}>
          <ThemedText style={{ color: '#1DB954' }}>Wróć</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.text} />
        </Pressable>
        <ThemedText style={styles.title}>Szczegóły sprzętu</ThemedText>
        <View style={{ width: 40 }} />
      </ThemedView>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + Spacing.four }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1DB954']} />}
      >
        {/* Main Info Card */}
        <Card style={styles.mainCard}>
          <ThemedView style={styles.cardHeader}>
            <ThemedView style={[styles.iconContainer, { backgroundColor: theme.backgroundElement }]}>
              <MaterialCommunityIcons name={getCategoryIcon(equipment.category) as any} size={32} color="#1DB954" />
            </ThemedView>
            <ThemedView style={styles.cardTitleContainer}>
              <ThemedText style={styles.itemName}>{equipment.name}</ThemedText>
              <ThemedText themeColor="textSecondary">{equipment.brand} {equipment.model}</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.statsGrid}>
            <ThemedView style={styles.statBox}>
              <ThemedText type="small" themeColor="textSecondary">PRZEBIEG</ThemedText>
              <ThemedText style={styles.statValue}>{equipment.totalDistance.toFixed(1)} km</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statBox}>
              <ThemedText type="small" themeColor="textSecondary">KATEGORIA</ThemedText>
              <ThemedText style={styles.statValue}>{equipment.category}</ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.infoRow}>
            <ThemedText type="small" themeColor="textSecondary">Data zakupu: </ThemedText>
            <ThemedText style={styles.infoText}>{formatDate(equipment.purchaseDate)}</ThemedText>
          </ThemedView>
        </Card>

        {/* Usage Logs Section */}
        <ThemedView style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Historia użycia</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">{logs.length} wpisów</ThemedText>
        </ThemedView>

        {logs.length === 0 ? (
          <Card style={styles.emptyLogsCard}>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>
              Brak historii użycia dla tego sprzętu.
            </ThemedText>
          </Card>
        ) : (
          logs.map((log) => (
            <Card key={log.id} style={styles.logCard}>
              <ThemedView style={styles.logContent}>
                <ThemedView style={styles.logMain}>
                  <ThemedText style={styles.logDescription}>{log.description}</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">{formatDate(log.date)}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.logDistance}>+{log.distance.toFixed(1)} km</ThemedText>
              </ThemedView>
            </Card>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  backButton: {
    padding: Spacing.one,
    marginLeft: -Spacing.one,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  mainCard: {
    gap: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 22,
    fontWeight: '800',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1DB954',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyLogsCard: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontStyle: 'italic',
  },
  logCard: {
    paddingVertical: 12,
  },
  logContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logMain: {
    flex: 1,
    gap: 4,
  },
  logDescription: {
    fontSize: 15,
    fontWeight: '600',
  },
  logDistance: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1DB954',
  },
});
