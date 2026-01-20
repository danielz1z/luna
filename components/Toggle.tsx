import React, { useState, useRef } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { palette } from '@/app/unistyles';

interface ToggleProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const Toggle: React.FC<ToggleProps> = ({ value, onChange, disabled = false, className = '' }) => {
  const [isActive, setIsActive] = useState(value ?? false);
  const slideAnim = useRef(new Animated.Value((value ?? false) ? 1 : 0)).current;

  // Handle controlled and uncontrolled modes
  const isControlled = value !== undefined;
  const isOn = isControlled ? value : isActive;

  const toggleSwitch = () => {
    if (disabled) return;

    const newValue = !isOn;
    if (!isControlled) {
      setIsActive(newValue);
    }
    onChange?.(newValue);

    Animated.spring(slideAnim, {
      toValue: newValue ? 1 : 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 12,
    }).start();
  };

  return (
    <Pressable
      onPress={toggleSwitch}
      style={[styles.container, disabled && styles.disabled]}>
      <View style={[styles.track, isOn ? styles.trackOn : styles.trackOff]} />
      <Animated.View
        style={[
          styles.knob,
          {
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [2, 21],
                }),
              },
            ],
          },
        ]}
      />
    </Pressable>
  );
};

export default Toggle;

const styles = StyleSheet.create((theme) => ({
  container: {
    height: 28,
    width: 48,
    borderRadius: 9999,
  },
  disabled: {
    opacity: 0.5,
  },
  track: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    borderRadius: 9999,
  },
  trackOn: {
    backgroundColor: theme.colors.highlight,
  },
  trackOff: {
    backgroundColor: theme.colors.secondary,
  },
  knob: {
    marginVertical: 2,
    height: 24,
    width: 24,
    borderRadius: 9999,
    backgroundColor: palette.white,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
}));
