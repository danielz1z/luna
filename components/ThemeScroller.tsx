import React from 'react';
import {
  ScrollView,
  ScrollViewProps,
  View,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

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
      style={{ width: '100%' }}
      bounces={false}
      overScrollMode="never"
      className={`flex-1 bg-light-primary px-global dark:bg-dark-primary ${className || ''}`}
      onScroll={onScroll}
      scrollEventThrottle={scrollEventThrottle}
      contentContainerStyle={[headerSpace && { paddingTop: 70 }, contentContainerStyle]}
      {...props}>
      {children}
      <View className="h-20 w-full" />
    </ScrollView>
  );
}

export const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
