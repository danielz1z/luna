import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { palette } from '@/app/unistyles';

type ScreenContentProps = {
  title: string;
  path: string;
  children?: React.ReactNode;
};

export const ScreenContent = ({ title, path, children }: ScreenContentProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.divider} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create(() => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  divider: {
    marginVertical: 28,
    height: 1,
    width: '80%',
    backgroundColor: palette.gray200,
  },
}));
