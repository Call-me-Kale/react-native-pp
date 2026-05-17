import { StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const containerPadding = Platform.select({
    web: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
    default: {
      paddingHorizontal: Spacing.four,
      paddingTop: Math.max(insets.top, Spacing.three),
      paddingBottom: insets.bottom + Spacing.three,
    },
  });

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.scrollContent, containerPadding]}
      bounces={false}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={styles.title}>Profil</ThemedText>
        </ThemedView>

        {/* User Info */}
        <Card style={styles.userCard}>
          <ThemedView style={styles.userInfo}>
            <ThemedText style={styles.avatar}>👤</ThemedText>
            <ThemedView style={styles.userDetails}>
              <ThemedText style={styles.userName}>{user?.username}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {user?.email || 'Brak adresu email'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Stats Summary */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Statystyki ogółem</ThemedText>
        </ThemedView>

        <Card>
          <ThemedView style={styles.statsGrid}>
            <ThemedView style={styles.statItem}>
              <ThemedText type="small" themeColor="textSecondary">
                Treningi
              </ThemedText>
              <ThemedText style={styles.statValue}>42</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText type="small" themeColor="textSecondary">
                Godziny
              </ThemedText>
              <ThemedText style={styles.statValue}>128</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText type="small" themeColor="textSecondary">
                Km
              </ThemedText>
              <ThemedText style={styles.statValue}>500</ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Settings */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ustawienia</ThemedText>
        </ThemedView>

        <Card>
          <Button
            title="Zmień hasło"
            onPress={() => {}}
            variant="secondary"
          />
        </Card>

        <Card>
          <Button
            title="Preferencje powiadomień"
            onPress={() => {}}
            variant="secondary"
          />
        </Card>

        <Card>
          <Button
            title="Eksportuj dane"
            onPress={() => {}}
            variant="secondary"
          />
        </Card>

        {/* Logout */}
        <ThemedView style={styles.section}>
          <Button
            title="Wyloguj"
            onPress={handleLogout}
            variant="danger"
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
    marginBottom: Spacing.two,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  userCard: {
    padding: Spacing.three,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatar: {
    fontSize: 48,
  },
  userDetails: {
    flex: 1,
    gap: Spacing.one,
  },
  userName: {
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
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
});
