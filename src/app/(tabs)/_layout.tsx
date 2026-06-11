import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/hooks/use-theme';
import { ThemedView } from '@/components/themed-view';

function TabBarButton({ children, onPress }: { children: React.ReactNode, onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.addButtonContainer,
        { opacity: pressed ? 0.9 : 1 }
      ]}
    >
      <ThemedView style={styles.addButtonGradient}>
        {children}
      </ThemedView>
    </Pressable>
  );
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: 'transparent',
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 95 : 75,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          borderTopWidth: 0,
          position: 'absolute',
        },
        tabBarActiveTintColor: '#1DB954',
        tabBarInactiveTintColor: theme.textSecondary,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="trainings/index"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="list-outline" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-entry"
        options={{
          tabBarButton: (props) => (
            <TabBarButton {...props}>
              <Ionicons name="add" color="#FFF" size={32} />
            </TabBarButton>
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="stats-chart-outline" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" color={color} size={26} />
          ),
        }}
      />
      <Tabs.Screen name="equipment/index" options={{ href: null }} />
      <Tabs.Screen name="equipment/[id]" options={{ href: null }} />
      <Tabs.Screen name="trainings/[id]" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: 64,
  },
  addButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1DB954',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 10,
  },
});
