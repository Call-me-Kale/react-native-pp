import { StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from '@/components/ui/card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

export interface ActivityItemProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
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
  const theme = useTheme();

  const getIconColor = () => {
    switch (icon) {
      case 'waves': return '#3B82F6';
      case 'bike': return '#10B981';
      case 'run': return '#F97316';
      default: return theme.text;
    }
  };

  return (
    <Card>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedView style={[styles.iconContainer, { backgroundColor: theme.backgroundElement }]}>
            <MaterialCommunityIcons name={icon} size={24} color={getIconColor()} />
          </ThemedView>
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.title}>
              {title}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.date}>
              {date}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        
        <ThemedView style={styles.stats}>
          <ThemedView style={styles.statItem}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              DYSTANS
            </ThemedText>
            <ThemedText style={styles.statValue}>
              {distance}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statItem}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>
              CZAS
            </ThemedText>
            <ThemedText style={styles.statValue}>
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
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    gap: 24,
    paddingLeft: 56, // Align with title
  },
  statItem: {
    gap: 2,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
