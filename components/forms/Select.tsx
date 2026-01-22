import * as NavigationBar from 'expo-navigation-bar';
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Animated,
  Platform,
  ViewStyle,
} from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { StyleSheet } from 'react-native-unistyles';

import { InputVariant } from './Input';

import { useUnistyles } from 'react-native-unistyles';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { palette, withOpacity } from '@/lib/unistyles';

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  style?: ViewStyle;
  variant?: InputVariant;
}

const Select: React.FC<SelectProps> = ({
  label,
  placeholder = '',
  options,
  value,
  onChange,
  error,
  style,
  variant = 'animated',
}) => {
  const { theme } = useUnistyles();
  const isDark = theme.isDark;
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedOption, setSelectedOption] = useState<SelectOption | undefined>(
    options.find((option) => option.value === value)
  );

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(theme.colors.bg);
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');

      return () => {
        // Reset to default theme color when component unmounts
        NavigationBar.setBackgroundColorAsync(theme.colors.bg);
        NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
      };
    }
  }, [isDark, theme.colors.bg]);

  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    if (variant !== 'classic') {
      Animated.timing(animatedLabelValue, {
        toValue: isFocused || selectedOption ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, selectedOption, animatedLabelValue, variant]);

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
    left: 12,
    paddingHorizontal: 8,
  };

  const underlinedLabelStyle = {
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
    left: 0,
    paddingHorizontal: 0,
  };

  const handleSelect = (option: SelectOption) => {
    setSelectedOption(option);
    onChange(option.value);
    actionSheetRef.current?.hide();
  };

  const handlePress = () => {
    setIsFocused(true);
    actionSheetRef.current?.show();
  };

  const handleClose = () => {
    setIsFocused(false);
  };

  // Render the action sheet
  const renderActionSheet = () => (
    <ActionSheet
      ref={actionSheetRef}
      onClose={handleClose}
      isModal
      enableGesturesInScrollView
      statusBarTranslucent
      drawUnderStatusBar={false}
      containerStyle={{
        backgroundColor: theme.colors.bg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}
      animated
      openAnimationConfig={{
        stiffness: 3000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
      }}
      closeAnimationConfig={{
        stiffness: 1000,
        damping: 500,
        mass: 3,
        overshootClamping: true,
      }}>
      <View style={styles.sheetContent}>
        {options.map((option) => (
          <Pressable
            key={option.value}
            onPress={() => handleSelect(option)}
            style={[
              styles.sheetOption,
              selectedOption?.value === option.value && styles.sheetOptionSelected,
            ]}>
            <ThemedText>{option.label}</ThemedText>
          </Pressable>
        ))}
      </View>
    </ActionSheet>
  );

  // Classic variant
  if (variant === 'classic') {
    return (
      <View style={[styles.container, style]}>
        {label && <ThemedText style={styles.classicLabel}>{label}</ThemedText>}
        <View style={styles.relative}>
          <TouchableOpacity
            onPress={handlePress}
            style={[
              styles.field,
              isFocused ? styles.fieldFocused : styles.fieldUnfocused,
              error && styles.fieldError,
            ]}>
            <ThemedText style={[styles.valueText, !selectedOption && styles.placeholderText]}>
              {selectedOption ? selectedOption.label : placeholder}
            </ThemedText>
            <Icon name="ChevronDown" size={20} />
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {renderActionSheet()}
      </View>
    );
  }

  // Underlined variant
  if (variant === 'underlined') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.relative}>
          <Pressable style={styles.labelPressableUnderlined} onPress={handlePress}>
            <Animated.Text
              style={[
                underlinedLabelStyle,
                styles.animatedLabelText,
                styles.animatedLabelTextUnderlined,
              ]}>
              {label}
            </Animated.Text>
          </Pressable>
          <TouchableOpacity
            onPress={handlePress}
            style={[
              styles.fieldUnderlined,
              isFocused ? styles.fieldFocused : styles.fieldUnfocused,
              error && styles.fieldError,
            ]}>
            <ThemedText style={[styles.valueText, !selectedOption && styles.placeholderText]}>
              {selectedOption ? selectedOption.label : ''}
            </ThemedText>
            <Icon name="ChevronDown" size={20} />
          </TouchableOpacity>
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {renderActionSheet()}
      </View>
    );
  }

  // Default animated variant
  return (
    <View style={[styles.container, style]}>
      <View style={styles.relative}>
        <Pressable style={styles.labelPressable} onPress={handlePress}>
          <Animated.Text style={[labelStyle, styles.animatedLabelText]}>{label}</Animated.Text>
        </Pressable>
        <TouchableOpacity
          onPress={handlePress}
          style={[
            styles.field,
            isFocused ? styles.fieldFocused : styles.fieldUnfocused,
            error && styles.fieldError,
          ]}>
          <ThemedText style={[styles.valueText, !selectedOption && styles.placeholderText]}>
            {selectedOption ? selectedOption.label : placeholder}
          </ThemedText>
          <Icon name="ChevronDown" size={20} />
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {renderActionSheet()}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: theme.spacing.md,
  },
  relative: {
    position: 'relative',
  },
  classicLabel: {
    marginBottom: 4,
    fontWeight: '500',
  },
  field: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldUnderlined: {
    height: 56,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 12,
  },
  fieldFocused: {
    borderColor: theme.colors.text,
  },
  fieldUnfocused: {
    borderColor: withOpacity(theme.colors.text, 0.6),
  },
  fieldError: {
    borderColor: palette.red500,
  },
  valueText: {
    fontSize: 16,
  },
  placeholderText: {
    color: theme.colors.subtext,
  },
  errorText: {
    marginTop: 4,
    fontSize: 14,
    color: palette.red500,
  },
  sheetContent: {
    padding: 16,
  },
  sheetOption: {
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sheetOptionSelected: {
    backgroundColor: theme.colors.secondary,
  },
  labelPressable: {
    zIndex: 40,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 4,
  },
  labelPressableUnderlined: {
    zIndex: 40,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 0,
  },
  animatedLabelText: {
    position: 'absolute',
    zIndex: 50,
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 4,
    color: theme.colors.text,
  },
  animatedLabelTextUnderlined: {
    paddingHorizontal: 0,
  },
}));

export default Select;
