import { Link } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, Animated, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';

import { palette } from '@/lib/unistyles';

interface FloatingButtonProps {
  icon: IconName;
  label?: string;
  onPress?: () => void;
  href?: string;
  bottom?: number;
  right?: number;
  visible?: boolean;
  isAnimated?: boolean;
  style?: ViewStyle;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon,
  label,
  onPress,
  href,
  bottom = 20,
  right = 20,
  visible = true,
  isAnimated = false,
  style,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isAnimated) return;

    Animated.parallel([
      Animated.spring(translateY, {
        toValue: visible ? 0 : 100,
        useNativeDriver: true,
        tension: 40,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, isAnimated]);

  const containerStyle = isAnimated
    ? {
        transform: [{ translateY }],
        opacity,
      }
    : {
        opacity: visible ? 1 : 0,
      };

  const buttonContent = (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, style]}>
      <Icon name={icon} size={20} color="white" />
      {label ? <ThemedText style={styles.label}>{label}</ThemedText> : null}
    </TouchableOpacity>
  );

  return (
    <Animated.View
      style={[
        styles.container,
        containerStyle,
        {
          bottom,
          right,
        } as ViewStyle,
      ]}>
      {href ? (
        <Link href={href} asChild>
          {buttonContent}
        </Link>
      ) : (
        buttonContent
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    zIndex: 1000,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors.highlight,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  label: {
    marginLeft: 8,
    color: palette.white,
  },
}));

export default FloatingButton;
