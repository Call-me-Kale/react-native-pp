import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
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
      // Redirection is handled automatically by RootLayout's AuthGuard
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
          <ThemedText type="title" style={styles.title}>
            TRITRACK
          </ThemedText>
          <ThemedText
            type="subtitle"
            themeColor="textSecondary"
            style={styles.subtitle}
          >
            Przygotuj się do triathlonu z nami!
          </ThemedText>
        </ThemedView>

        {/* Error Message */}
        {error && (
          <ThemedView
            style={[styles.errorContainer, { backgroundColor: "#FF6B6B" }]}
          >
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </ThemedView>
        )}

        {/* Form Section */}
        <ThemedView style={styles.formSection}>
          <Input
            label="Login"
            placeholder="login..."
            value={username}
            onChangeText={setUsername}
          />

          <Input
            label="Hasło"
            placeholder="hasło..."
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

          <Button
            title="Nie masz konta? Zarejestruj się"
            onPress={() => router.push("/register")}
            variant="secondary"
          />
        </ThemedView>

        {/* Help Text */}
        <ThemedView style={styles.helpSection}>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.helpText}
          ></ThemedText>
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
