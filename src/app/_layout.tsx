import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '@/stores/auth';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const rootSegment = segments[0];
  const inTabsGroup = rootSegment === '(tabs)';

  useEffect(() => {
    if (isLoading) return;

    console.log('AuthGuard state:', { 
      isAuthenticated, 
      isLoading, 
      rootSegment, 
      inTabsGroup,
      path: segments.join('/') 
    });

    if (!isAuthenticated && inTabsGroup) {
      console.log('AuthGuard: Redirecting to login (/)');
      router.replace('/');
    } else if (isAuthenticated && !inTabsGroup) {
      console.log('AuthGuard: Redirecting to app (/(tabs)/home)');
      router.replace('/(tabs)/home');
    }
  }, [isAuthenticated, segments, isLoading]);

  if (isLoading) return null;

  // Prevent rendering protected content while redirecting
  if (!isAuthenticated && inTabsGroup) return null;
  // Prevent rendering login/register while redirecting to app
  if (isAuthenticated && !inTabsGroup) return null;

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    console.log('RootLayout: App mounted, hiding splash screen');
    SplashScreen.hideAsync().catch(console.error);
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="register" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AuthGuard>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
