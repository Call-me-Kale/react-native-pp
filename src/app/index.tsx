import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const insets = useSafeAreaInsets();
  const theme = useTheme();

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
            Welcome
          </ThemedText>
          <ThemedText
            type="subtitle"
            themeColor="textSecondary"
            style={styles.subtitle}
          >
            Sign in to your account
          </ThemedText>
        </ThemedView>

        {/* Form Section */}
        <ThemedView style={styles.formSection}>
          {/* Email Input */}
          <ThemedView style={styles.inputContainer}>
            <ThemedText type="default" style={styles.label}>
              Email
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.backgroundSelected,
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                },
              ]}
              placeholder="your@email.com"
              placeholderTextColor={theme.textSecondary}
              value={email}
              onChangeText={setEmail}
              editable={true}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </ThemedView>

          {/* Password Input */}
          <ThemedView style={styles.inputContainer}>
            <ThemedText type="default" style={styles.label}>
              Password
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: theme.backgroundSelected,
                  color: theme.text,
                  backgroundColor: theme.backgroundElement,
                },
              ]}
              placeholder="••••••••"
              placeholderTextColor={theme.textSecondary}
              value={password}
              onChangeText={setPassword}
              editable={true}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password"
            />
          </ThemedView>

          {/* Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              {
                backgroundColor: theme.text,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <ThemedText
              type="default"
              style={[styles.loginButtonText, { color: theme.background }]}
            >
              Sign In
            </ThemedText>
          </Pressable>

          {/* Forgot Password Link */}
          <Pressable style={styles.forgotPasswordContainer}>
            <ThemedText type="small" style={styles.forgotPassword}>
              Forgot password?
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Footer Section */}
        <ThemedView style={styles.footerSection}>
          <ThemedText
            type="small"
            themeColor="textSecondary"
            style={styles.footerText}
          >
            Don't have an account?{" "}
            <ThemedText type="small" style={styles.signUpLink}>
              Sign up
            </ThemedText>
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
    gap: Spacing.six,
    maxWidth: 400,
    alignSelf: "center",
    width: "100%",
  },
  headerSection: {
    gap: Spacing.two,
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  title: {
    textAlign: "center",
  },
  subtitle: {
    textAlign: "center",
  },
  formSection: {
    gap: Spacing.four,
  },
  inputContainer: {
    gap: Spacing.one,
  },
  label: {
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 16,
    fontWeight: "500",
  },
  loginButton: {
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.two,
  },
  loginButtonText: {
    fontWeight: "600",
    fontSize: 16,
  },
  forgotPasswordContainer: {
    alignItems: "center",
    marginTop: Spacing.one,
  },
  forgotPassword: {
    color: "#999",
  },
  footerSection: {
    alignItems: "center",
    marginTop: Spacing.four,
  },
  footerText: {
    textAlign: "center",
  },
  signUpLink: {
    fontWeight: "600",
  },
});
