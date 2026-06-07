import { StyleSheet, ScrollView, Platform, View, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback } from 'react';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { apiService, TrainingStats } from '@/services/api';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Use the existing apiService functionality
  const fetchStats = useCallback(async () => {
    try {
      const statsData = await apiService.getTrainingStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  const containerPadding = Platform.select({
    web: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
    default: {
      paddingHorizontal: Spacing.four,
      paddingTop: Math.max(insets.top, Spacing.three),
      paddingBottom: insets.bottom + Spacing.three,
    },
  });

  const getPercentage = (count: number) => {
    const total = (stats?.trainingsByType.swimming || 0) + 
                  (stats?.trainingsByType.cycling || 0) + 
                  (stats?.trainingsByType.running || 0);
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.scrollContent, containerPadding]}
      bounces={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Zaawansowana Analityka</ThemedText>
        </ThemedView>

        {/* Main Stats */}
        <Card>
          <ThemedView style={styles.statsContainer}>
            <ThemedView style={styles.statBlock}>
              <ThemedText type="small" themeColor="textSecondary">
                DYSTANS CAŁKOWITY
              </ThemedText>
              <ThemedText style={styles.largeValue}>
                {stats?.totalDistance.toFixed(1) || '0.0'} km
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Sumaryczny wynik Twoich treningów
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.divider} />

            <ThemedView style={styles.statBlock}>
              <ThemedText type="small" themeColor="textSecondary">
                SPALANE KALORIE
              </ThemedText>
              <ThemedText style={styles.largeValue}>
                {stats?.totalCalories.toLocaleString() || '0'} kcal
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.positive}>
                🔥 {stats && stats.totalCalories > 1000 ? 'Intensywny trening' : 'Początek drogi'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Podział Treningu */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Podział Treningu</ThemedText>
        </ThemedView>

        <Card>
          <ThemedView style={styles.trainingBreakdown}>
            {/* Pływanie */}
            <ThemedView style={styles.breakdownItem}>
              <View style={[styles.colorDot, { backgroundColor: '#3B82F6' }]} />
              <ThemedText type="small">Pływanie</ThemedText>
              <ThemedText type="small" style={styles.percentage}>
                {getPercentage(stats?.trainingsByType.swimming || 0)}%
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <View style={[styles.progress, { width: `${getPercentage(stats?.trainingsByType.swimming || 0)}%`, backgroundColor: '#3B82F6' }]} />
            </ThemedView>

            {/* Rower */}
            <ThemedView style={styles.breakdownItem}>
              <View style={[styles.colorDot, { backgroundColor: '#10B981' }]} />
              <ThemedText type="small">Rower</ThemedText>
              <ThemedText type="small" style={styles.percentage}>
                {getPercentage(stats?.trainingsByType.cycling || 0)}%
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <View style={[styles.progress, { width: `${getPercentage(stats?.trainingsByType.cycling || 0)}%`, backgroundColor: '#10B981' }]} />
            </ThemedView>

            {/* Bieg */}
            <ThemedView style={styles.breakdownItem}>
              <View style={[styles.colorDot, { backgroundColor: '#F97316' }]} />
              <ThemedText type="small">Bieg</ThemedText>
              <ThemedText type="small" style={styles.percentage}>
                {getPercentage(stats?.trainingsByType.running || 0)}%
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <View style={[styles.progress, { width: `${getPercentage(stats?.trainingsByType.running || 0)}%`, backgroundColor: '#F97316' }]} />
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Średnie Tętno */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Średnie Tętno</ThemedText>
        </ThemedView>

        <Card>
          <ThemedView style={styles.heartRateZones}>
            <ThemedView style={styles.zoneItem}>
              <ThemedText style={styles.largeValue}>{Math.round(stats?.averageHeartRate || 0)}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                ŚREDNIE BPM
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Użycie Sprzętu */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Użycie Sprzętu</ThemedText>
        </ThemedView>

        <Card>
          <ThemedView style={styles.equipmentList}>
            <View
              style={{
                height: 150,
                backgroundColor: theme.backgroundElement,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <ThemedText type="small" themeColor="textSecondary">
                📊 Wykres będzie tutaj
              </ThemedText>
            </View>
          </ThemedView>
        </Card>
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
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  statsContainer: {
    gap: Spacing.three,
  },
  statBlock: {
    gap: Spacing.one,
  },
  largeValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E1E6',
    marginVertical: Spacing.two,
  },
  positive: {
    color: '#1DB954',
  },
  section: {
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  trainingBreakdown: {
    gap: Spacing.three,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  percentage: {
    marginLeft: 'auto',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E1E6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
  heartRateZones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  zoneItem: {
    flex: 1,
    minWidth: '45%',
    padding: Spacing.two,
    alignItems: 'center',
    gap: Spacing.one,
  },
  equipmentList: {
    gap: Spacing.two,
  },
});
