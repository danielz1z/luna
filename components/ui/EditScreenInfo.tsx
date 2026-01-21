import { Link } from 'expo-router';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import ThemedText from './ThemedText';

export const EditScreenInfo = ({ path }: { path: string }) => {
  return (
    <View style={styles.container}>
      <Link href="/screens/home" asChild>
        <ThemedText style={styles.linkText}>Home</ThemedText>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  container: {},
  linkText: {
    fontSize: 36,
    fontWeight: '600',
  },
}));
