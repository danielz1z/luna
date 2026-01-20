import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput as RNTextInput,
  Animated,
  Pressable,
  TextInputProps,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Icon from '../Icon';
import type { IconName } from '../Icon';
import ThemedText from '../ThemedText';

import useThemeColors from '@/app/contexts/ThemeColors';
import { palette, withOpacity } from '@/app/unistyles';

interface CustomTextInputProps extends TextInputProps {
  label: string;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  error?: string;
  isPassword?: boolean;
  className?: string;
  containerClassName?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
}

const TextInput: React.FC<CustomTextInputProps> = ({
  label,
  rightIcon,
  onRightIconPress,
  error,
  isPassword = false,
  className = '',
  containerClassName = '',
  value,
  onChangeText,
  style,
  inputStyle,
  ...props
}) => {
  const colors = useThemeColors();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<RNTextInput>(null);

  // Handle label animation
  useEffect(() => {
    Animated.timing(animatedLabelValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, animatedLabelValue]);

  const labelStyle = {
    top: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: animatedLabelValue.interpolate({
      inputRange: [0, 1],
      outputRange: [colors.placeholder, colors.text],
    }),
    left: 12, // Consistent left padding
    paddingHorizontal: 8, // Consistent padding on both sides
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine the right icon based on props and password state
  const renderRightIcon = () => {
    if (isPassword) {
      return (
        <Pressable onPress={togglePasswordVisibility} style={styles.rightIcon}>
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} color={colors.text} />
        </Pressable>
      );
    }

    if (rightIcon) {
      return (
        <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
          <Icon name={rightIcon} size={20} color={colors.text} />
        </Pressable>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.relative}>
        <Pressable
          style={styles.labelPressable}
          onPress={() => inputRef.current?.focus()}>
          <Animated.Text
            style={[labelStyle, styles.animatedLabelText]}>
            {label}
          </Animated.Text>
        </Pressable>

        <RNTextInput
          ref={inputRef}
          style={[
            styles.input,
            (isPassword || rightIcon) && styles.inputWithRightIcon,
            isFocused ? styles.inputFocused : styles.inputUnfocused,
            error && styles.inputError,
            inputStyle,
          ]}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor="transparent"
          {...props}
        />

        {renderRightIcon()}
      </View>

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
};

export default TextInput;

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: theme.spacing.global,
  },
  relative: {
    position: 'relative',
  },
  labelPressable: {
    zIndex: 40,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 4,
  },
  animatedLabelText: {
    position: 'absolute',
    zIndex: 50,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 4,
    color: theme.colors.text,
  },
  input: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    color: theme.colors.text,
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  inputFocused: {
    borderColor: theme.colors.text,
  },
  inputUnfocused: {
    borderColor: withOpacity(theme.colors.text, 0.4),
  },
  inputError: {
    borderColor: palette.red500,
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    top: 18,
    zIndex: 10,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: palette.red500,
  },
}));
