import React from 'react';
import { View, ScrollView } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Avatar from './Avatar';
import { Chip } from './Chip';
import ThemedText from './ThemedText';

import { palette } from '@/lib/unistyles';

export default function ChipExamples() {
  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.title}>Chip Sizes</ThemedText>
      <View style={styles.row}>
        <Chip label="Extra Small" size="xs" />
        <Chip label="Small" size="sm" />
        <Chip label="Medium" size="md" />
        <Chip label="Large" size="lg" />
        <Chip label="Extra Large" size="xl" />
        <Chip label="2XL" size="xxl" />
      </View>

      <ThemedText style={styles.title}>Selected State</ThemedText>
      <View style={styles.row}>
        <Chip label="Not Selected" />
        <Chip label="Selected" isSelected />
      </View>

      <ThemedText style={styles.title}>With Icons</ThemedText>
      <View style={styles.row}>
        <Chip label="Home" icon="Home" />
        <Chip label="Settings" icon="Settings" isSelected />
        <Chip label="Search" icon="Search" size="lg" />
        <Chip label="Notifications" icon="Bell" size="xl" isSelected />
      </View>

      <ThemedText style={styles.title}>With Images</ThemedText>
      <View style={styles.row}>
        <Chip
          label="John Doe"
          image={{ uri: 'https://mighty.tools/mockmind-api/content/human/108.jpg' }}
        />
        <Chip
          label="Jane Smith"
          image={{ uri: 'https://mighty.tools/mockmind-api/content/human/107.jpg' }}
          isSelected
        />
        <Chip
          label="Mike Johnson"
          image={{ uri: 'https://mighty.tools/mockmind-api/content/human/106.jpg' }}
          size="lg"
        />
      </View>

      <ThemedText style={styles.title}>As Links</ThemedText>
      <View style={styles.row}>
        <Chip label="Go to Home" href="/" icon="Home" />
        <Chip label="Profile" href="/profile" icon="User" isSelected />
        <Chip label="Settings" href="/settings" icon="Settings" size="lg" />
      </View>

      <ThemedText style={styles.title}>With Custom Left Content</ThemedText>
      <View style={styles.row}>
        <Chip
          label="Custom Avatar"
          leftContent={
            <Avatar
              src="https://mighty.tools/mockmind-api/content/human/105.jpg"
              size="xs"
              style={styles.leftContentSpacing}
            />
          }
          size="lg"
        />
        <Chip
          label="Custom Badge"
          leftContent={<View style={styles.badge} />}
          isSelected
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '700',
  },
  row: {
    marginBottom: 24,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  leftContentSpacing: {
    marginRight: 8,
  },
  badge: {
    marginRight: 8,
    height: 12,
    width: 12,
    borderRadius: 9999,
    backgroundColor: palette.red500,
  },
}));
