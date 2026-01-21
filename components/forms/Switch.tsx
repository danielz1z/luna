import React, { useState, useRef } from 'react';
import {
  View,
  Pressable,
  Animated,
  Switch as RNSwitch,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Icon, { IconName } from '../ui/Icon';
import ThemedText from '../ui/ThemedText';

import useThemeColors from '@/app/contexts/ThemeColors';
import { palette } from '@/lib/unistyles';

interface SwitchProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  label?: string;
  description?: string;
  icon?: IconName;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const Switch: React.FC<SwitchProps> = ({
  value,
  onChange,
  label,
  description,
  icon,
  disabled = false,
  className = '',
  style,
}) => {
  const colors = useThemeColors();
  const [isOn, setIsOn] = useState(value ?? false);
  const slideAnim = useRef(new Animated.Value((value ?? false) ? 1 : 0)).current;

  // Handle controlled vs uncontrolled state
  const isControlled = value !== undefined;
  const switchValue = isControlled ? value : isOn;

  const toggleSwitch = () => {
    if (disabled) return;

    const newValue = !switchValue;

    // Update internal state if uncontrolled
    if (!isControlled) {
      setIsOn(newValue);
    }

    // Call callback if provided
    onChange?.(newValue);

    // Animate the switch
    Animated.spring(slideAnim, {
      toValue: newValue ? 1 : 0,
      useNativeDriver: true,
      bounciness: 4,
      speed: 12,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleSwitch}
      disabled={disabled}
      style={[styles.container, disabled && styles.disabled, style]}>
      {icon && (
        <View style={styles.iconWrapper}>
          <Icon name={icon} size={20} color={colors.text} />
        </View>
      )}

      <View style={styles.textContent}>
        {label && <ThemedText style={styles.label}>{label}</ThemedText>}
        {description && (
          <ThemedText style={styles.description}>{description}</ThemedText>
        )}
      </View>

      <View style={styles.trackContainer}>
        <View style={[styles.track, switchValue ? styles.trackOn : styles.trackOff]} />
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1.2],
                    outputRange: [1, 21],
                  }),
                },
              ],
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};

export default Switch;

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  disabled: {
    opacity: 1,
  },
  iconWrapper: {
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  trackContainer: {
    height: 24,
    width: 40,
    borderRadius: 9999,
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
    backgroundColor: theme.colors.switch,
  },
  knob: {
    marginVertical: 2,
    height: 20,
    width: 20,
    borderRadius: 9999,
    backgroundColor: palette.white,
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
}));
