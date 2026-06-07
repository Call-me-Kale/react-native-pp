import { StyleSheet, ScrollView, Platform, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useEffect, useState, useCallback } from 'react';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityItem } from '@/components/ui/activity-item';
import { Spacing } from '@/constants/theme';
import { apiService, TrainingEntry, TrainingStats } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [latestTraining, setLatestTraining] = useState<TrainingEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, entries] = await Promise.all([
        apiService.getTrainingStats(),
        apiService.getTrainingEntries(undefined, 1),
      ]);
      setStats(statsData);
      if (entries.length > 0) {
        setLatestTraining(entries[0]);
      } else {
        setLatestTraining(null);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const containerPadding = Platform.select({
    web: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
    default: {
      paddingHorizontal: Spacing.four,
      paddingTop: Math.max(insets.top, Spacing.three),
      paddingBottom: insets.bottom + Spacing.three,
    },
  });

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
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
          <ThemedView style={styles.headerContent}>
            <ThemedText style={styles.greeting}>Cześć, {user?.username || 'Zawodnik'}!</ThemedText>
            <ThemedText type="subtitle" themeColor="textSecondary">
              Gotowy na kolejny trening?
            </ThemedText>
          </ThemedView>
          <Card style={styles.badgeCard}>
            <ThemedText style={styles.badgeIcon}>🏆</ThemedText>
          </Card>
        </ThemedView>

        {/* Today Stats */}
        <Card>
          <ThemedView style={styles.statsGrid}>
            <ThemedView style={styles.statItem}>
              <ThemedText type="small" themeColor="textSecondary">
                DYSTANS (DZIŚ)
              </ThemedText>
              <ThemedText style={styles.statValue}>
                {stats?.todayDistance.toFixed(1) || '0.0'} km
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText type="small" themeColor="textSecondary">
                KALORIE (DZIŚ)
              </ThemedText>
              <ThemedText style={styles.statValue}>
                {stats?.todayCalories.toLocaleString() || '0'} kcal
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Ostatni training */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ostatni trening</ThemedText>
          {latestTraining && (
            <ThemedText type="small" themeColor="textSecondary" style={styles.viewMore}>
              {formatDate(latestTraining.date)}
            </ThemedText>
          )}
        </ThemedView>

        {latestTraining ? (
          <ActivityItem
            icon={latestTraining.type === 'swimming' ? '🏊' : latestTraining.type === 'cycling' ? '🚴' : '🏃'}
            title={latestTraining.title || (latestTraining.type.charAt(0).toUpperCase() + latestTraining.type.slice(1))}
            distance={`${latestTraining.distance} km`}
            time={formatDuration(latestTraining.duration)}
            date={formatDate(latestTraining.date)}
          />
        ) : (
          <Card>
            <ThemedText themeColor="textSecondary">Brak zarejestrowanych treningów.</ThemedText>
          </Card>
        )}

        {/* Quick Actions */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Szybki dostęp</ThemedText>
        </ThemedView>

        <ThemedView style={styles.actionGrid}>
          <Button
            title="Pływanie"
            // @ts-expect-error
            onPress={() => router.push("add-entry")}
            variant="secondary"
          />
          <Button
            title="Bieg"
            // @ts-expect-error
            onPress={() => router.push("add-entry")}
            variant="secondary"
          />
        </ThemedView>

        <ThemedView style={styles.actionGrid}>
          <Button
            title="Rower"
            // @ts-expect-error
            onPress={() => router.push("add-entry")}
            variant="secondary"
          />
          <Button
            title="Przerwij"
            // @ts-expect-error
            onPress={() => router.push("stats")}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  headerContent: {
    flex: 1,
    gap: Spacing.one,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
  },
  badgeCard: {
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: 8,
  },
  badgeIcon: {
    fontSize: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statItem: {
    flex: 1,
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.one,
  },
  viewMore: {
    fontSize: 12,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    justifyContent: 'space-between',
  },
});
