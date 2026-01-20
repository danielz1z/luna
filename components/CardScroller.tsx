import { Link } from 'expo-router';
import { ScrollView, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import ThemedText from './ThemedText';

interface CardScrollerProps {
  title?: string;
  img?: string;
  allUrl?: string;
  children: React.ReactNode;
  enableSnapping?: boolean;
  snapInterval?: number;
  style?: ViewStyle;
  space?: number;
}

export const CardScroller = ({
  title,
  img,
  allUrl,
  children,
  enableSnapping = false,
  snapInterval = 0,
  style,
  space = 10,
}: CardScrollerProps) => {
  return (
    <View style={[styles.container, { paddingTop: title ? 16 : 0 }, style]}>
      <View style={[styles.header, { marginBottom: title ? 8 : 0 }]}>
        {title && <ThemedText style={styles.title}>{title}</ThemedText>}
        {allUrl && (
          <View style={styles.linkContainer}>
            <Link href={allUrl} asChild>
              <ThemedText style={styles.linkText}>See all</ThemedText>
            </Link>
            <View style={styles.linkUnderline} />
          </View>
        )}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate={enableSnapping ? 0.85 : 'normal'}
        snapToInterval={enableSnapping ? snapInterval : undefined}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { columnGap: space }]}>
        {children}
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    width: '100%',
    flexDirection: 'column',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  linkContainer: {
    flexDirection: 'column',
  },
  linkText: {
    color: theme.colors.text,
  },
  linkUnderline: {
    marginTop: 1,
    height: 1,
    width: '100%',
    backgroundColor: theme.colors.text,
  },
  scrollView: {
    marginHorizontal: -16,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  spacer: {
    height: 1,
    width: 16,
  },
}));
