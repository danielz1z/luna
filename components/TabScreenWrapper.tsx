import { useIsFocused } from '@react-navigation/native';
import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import AnimatedView from './AnimatedView';
import type { AnimationType } from './AnimatedView';

interface TabScreenWrapperProps {
  children: React.ReactNode;
  animation?: AnimationType;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

export default function TabScreenWrapper({
  children,
  animation = 'fadeIn',
  duration = 300,
  delay = 0,
  style,
}: TabScreenWrapperProps) {
  const isFocused = useIsFocused();
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    if (isFocused) {
      setKey((prev) => prev + 1);
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <AnimatedView
        style={[styles.content, style]}
        key={key}
        animation={animation}
        duration={duration}
        delay={delay}>
        {children}
      </AnimatedView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
}));
