import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  View,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ThemeScrollerProps extends ScrollViewProps {
  children: React.ReactNode;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  contentContainerStyle?: ScrollViewProps['contentContainerStyle'];
  scrollEventThrottle?: number;
  headerSpace?: boolean;
  className?: string;
}

export default function ThemedScroller({
  children,
  className,
  onScroll,
  contentContainerStyle,
  scrollEventThrottle = 16,
  headerSpace = false,
  ...props
}: ThemeScrollerProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      style={[styles.scroller, { width: '100%' }]}
      bounces={false}
      overScrollMode="never"
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      contentContainerStyle={[headerSpace && { paddingTop: 70 }, contentContainerStyle]}
      {...props}>
      {children}
      <View style={styles.spacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create((theme) => ({
  scroller: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.global,
  },
  spacer: {
    height: 80,
    width: '100%',
  },
}));

export const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
