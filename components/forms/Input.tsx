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

import Icon, { IconName } from '../ui/Icon';
import ThemedText from '../ui/ThemedText';

import { useUnistyles } from 'react-native-unistyles';
import { palette, withOpacity } from '@/lib/unistyles';

export type InputVariant = 'animated' | 'classic' | 'underlined';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  error?: string;
  isPassword?: boolean;
  className?: string;
  containerClassName?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  isMultiline?: boolean;
  variant?: InputVariant;
  inRow?: boolean;
}

const Input: React.FC<CustomTextInputProps> = ({
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
  isMultiline = false,
  variant = 'animated',
  inRow = false,
  ...props
}) => {
  const { theme } = useUnistyles();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [localValue, setLocalValue] = useState(value || '');
  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef<RNTextInput>(null);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Handle label animation
  useEffect(() => {
    if (variant !== 'classic') {
      const hasValue = localValue !== '';
      Animated.timing(animatedLabelValue, {
        toValue: isFocused || hasValue ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, localValue, animatedLabelValue, variant]);

  const handleChangeText = (text: string) => {
    setLocalValue(text);
    onChangeText?.(text);
  };

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
      outputRange: [theme.colors.placeholder, theme.colors.text],
    }),
    left: 12, // Consistent left padding
    paddingHorizontal: 8, // Consistent padding on both sides
    position: 'absolute' as 'absolute',
    zIndex: 50,
    backgroundColor: theme.colors.bg,
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Determine the right icon based on props and password state
  const renderRightIcon = () => {
    if (isPassword) {
      return (
        <Pressable
          onPress={togglePasswordVisibility}
          style={[
            styles.rightIcon,
            variant === 'classic' ? styles.rightIconPasswordClassic : styles.rightIconPassword,
          ]}>
          <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} color={theme.colors.text} />
        </Pressable>
      );
    }

    if (rightIcon) {
      return (
        <Pressable onPress={onRightIconPress} style={styles.rightIcon}>
          <Icon name={rightIcon} size={20} color={theme.colors.text} />
        </Pressable>
      );
    }

    return null;
  };

  // Classic non-animated input
  if (variant === 'classic') {
    return (
      <View style={[styles.container, style]}>
        {label && <ThemedText style={styles.classicLabel}>{label}</ThemedText>}
        <View style={styles.relative}>
          <RNTextInput
            ref={inputRef}
            style={[
              styles.inputBase,
              styles.inputClassic,
              isMultiline ? styles.inputMultiline : styles.inputSingle,
              (isPassword || rightIcon) && styles.inputWithRightIcon,
              isFocused ? styles.inputFocused : styles.inputUnfocused,
              error && styles.inputError,
              inputStyle,
            ]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={localValue}
            onChangeText={handleChangeText}
            secureTextEntry={isPassword && !showPassword}
            placeholderTextColor={theme.colors.placeholder}
            numberOfLines={isMultiline ? 4 : 1}
            textAlignVertical={isMultiline ? 'top' : 'center'}
            multiline={isMultiline}
            {...props}
          />
          {renderRightIcon()}
        </View>
        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
      </View>
    );
  }

  // Underlined input with only bottom border
  if (variant === 'underlined') {
    return (
      <View style={[styles.containerUnderlined, style]}>
        <View style={styles.relative}>
          <Pressable
            style={styles.underlinedLabelPressable}
            onPress={() => inputRef.current?.focus()}>
            <Animated.Text
              style={[
                {
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
                    outputRange: [theme.colors.placeholder, theme.colors.text],
                  }),
                  left: 0, // No left padding for underlined variant
                  paddingHorizontal: 0, // No horizontal padding
                  position: 'absolute',
                  zIndex: 50,
                  //backgroundColor: theme.colors.bg,
                },
                styles.underlinedAnimatedLabel,
              ]}>
              {label}
            </Animated.Text>
          </Pressable>

          <RNTextInput
            ref={inputRef}
            style={[
              styles.inputBase,
              styles.inputUnderlined,
              isMultiline ? styles.inputMultiline : styles.inputSingle,
              (isPassword || rightIcon) && styles.inputWithRightIcon,
              isFocused ? styles.inputFocused : styles.inputUnfocused,
              error && styles.inputError,
              inputStyle,
            ]}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={localValue}
            onChangeText={handleChangeText}
            secureTextEntry={isPassword && !showPassword}
            placeholderTextColor="transparent"
            numberOfLines={isMultiline ? 4 : 1}
            textAlignVertical={isMultiline ? 'top' : 'center'}
            multiline={isMultiline}
            {...props}
          />

          {renderRightIcon()}
        </View>

        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
      </View>
    );
  }

  // Default animated input (original)
  return (
    <View style={[styles.container, style]}>
      <Pressable
        style={styles.animatedLabelPressablePosition}
        onPress={() => inputRef.current?.focus()}>
        <Animated.Text style={[labelStyle, styles.animatedLabelText]}>{label}</Animated.Text>
      </Pressable>

      <RNTextInput
        ref={inputRef}
        style={[
          styles.inputBase,
          styles.inputClassic,
          isMultiline ? styles.inputMultiline : styles.inputSingle,
          (isPassword || rightIcon) && styles.inputWithRightIcon,
          isFocused ? styles.inputFocused : styles.inputUnfocused,
          error && styles.inputError,
          inputStyle,
        ]}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        value={localValue}
        onChangeText={handleChangeText}
        secureTextEntry={isPassword && !showPassword}
        placeholderTextColor="transparent"
        numberOfLines={isMultiline ? 4 : 1}
        textAlignVertical={isMultiline ? 'top' : 'center'}
        multiline={isMultiline}
        {...props}
      />

      {renderRightIcon()}

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
};

export default Input;

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'relative',
    marginBottom: theme.spacing.global,
  },
  containerUnderlined: {
    position: 'relative',
    marginBottom: 24,
  },
  relative: {
    position: 'relative',
  },
  classicLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  animatedLabelPressable: {
    zIndex: 40,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 4,
  },
  animatedLabelText: {
    backgroundColor: theme.colors.bg,
    color: theme.colors.text,
  },
  underlinedLabelPressable: {
    zIndex: 40,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 0,
  },
  underlinedAnimatedLabel: {
    color: theme.colors.text,
  },
  animatedLabelPressablePosition: {
    zIndex: 40,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 4,
    position: 'absolute',
    left: 4,
    top: 0,
  },
  inputBase: {
    backgroundColor: 'transparent',
    color: theme.colors.text,
  },
  inputClassic: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  inputUnderlined: {
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  inputSingle: {
    height: 56,
  },
  inputMultiline: {
    height: 144,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  inputWithRightIcon: {
    paddingRight: 40,
  },
  inputFocused: {
    borderColor: theme.colors.text,
  },
  inputUnfocused: {
    borderColor: withOpacity(theme.colors.text, 0.6),
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
  rightIconPasswordClassic: {
    top: 32,
  },
  rightIconPassword: {
    top: 18,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: palette.red500,
  },
}));
