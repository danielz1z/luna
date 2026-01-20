import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Dimensions, TouchableWithoutFeedback, View, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import Icon, { IconName } from './Icon';

import useThemeColors from '@/app/contexts/ThemeColors';

const { width: windowWidth } = Dimensions.get('window');
type AnimatedFabProps = {
  icon: IconName;
  children: React.ReactNode;
  position?: 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft';
  iconSize?: number;
  backgroundColor?: string;
  iconColor?: string;
  style?: ViewStyle;
  onOpen?: () => void;
  onClose?: () => void;
};

const AnimatedFab: React.FC<AnimatedFabProps> = ({
  icon,
  children,
  position = 'bottomRight',
  iconSize = 24,
  backgroundColor,
  iconColor,
  onOpen,
  onClose,
  style,
}) => {
  const colors = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);

  // Default size of the FAB in collapsed state
  const baseSize = iconSize * 2;

  // Improved content height measurement
  const [contentHeight, setContentHeight] = useState(baseSize * 2);
  const contentMeasureRef = useRef<View>(null);
  const [isContentMeasured, setIsContentMeasured] = useState(false);

  // Animation values
  const animation = useSharedValue(0);

  // Cleanup animation value on unmount
  useEffect(() => {
    return () => {
      // Reset animation value before cleanup
      animation.value = 0;
    };
  }, []);

  // Reset animation when theme changes
  useEffect(() => {
    if (isOpen) {
      animation.value = withTiming(1, { duration: 300 });
    } else {
      animation.value = withTiming(0, { duration: 300 });
    }
  }, [colors.isDark]);

  // Measure content using an invisible clone
  useEffect(() => {
    if (contentMeasureRef.current && !isContentMeasured) {
      setTimeout(() => {
        if (contentMeasureRef.current) {
          contentMeasureRef.current.measure((x, y, width, height) => {
            if (height > 0) {
              // Add padding and set minimum height
              const newHeight = Math.max(baseSize * 1, height + 0);
              setContentHeight(newHeight);
              setIsContentMeasured(true);
            }
          });
        }
      }, 100);
    }
  }, [contentMeasureRef.current, isContentMeasured, baseSize]);

  // Handle toggle state
  const toggleOpen = useCallback(() => {
    const newValue = !isOpen;
    setIsOpen(newValue);

    // Run animation
    animation.value = withTiming(newValue ? 1 : 0, { duration: 300 });

    // Trigger callbacks if provided
    if (newValue && onOpen) {
      onOpen();
    } else if (!newValue && onClose) {
      onClose();
    }
  }, [isOpen, animation, onOpen, onClose]);

  const positionStyle = positionStyles[position];

  // Animated styles for the container
  const containerStyle = useAnimatedStyle(() => {
    // Width expands from a circle to a rectangle
    const width = interpolate(
      animation.value,
      [0, 1],
      [baseSize, windowWidth - 30],
      Extrapolate.CLAMP
    );

    // Use the measured content height for the expanded state
    const height = interpolate(
      animation.value,
      [0, 1],
      [baseSize, contentHeight],
      Extrapolate.CLAMP
    );

    // Border radius changes from circle to rounded rectangle
    const borderRadius = interpolate(
      animation.value,
      [0, 1],
      [baseSize / 2, 12],
      Extrapolate.CLAMP
    );

    return {
      width,
      height,
      borderRadius,
    };
  });

  // Animated styles for the icon
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      animation.value,
      [0, 1],
      [0, 45], // Rotate 45 degrees when open
      Extrapolate.CLAMP
    );

    const opacity = interpolate(animation.value, [0, 0.5, 1], [1, 0.3, 0], Extrapolate.CLAMP);

    return {
      transform: [{ rotate: `${rotate}deg` }],
      opacity,
    };
  });

  // Animated styles for the content
  const contentAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(animation.value, [0, 0.7, 1], [0, 0, 1], Extrapolate.CLAMP);

    const translateY = interpolate(animation.value, [0, 1], [20, 0], Extrapolate.CLAMP);

    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  const bgColor = backgroundColor || colors.highlight;

  return (
    <>
      {/* Hidden content measure view */}
      <View
        pointerEvents="none"
        style={[styles.measureContainer, { width: windowWidth - 30 }]}
        ref={contentMeasureRef}>
        <View style={styles.measureContent}>{children}</View>
      </View>

      <TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.fabContainer,
            positionStyle,
            containerStyle,
            // { backgroundColor: bgColor },
          ]}>
          <TouchableWithoutFeedback onPress={toggleOpen}>
            <Animated.View
              style={[styles.iconContainer, iconAnimatedStyle, style]}>
              <Icon name={icon} size={iconSize} color={iconColor || 'white'} />
            </Animated.View>
          </TouchableWithoutFeedback>

          {/**THIS IS CONTENT OF THE FAB */}
          <Animated.View
            style={[styles.contentContainer, contentAnimatedStyle, style]}>
            <Icon
              name="X"
              size={24}
              color="white"
              style={styles.closeIcon}
              onPress={toggleOpen}
            />
            {children}
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </>
  );
};

export default AnimatedFab;

const positionStyles = {
  bottomRight: { bottom: 16, right: 16 },
  bottomLeft: { bottom: 16, left: 16 },
  topRight: { top: 16, right: 16 },
  topLeft: { top: 16, left: 16 },
} as const;

const styles = StyleSheet.create((theme) => ({
  measureContainer: {
    position: 'absolute',
    left: -9999,
    opacity: 0,
  },
  measureContent: {
    paddingBottom: 40,
  },
  fabContainer: {
    position: 'absolute',
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.text,
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    position: 'absolute',
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contentContainer: {
    position: 'absolute',
    zIndex: 10,
    height: '100%',
    width: '100%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    padding: 24,
    paddingBottom: 0,
  },
  closeIcon: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 50,
  },
}));
