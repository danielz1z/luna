import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useUnistyles } from 'react-native-unistyles';
import { useTheme } from '@/app/contexts/ThemeContext';
import { palette } from '@/lib/unistyles';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  isVisible: boolean;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  isVisible,
}) => {
  const { theme } = useUnistyles();
  const { isDark } = useTheme();
  const translateY = useRef(new Animated.Value(-100)).current;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50';
      case 'error':
        return '#F44336';
      case 'warning':
        return '#FFC107';
      default:
        return '#2196F3';
    }
  };

  useEffect(() => {
    if (isVisible) {
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(duration),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        if (onHide) {
          onHide();
        }
      });
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          shadowColor: theme.colors.text,
        },
      ]}>
      <View style={styles.body}>
        <View style={[styles.dot, { backgroundColor: getBackgroundColor() }]} />
        <Text style={[styles.message, isDark ? styles.messageDark : styles.messageLight]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 24,
    zIndex: 99999999,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: theme.colors.text,
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  dot: {
    marginRight: 8,
    height: 8,
    width: 8,
    borderRadius: 9999,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
  },
  messageLight: {
    color: palette.white,
  },
  messageDark: {
    color: theme.colors.primary,
  },
}));

export default Toast;
