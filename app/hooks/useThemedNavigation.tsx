import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar } from 'react-native';

import { useUnistyles } from 'react-native-unistyles';
import { useTheme } from '@/app/contexts/ThemeContext';

/**
 * A hook that handles theme-dependent styling for navigation and status bars
 * Returns configuration objects and components for themed navigation
 */
export default function useThemedNavigation() {
  const { isDark } = useTheme();
  const { theme } = useUnistyles();

  // Set up status/navigation bar styling based on theme
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Set navigation bar color
      NavigationBar.setBackgroundColorAsync(theme.colors.bg);
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');

      // // Set status bar styling directly using the native StatusBar API
      // RNStatusBar.setBackgroundColor(theme.colors.bg, true);
      // RNStatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);

      // // Prevent translucency which can cause dimming
      // RNStatusBar.setTranslucent(true);
    }
  }, [isDark, theme.colors.bg]);

  // StatusBar component with appropriate theme styling
  const ThemedStatusBar = () => (
    <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor="transparent" translucent />
  );

  // Navigation container/stack screen options for themed backgrounds
  const screenOptions = {
    headerShown: false,
    backgroundColor: theme.colors.bg,
    contentStyle: {
      backgroundColor: theme.colors.bg,
    },
  };

  return {
    ThemedStatusBar,
    screenOptions,
    colors: theme.colors,
    isDark,
  };
}
