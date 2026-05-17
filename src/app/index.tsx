import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useSegments } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    try {
      clearError();
      await login({ username, password });
      // @ts-ignore
      router.replace("(tabs)");
    } catch (err) {
      // Error is handled by store
    }
  };

  const containerPadding = Platform.select({
    web: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.six },
    default: {
      paddingHorizontal: Spacing.four,
      paddingTop: Math.max(insets.top, Spacing.six),
      paddingBottom: insets.bottom + Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.scrollContent, containerPadding]}
      bounces={false}
    >
      <ThemedView style={styles.container}>
        {/* Header Section */}
        <ThemedView style={styles.headerSection}>
          <ThemedText style={styles.logo}>TriTrack</ThemedText>
          <ThemedText type="title" style={styles.title}>
            TRITRACK
          </ThemedText>
          <ThemedText
            type="subtitle"
            themeColor="textSecondary"
            style={styles.subtitle}
          >
            Twój cel: Iron Man
          </ThemedText>
        </ThemedView>

        {/* Error Message */}
        {error && (
          <ThemedView style={[styles.errorContainer, { backgroundColor: '#FF6B6B' }]}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </ThemedView>
        )}

        {/* Form Section */}
        <ThemedView style={styles.formSection}>
          <Input
            label="Login"
            placeholder="admin"
            value={username}
            onChangeText={setUsername}
          />

          <Input
            label="Hasło"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Zaloguj"
            onPress={handleLogin}
            loading={isLoading}
            variant="primary"
          />
        </ThemedView>

        {/* Help Text */}
        <ThemedView style={styles.helpSection}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.helpText}>
            Demo: login: admin, hasło: admin
          </ThemedText>
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
    justifyContent: "center",
  },
  container: {
    gap: Spacing.four,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  headerSection: {
    gap: Spacing.two,
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  logo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1DB954",
  },
  title: {
    textAlign: "center",
    fontSize: 32,
  },
  subtitle: {
    textAlign: "center",
    fontSize: 16,
  },
  formSection: {
    gap: Spacing.three,
  },
  errorContainer: {
    padding: Spacing.three,
    borderRadius: 8,
    marginBottom: Spacing.two,
  },
  errorText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  helpSection: {
    alignItems: "center",
    marginTop: Spacing.two,
  },
  helpText: {
    textAlign: "center",
    fontSize: 12,
  },
});
