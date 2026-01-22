import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import ThemedText from './ThemedText';

import { useUnistyles } from 'react-native-unistyles';

interface PageLoaderProps {
  text?: string;
}

export default function PageLoader({ text }: PageLoaderProps) {
  const { theme } = useUnistyles();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={theme.colors.highlight} />
      {text && (
        <ThemedText style={styles.text}>{text}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
  },
  text: {
    marginTop: 16,
    color: theme.colors.subtext,
  },
}));
