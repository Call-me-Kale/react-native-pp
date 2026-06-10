import { StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { useAuthStore } from '@/stores/auth';
import { apiService, TrainingStats } from '@/services/api';
import { InfoModal } from '@/components/ui/modal';
import { ChangePasswordModal } from '@/components/ui/change-password-modal';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState<TrainingStats | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await apiService.getTrainingStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch profile stats:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

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
    // Redirection happens automatically via RootLayout because isAuthenticated changes to false
  };

  const handleChangePassword = () => {
    setPasswordModalVisible(true);
  };

  const showComingSoon = () => {
    setModalVisible(true);
  };

  const totalTrainings = stats ? (stats.trainingsByType.swimming + stats.trainingsByType.cycling + stats.trainingsByType.running) : 0;
  const totalHours = stats ? Math.floor(stats.totalDuration / 60) : 0;

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
              <ThemedText style={styles.statValue}>{totalTrainings}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText type="small" themeColor="textSecondary">
                Godziny
              </ThemedText>
              <ThemedText style={styles.statValue}>{totalHours}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText type="small" themeColor="textSecondary">
                Km
              </ThemedText>
              <ThemedText style={styles.statValue}>{stats?.totalDistance.toFixed(0) || '0'}</ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Settings */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Ustawienia konta</ThemedText>
        </ThemedView>

        <Card style={styles.settingsCard}>
          <Button
            title="Zmień hasło"
            onPress={handleChangePassword}
            variant="secondary"
          />
          <ThemedView style={styles.buttonSpacer} />
          <Button
            title="Preferencje powiadomień"
            onPress={showComingSoon}
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

      <InfoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Funkcja niebawem"
        message="Pracujemy nad tym. Funkcja będzie dostępna już wkrótce!"
      />

      <ChangePasswordModal
        visible={passwordModalVisible}
        onClose={() => setPasswordModalVisible(false)}
      />
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
  settingsCard: {
    gap: Spacing.two,
  },
  buttonSpacer: {
    height: Spacing.two,
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
