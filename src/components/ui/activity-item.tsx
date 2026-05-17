import { StyleSheet } from 'react-native';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export interface ActivityItemProps {
  icon: string;
  title: string;
  distance: string;
  time: string;
  date: string;
}

export function ActivityItem({
  icon,
  title,
  distance,
  time,
  date,
}: ActivityItemProps) {
  return (
    <Card>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText style={styles.icon}>{icon}</ThemedText>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="small" style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.date}>
              {date}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.stats}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="small" themeColor="textSecondary">
              Dystans
            </ThemedText>
            <ThemedText type="small" style={styles.statValue}>
              {distance}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="small" themeColor="textSecondary">
              Czas
            </ThemedText>
            <ThemedText type="small" style={styles.statValue}>
              {time}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  icon: {
    fontSize: 28,
  },
  titleContainer: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    gap: 4,
  },
  statValue: {
    fontWeight: '600',
  },
});
