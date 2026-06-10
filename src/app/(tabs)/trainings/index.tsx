import { StyleSheet, ScrollView, Platform, RefreshControl, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { ActivityItem } from '@/components/ui/activity-item';
import { Spacing } from '@/constants/theme';
import { apiService, TrainingEntry } from '@/services/api';

export default function TrainingsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const [trainings, setTrainings] = useState<TrainingEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTrainings = useCallback(async () => {
    try {
      const data = await apiService.getTrainingEntries();
      setTrainings(data);
    } catch (error) {
      console.error('Failed to fetch trainings:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTrainings();
    }, [fetchTrainings])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTrainings();
    setRefreshing(false);
  }, [fetchTrainings]);

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
    return date.toLocaleDateString('pl-PL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTrainingIcon = (type: string) => {
    switch (type) {
      case 'swimming': return 'waves';
      case 'cycling': return 'bike';
      case 'running': return 'run';
      default: return 'help-circle';
    }
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
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Twoje Treningi</ThemedText>
          <ThemedText themeColor="textSecondary">Historia wszystkich aktywności</ThemedText>
        </ThemedView>

        <ThemedView style={styles.list}>
          {trainings.length > 0 ? (
            trainings.map((item) => (
              <Pressable 
                key={item.id} 
                onPress={() => router.push({
                  pathname: "/trainings/[id]",
                  params: { id: item.id }
                })}
                style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              >
                <ActivityItem
                  icon={getTrainingIcon(item.type)}
                  title={item.title || (item.type.charAt(0).toUpperCase() + item.type.slice(1))}
                  distance={`${item.distance} km`}
                  time={formatDuration(item.duration)}
                  date={formatDate(item.date)}
                />
              </Pressable>
            ))
          ) : (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText themeColor="textSecondary">Brak zarejestrowanych treningów.</ThemedText>
            </ThemedView>
          )}
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
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  list: {
    gap: Spacing.two,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.four,
  },
});
