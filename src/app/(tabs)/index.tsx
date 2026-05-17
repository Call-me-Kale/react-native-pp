import { StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActivityItem } from '@/components/ui/activity-item';
import { Spacing } from '@/constants/theme';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

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
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.headerContent}>
            <ThemedText style={styles.greeting}>Cześć, Zawodnikul</ThemedText>
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
                DYSTANS
              </ThemedText>
              <ThemedText style={styles.statValue}>124.5 km</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText type="small" themeColor="textSecondary">
                KALORIE
              </ThemedText>
              <ThemedText style={styles.statValue}>4 520 kcal</ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Ostatni training */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ostatni training</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.viewMore}>
            Wczoras, 17:30
          </ThemedText>
        </ThemedView>

        <ActivityItem
          icon="🚴"
          title="Rower szosowy"
          distance="45.2 km"
          time="01:36:25"
          date="Wczoras, 17:30"
        />

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
