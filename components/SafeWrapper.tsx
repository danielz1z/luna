import { usePathname } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

export default function SafeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const bypassRoutes = [
    // '/screens/onboarding-start',
    '/modal',
    // '/fullscreen',
    // //'/(drawer)/(tabs)/index',
  ];

  const shouldBypass = bypassRoutes.includes(pathname);

  return (
    <SafeAreaView style={styles.container} edges={shouldBypass ? [] : undefined}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
}));
