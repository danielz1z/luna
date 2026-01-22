import '@/lib/unistyles';
import { Stack } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native-unistyles';

import useThemedNavigation from './hooks/useThemedNavigation';

import { DrawerProvider } from '@/app/contexts/DrawerContext';

function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();

  return (
    <>
      <ThemedStatusBar />
      <Stack screenOptions={screenOptions}>
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <DrawerProvider>
        <ThemedLayout />
      </DrawerProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingBottom: Platform.OS === 'ios' ? 0 : undefined,
  },
}));
