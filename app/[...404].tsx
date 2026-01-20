import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/Button';
import Header from '@/components/Header';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen />
      <Header title=" " showBackButton />
      <View style={styles.root}>
        <View style={styles.iconSpacer}>
          <Icon name="AlertCircle" strokeWidth={1} size={70} />
        </View>
        <ThemedText style={styles.title}>Page Not Found</ThemedText>
        <ThemedText style={styles.description}>
          The page you're looking for doesn't exist or has been moved.
        </ThemedText>
        <View style={styles.actions}>
          <Button title="Back to Home" href="/" size="medium" />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.global,
  },
  iconSpacer: {
    marginBottom: 32,
  },
  title: {
    marginBottom: 8,
    fontSize: 24,
    fontFamily: theme.fonts.bold,
  },
  description: {
    marginBottom: 32,
    width: '66.666%',
    textAlign: 'center',
    fontSize: 16,
    color: theme.colors.subtext,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));
