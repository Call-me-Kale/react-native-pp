import { StyleSheet, ScrollView, Platform, View, RefreshControl, FlatList, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';
import { apiService, TrainingStats, TrainingDayInfo } from '@/services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const formatDateLocal = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

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

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  const containerPadding = Platform.select({
    web: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
    default: {
      paddingHorizontal: Spacing.four,
      paddingTop: Math.max(insets.top, Spacing.three),
      paddingBottom: insets.bottom + Spacing.three,
    },
  });

  const getPercentage = (count: number) => {
    const total = (stats?.trainingsByType?.swimming || 0) + 
                  (stats?.trainingsByType?.cycling || 0) + 
                  (stats?.trainingsByType?.running || 0);
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
                {getPercentage(stats?.trainingsByType?.swimming || 0)}%
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <View style={[styles.progress, { width: `${getPercentage(stats?.trainingsByType?.swimming || 0)}%`, backgroundColor: '#3B82F6' }]} />
            </ThemedView>

            {/* Rower */}
            <ThemedView style={styles.breakdownItem}>
              <View style={[styles.colorDot, { backgroundColor: '#10B981' }]} />
              <ThemedText type="small">Rower</ThemedText>
              <ThemedText type="small" style={styles.percentage}>
                {getPercentage(stats?.trainingsByType?.cycling || 0)}%
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <View style={[styles.progress, { width: `${getPercentage(stats?.trainingsByType?.cycling || 0)}%`, backgroundColor: '#10B981' }]} />
            </ThemedView>

            {/* Bieg */}
            <ThemedView style={styles.breakdownItem}>
              <View style={[styles.colorDot, { backgroundColor: '#F97316' }]} />
              <ThemedText type="small">Bieg</ThemedText>
              <ThemedText type="small" style={styles.percentage}>
                {getPercentage(stats?.trainingsByType?.running || 0)}%
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <View style={[styles.progress, { width: `${getPercentage(stats?.trainingsByType?.running || 0)}%`, backgroundColor: '#F97316' }]} />
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
          <ThemedText style={styles.sectionTitle}>Zużycie Sprzętu</ThemedText>
        </ThemedView>

        <Card>
          <ThemedView style={styles.equipmentList}>
            {stats?.equipmentUsage && stats.equipmentUsage.length > 0 ? (
              stats.equipmentUsage.map((item) => (
                <ThemedView key={item.id} style={styles.equipmentItem}>
                  <ThemedView style={styles.equipmentHeader}>
                    <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.trainingCount} treningów
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progress, 
                        { 
                          width: `${item.wearPercentage}%`, 
                          backgroundColor: item.wearPercentage > 80 ? '#EF4444' : '#1DB954' 
                        }
                      ]} 
                    />
                  </ThemedView>
                  <ThemedView style={styles.equipmentFooter}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {item.totalDistance.toFixed(0)} / {item.maxDistance} km
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                      {Math.round(item.wearPercentage)}% zużycia
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              ))
            ) : (
              <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center', padding: Spacing.two }}>
                Brak przypisanego sprzętu
              </ThemedText>
            )}
          </ThemedView>
        </Card>

        {/* Kalendarz Treningowy */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Kalendarz Treningowy</ThemedText>
        </ThemedView>

        <Card style={{ paddingHorizontal: 0 }}>
          <ThemedView style={styles.calendarContainer}>
            <ThemedView style={styles.calendarHeaderRow}>
              <Pressable onPress={() => changeMonth(-1)} style={styles.navButton}>
                <Ionicons name="chevron-back" size={24} color={theme.text} />
              </Pressable>
              <ThemedText type="defaultSemiBold" style={styles.monthLabel}>
                {new Intl.DateTimeFormat('pl-PL', { month: 'long', year: 'numeric' }).format(viewDate)}
              </ThemedText>
              <Pressable onPress={() => changeMonth(1)} style={styles.navButton}>
                <Ionicons name="chevron-forward" size={24} color={theme.text} />
              </Pressable>
            </ThemedView>

            <View style={{ paddingHorizontal: Spacing.four }}>
              {renderCalendar(viewDate.getFullYear(), viewDate.getMonth(), stats?.trainingDates || [])}
            </View>

            <ThemedView style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.dayDot, { backgroundColor: '#3B82F6', position: 'relative', bottom: 0 }]} />
                <ThemedText type="small" themeColor="textSecondary">Pływanie</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dayDot, { backgroundColor: '#10B981', position: 'relative', bottom: 0 }]} />
                <ThemedText type="small" themeColor="textSecondary">Rower</ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dayDot, { backgroundColor: '#F97316', position: 'relative', bottom: 0 }]} />
                <ThemedText type="small" themeColor="textSecondary">Bieg</ThemedText>
              </View>
            </ThemedView>
          </ThemedView>
        </Card>
      </ThemedView>
    </ScrollView>
  );
}

