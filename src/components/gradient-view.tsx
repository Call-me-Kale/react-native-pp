import React from 'react';
import { StyleSheet, ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/use-theme';

export interface GradientViewProps extends ViewProps {
  children?: React.ReactNode;
}

export function GradientView({ children, style, ...props }: GradientViewProps) {
  const theme = useTheme();
  
  // Define light/dark gradients based on theme
  const colors = (theme.background === '#ffffff' 
    ? ['#F8F9FA', '#E9ECEF'] 
    : ['#1A1B1E', '#101113']) as [string, string, ...string[]];

  return (
    <LinearGradient
      colors={colors}
      style={[styles.container, style]}
      {...props}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
