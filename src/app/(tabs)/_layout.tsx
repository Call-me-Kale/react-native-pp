import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';

import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundElement,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 0,
          paddingTop: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
        },
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <ThemedText style={{ fontSize: 28 }}>🏠</ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="add-entry"
        options={{
          tabBarIcon: ({ color }) => (
            <ThemedText style={{ fontSize: 28 }}>➕</ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ color }) => (
            <ThemedText style={{ fontSize: 28 }}>📊</ThemedText>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <ThemedText style={{ fontSize: 28 }}>👤</ThemedText>
          ),
        }}
      />
    </Tabs>
  );
}