function renderCalendar(year: number, month: number, trainingDates: TrainingDayInfo[]) {
  const today = new Date();
  
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  
  // Adjust for Polish week (starts on Monday)
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  const daysJSX = [];
  // Weekday labels
  const weekDays = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'So', 'Nd'];
  daysJSX.push(
    <ThemedView key="weekdays" style={styles.weekDaysRow}>
      {weekDays.map(d => (
        <ThemedText key={d} type="small" themeColor="textSecondary" style={styles.weekDayLabel}>{d}</ThemedText>
      ))}
    </ThemedView>
  );

  const grid = [];
  let currentWeek = [];

  // Empty slots before first day
  for (let i = 0; i < startOffset; i++) {
    currentWeek.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
  }

  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    const currentDate = new Date(year, month, d);
    const dateStr = formatDateLocal(currentDate);
    
    const trainingDay = trainingDates.find(td => {
      if (!td || !td.date) return false;
      // Extract YYYY-MM-DD from the string, handle both formats
      const tdDateOnly = td.date.split('T')[0];
      return tdDateOnly === dateStr;
    });
    
    const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

    currentWeek.push(
      <View key={`day-${d}`} style={[styles.calendarDay, isToday && styles.todayCircle]}>
        <ThemedText 
          style={[
            styles.dayText, 
            !!trainingDay && styles.trainingDayText,
            isToday && styles.todayText
          ]}
        >
          {String(d)}
        </ThemedText>
        {!!trainingDay && trainingDay.disciplines && trainingDay.disciplines.length > 0 && (
          <View style={styles.dotsRow}>
            {trainingDay.disciplines.map((disc, idx) => (
              <View 
                key={`${d}-disc-${idx}`} 
                style={[
                  styles.dayDot, 
                  { backgroundColor: disc === 'swimming' ? '#3B82F6' : disc === 'cycling' ? '#10B981' : '#F97316' }
                ]} 
              />
            ))}
          </View>
        )}
      </View>
    );

    if (currentWeek.length === 7) {
      grid.push(<ThemedView key={`week-${grid.length}`} style={styles.weekRow}>{currentWeek}</ThemedView>);
      currentWeek = [];
    }
  }

  // Fill last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(<View key={`empty-end-${currentWeek.length}`} style={styles.calendarDay} />);
    }
    grid.push(<ThemedView key={`week-last`} style={styles.weekRow}>{currentWeek}</ThemedView>);
  }

  return (
    <View style={styles.calendarWrapper}>{daysJSX}{grid}</View>
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
    gap: Spacing.three,
  },
  equipmentItem: {
    gap: Spacing.one,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  equipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarContainer: {
    paddingVertical: Spacing.one,
  },
  calendarHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.two,
    marginBottom: Spacing.two,
  },
  monthLabel: {
    fontSize: 18,
    textTransform: 'capitalize',
  },
  navButton: {
    padding: Spacing.two,
  },
  calendarWrapper: {
    gap: Spacing.two,
  },
  monthHeader: {
    alignItems: 'center',
    paddingBottom: Spacing.one,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E1E6',
    paddingBottom: Spacing.one,
  },
  weekDayLabel: {
    width: 35,
    textAlign: 'center',
    fontWeight: '600',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  calendarDay: {
    width: 45,
    height: 45,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayText: {
    fontSize: 14,
  },
  todayCircle: {
    backgroundColor: 'rgba(29, 185, 84, 0.1)',
    borderRadius: 22.5,
  },
  todayText: {
    color: '#1DB954',
    fontWeight: '700',
  },
  trainingDayText: {
    fontWeight: '600',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    position: 'absolute',
    bottom: 4,
    justifyContent: 'center',
    width: '100%',
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  calendarLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.three,
    marginTop: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
