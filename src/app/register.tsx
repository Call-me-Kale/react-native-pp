import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/auth";

export default function RegisterScreen() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Błąd", "Wszystkie pola są wymagane.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Błąd", "Hasła nie są identyczne.");
      return;
    }

    // Backend-suggested validation
    const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert(
        "Słabe hasło", 
        "Hasło musi mieć min. 8 znaków, zawierać cyfrę i znak specjalny."
      );
      return;
    }

    try {
      clearError();
      await register({ username, email, password });
      // Successfully registered users are auto-logged in by the store
      // The RootLayout will pick up the state change and redirect
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
        <ThemedView style={styles.headerSection}>
          <ThemedText style={styles.logo}>TriTrack</ThemedText>
          <ThemedText type="title" style={styles.title}>
            REJESTRACJA
          </ThemedText>
          <ThemedText
            type="subtitle"
            themeColor="textSecondary"
            style={styles.subtitle}
          >
            Dołącz do społeczności triathlonistów
          </ThemedText>
        </ThemedView>

        {error && (
          <ThemedView style={[styles.errorContainer, { backgroundColor: '#FF6B6B' }]}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </ThemedView>
        )}

        <ThemedView style={styles.formSection}>
          <Input
            label="Nazwa użytkownika"
            placeholder="np. jan_kowalski"
            value={username}
            onChangeText={setUsername}
          />

          <Input
            label="Email"
            placeholder="twoj@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <Input
            label="Hasło"
            placeholder="Min. 8 znaków, cyfra, znak specjalny"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Input
            label="Potwierdź hasło"
            placeholder="Powtórz hasło"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <Button
            title="Zarejestruj się"
            onPress={handleRegister}
            loading={isLoading}
            variant="primary"
          />

          <Button
            title="Masz już konto? Zaloguj się"
            onPress={() => router.back()}
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
});