import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.backgroundElement,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: '🏠',
        }}
      />
      <Tabs.Screen
        name="add-entry"
        options={{
          title: 'Dodaj',
          tabBarLabel: '➕',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Statystyki',
          tabBarLabel: '📊',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarLabel: '👤',
        }}
      />
    </Tabs>
  );
}
