import { StyleSheet, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { ActivityItem } from '@/components/ui/activity-item';
import { TrainingTypeButton } from '@/components/ui/training-type-button';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { apiService, TrainingEntry, TrainingStats, StreakData } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuthStore();

  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [latestTraining, setLatestTraining] = useState<TrainingEntry | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, streakData, entries] = await Promise.all([
        apiService.getTrainingStats(),
        apiService.getStreak(),
        apiService.getTrainingEntries(undefined, 1),
      ]);
      setStats(statsData);
      setStreak(streakData);
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

  const containerPadding = {
    paddingHorizontal: Spacing.four,
    paddingTop: Math.max(insets.top, Spacing.four),
    paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { weekday: 'long', hour: '2-digit', minute: '2-digit' });
  };

  const getTrainingIcon = (type: string) => {
    switch (type) {
      case 'swimming': return 'waves';
      case 'cycling': return 'bike';
      case 'running': return 'run';
      default: return 'help-circle';
    }
  };

  const renderMiniCalendar = () => {
    const days = [];
    const today = new Date();
    const primaryColor = '#1DB954';
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const hasTraining = stats?.trainingDates.some(td => td.date.split('T')[0] === dateStr);
      const isStreakDay = streak?.streakDates.some(sd => sd.split('T')[0] === dateStr);
      const isToday = i === 0;
      
      days.push(
        <ThemedView key={dateStr} style={styles.miniDayContainer}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.miniDayLabel}>
            {date.toLocaleDateString('pl-PL', { weekday: 'short' }).toUpperCase()}
          </ThemedText>
          <ThemedView 
            style={[
              styles.miniDayCircle,
              { backgroundColor: theme.backgroundElement },
              hasTraining && { backgroundColor: primaryColor },
              isStreakDay && { borderColor: '#FF5722', borderWidth: 1.5 },
              isToday && { borderColor: primaryColor, borderWidth: hasTraining ? 0 : 1.5 }
            ]}
          >
            <ThemedText 
              style={[
                styles.miniDayText,
                { color: theme.text },
                hasTraining && { color: '#FFF' },
                isStreakDay && !hasTraining && { color: '#FF5722' },
                isToday && !hasTraining && { color: primaryColor }
              ]}
            >
              {date.getDate()}
            </ThemedText>
          </ThemedView>
          {hasTraining && (
            <ThemedView style={styles.miniDayDot} />
          )}
        </ThemedView>
      );
    }
    return days;
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.scrollContent, containerPadding]}
      bounces={true}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1DB954']} />
      }
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.headerContent}>
            <ThemedText style={styles.greeting}>Cześć, {user?.username || 'Zawodnik'}!</ThemedText>
            <ThemedText themeColor="textSecondary" style={styles.subtitle}>
              {streak?.isActiveToday 
                ? 'Świetna robota dzisiaj!' 
                : 'Gotowy na kolejny trening?'}
            </ThemedText>
          </ThemedView>
          {streak && (
            <ThemedView style={styles.streakContainer}>
              <MaterialCommunityIcons 
                name="fire" 
                size={28} 
                color={streak.isActiveToday ? '#FF5722' : '#BDBDBD'} 
              />
              <ThemedText style={styles.streakValue}>{streak.currentStreak}</ThemedText>
            </ThemedView>
          )}
        </ThemedView>

        {/* Motivation Card */}
        {streak && !streak.isActiveToday && streak.currentStreak > 0 && (
          <Card style={[styles.motivationCard, { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' }]}>
            <ThemedView style={styles.motivationContent}>
              <MaterialCommunityIcons name="lightning-bolt" size={24} color="#F57C00" />
              <ThemedText style={styles.motivationText}>
                Nie pozwól, aby Twoja seria <ThemedText type="defaultSemiBold" style={{ color: '#E65100' }}>{streak.currentStreak} dni</ThemedText> treningów przepadła! Zrób coś dzisiaj!
              </ThemedText>
            </ThemedView>
          </Card>
        )}

        {/* Mini Calendar */}
        <Card style={styles.miniCalendarCard}>
          <ThemedView style={styles.miniCalendarRow}>
            {renderMiniCalendar()}
          </ThemedView>
        </Card>

        {/* Today Stats */}
        <Card style={styles.statsCard}>
          <ThemedView style={styles.statsGrid}>
            <ThemedView style={styles.statItem}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
                DYSTANS (DZIŚ)
              </ThemedText>
              <ThemedText style={styles.statValue}>
                {stats?.todayDistance.toFixed(1) || '0.0'} <ThemedText type="small" themeColor="textSecondary">km</ThemedText>
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.divider} />
            <ThemedView style={styles.statItem}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
                KALORIE (DZIŚ)
              </ThemedText>
              <ThemedText style={styles.statValue}>
                {stats?.todayCalories.toLocaleString() || '0'} <ThemedText type="small" themeColor="textSecondary">kcal</ThemedText>
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Ostatni training */}
        <ThemedView style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Ostatni trening</ThemedText>
          {latestTraining && (
            <ThemedText type="small" themeColor="textSecondary">
              {formatDate(latestTraining.date)}
            </ThemedText>
          )}
        </ThemedView>

        {latestTraining ? (
          <Pressable 
            onPress={() => router.push({
              pathname: "/trainings/[id]",
              params: { id: latestTraining.id }
            })}
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <ActivityItem
              icon={getTrainingIcon(latestTraining.type)}
              title={latestTraining.title || (latestTraining.type.charAt(0).toUpperCase() + latestTraining.type.slice(1))}
              distance={`${latestTraining.distance} km`}
              time={formatDuration(latestTraining.duration)}
              date={formatDate(latestTraining.date)}
            />
          </Pressable>
        ) : (
          <Card style={styles.emptyCard}>
            <ThemedText themeColor="textSecondary" style={styles.emptyText}>Brak zarejestrowanych treningów.</ThemedText>
          </Card>
        )}

        {/* Quick Actions */}
        <ThemedView style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Szybki dostęp</ThemedText>
        </ThemedView>

        <ThemedView style={styles.actionGrid}>
          <ThemedView style={styles.actionRow}>
            <TrainingTypeButton
              type="swimming"
              onPress={() => router.push({ pathname: "add-entry", params: { type: 'swimming' } })}
            />
            <TrainingTypeButton
              type="running"
              onPress={() => router.push({ pathname: "add-entry", params: { type: 'running' } })}
            />
          </ThemedView>
          <ThemedView style={styles.actionRow}>
            <TrainingTypeButton
              type="cycling"
              onPress={() => router.push({ pathname: "add-entry", params: { type: 'cycling' } })}
            />
            <Pressable
              onPress={() => router.push({ pathname: "trainings", params: { tab: 'equipment' } } as any)}
              style={({ pressed }) => [
                styles.equipmentCard,
                {
                  backgroundColor: theme.backgroundElement,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <MaterialCommunityIcons name="wrench-outline" size={32} color={theme.text} />
              <ThemedText type="defaultSemiBold" style={styles.equipmentLabel}>Sprzęt</ThemedText>
            </Pressable>
          </ThemedView>
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
    gap: Spacing.four,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 2,
    fontWeight: '500',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  motivationCard: {
    padding: Spacing.three,
    borderWidth: 1,
  },
  motivationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
  },
  motivationText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#E65100',
  },
  miniCalendarCard: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.one,
  },
  miniCalendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  miniDayContainer: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
    backgroundColor: 'transparent',
  },
  miniDayLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  miniDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDayText: {
    fontSize: 14,
    fontWeight: '700',
  },
  miniDayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FF5722',
    marginTop: -2,
  },
  statsCard: {
    paddingVertical: Spacing.three,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.one,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  emptyCard: {
    padding: Spacing.four,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  emptyText: {
    fontStyle: 'italic',
  },
  actionGrid: {
    gap: Spacing.two,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  equipmentCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  equipmentLabel: {
    fontSize: 14,
    marginTop: 8,
  },
});
