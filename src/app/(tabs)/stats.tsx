import { StyleSheet, ScrollView, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Spacing } from '@/constants/theme';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

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
          <ThemedText style={styles.title}>Zaawansowana Analityka</ThemedText>
        </ThemedView>

        {/* Main Stats */}
        <Card>
          <ThemedView style={styles.statsContainer}>
            <ThemedView style={styles.statBlock}>
              <ThemedText type="small" themeColor="textSecondary">
                DYSTANS CAŁKOWITY
              </ThemedText>
              <ThemedText style={styles.largeValue}>124.5 km</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                +12% od osi. typ.
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.divider} />

            <ThemedView style={styles.statBlock}>
              <ThemedText type="small" themeColor="textSecondary">
                SPALANE KALORIE
              </ThemedText>
              <ThemedText style={styles.largeValue}>4,520 kcal</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.positive}>
                🔥 Intensywny trening
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
            <ThemedView style={styles.breakdownItem}>
              <View style={[styles.colorDot, { backgroundColor: '#3B82F6' }]} />
              <ThemedText type="small">Pływanie</ThemedText>
              <ThemedText type="small" style={styles.percentage}>
                30%
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <View style={[styles.progress, { width: '30%', backgroundColor: '#3B82F6' }]} />
            </ThemedView>

            <ThemedView style={styles.breakdownItem}>
              <View style={[styles.colorDot, { backgroundColor: '#10B981' }]} />
              <ThemedText type="small">Rower</ThemedText>
              <ThemedText type="small" style={styles.percentage}>
                45%
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <View style={[styles.progress, { width: '45%', backgroundColor: '#10B981' }]} />
            </ThemedView>

            <ThemedView style={styles.breakdownItem}>
              <View style={[styles.colorDot, { backgroundColor: '#F97316' }]} />
              <ThemedText type="small">Bieg</ThemedText>
              <ThemedText type="small" style={styles.percentage}>
                55%
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.progressBar}>
              <View style={[styles.progress, { width: '55%', backgroundColor: '#F97316' }]} />
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Strefy Tętna */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Strefy Tętna (HR)</ThemedText>
        </ThemedView>

        <Card>
          <ThemedView style={styles.heartRateZones}>
            <ThemedView style={styles.zoneItem}>
              <ThemedText type="small">253</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                WZMACNIAJĄCA
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.zoneItem}>
              <ThemedText type="small">288</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                AEROWY
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.zoneItem}>
              <ThemedText type="small">1890</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                KARDIO
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.zoneItem}>
              <ThemedText type="small">224</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                MAKSYMALNY
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Wygląd Charts */}
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
