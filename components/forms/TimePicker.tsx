import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  Animated,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Modal from 'react-native-modal';
import { StyleSheet } from 'react-native-unistyles';

import { InputVariant } from './Input';

import { useUnistyles } from 'react-native-unistyles';
import { Button } from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { palette, withOpacity } from '@/lib/unistyles';

interface TimePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  is24Hour?: boolean;
  disabled?: boolean;
  containerClassName?: string;
  variant?: InputVariant;
  style?: StyleProp<ViewStyle>;
}

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select time',
  error,
  is24Hour = false,
  disabled = false,
  containerClassName = '',
  variant = 'animated',
  style,
}) => {
  const [isTimePickerVisible, setTimePickerVisible] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useUnistyles();
  const animatedLabelValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    if (variant !== 'classic') {
      Animated.timing(animatedLabelValue, {
        toValue: isFocused || value ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [isFocused, value, animatedLabelValue, variant]);

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

  const showTimePicker = () => {
    if (disabled) return;
    setIsFocused(true);
    setTimePickerVisible(true);
  };

  const hideTimePicker = () => {
    setIsFocused(false);
    setTimePickerVisible(false);
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      hideTimePicker();
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleConfirm = () => {
    onChange(tempDate);
    hideTimePicker();
  };

  const formattedTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: !is24Hour,
    });
  };

  // Helper function to render time picker
  const renderTimePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          isVisible={isTimePickerVisible}
          onBackdropPress={hideTimePicker}
          style={{ margin: 0, justifyContent: 'flex-end' }}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={hideTimePicker}
                textClassName="text-base font-normal"
              />
              <ThemedText style={styles.sheetTitle}>{label || 'Select Time'}</ThemedText>
              <Button
                title="Done"
                variant="ghost"
                onPress={handleConfirm}
                textClassName="text-base font-semibold"
              />
            </View>
            <DateTimePicker
              value={tempDate}
              mode="time"
              is24Hour={is24Hour}
              display="spinner"
              onChange={handleTimeChange}
              themeVariant={theme.isDark ? 'dark' : 'light'}
              style={{ backgroundColor: theme.colors.bg }}
            />
          </View>
        </Modal>
      );
    } else {
      return (
        isTimePickerVisible && (
          <DateTimePicker
            value={value || new Date()}
            mode="time"
            is24Hour={is24Hour}
            display="default"
            onChange={handleTimeChange}
          />
        )
      );
    }
  };

  // Classic variant
  if (variant === 'classic') {
    return (
      <View style={[styles.container, style]}>
        {label && <ThemedText style={styles.classicLabel}>{label}</ThemedText>}
        <View style={styles.relative}>
          <TouchableOpacity
            onPress={showTimePicker}
            disabled={disabled}
            style={[
              styles.fieldBase,
              styles.fieldClassic,
              isFocused ? styles.fieldFocused : styles.fieldUnfocused,
              error && styles.fieldError,
              disabled && styles.fieldDisabled,
            ]}>
            <ThemedText style={[styles.valueText, !value && styles.placeholderText]}>
              {value ? formattedTime(value) : placeholder}
            </ThemedText>
          </TouchableOpacity>
          <Pressable style={styles.iconRight}>
            <Icon name="Clock" size={20} color={theme.colors.text} />
          </Pressable>
        </View>
        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
        {renderTimePicker()}
      </View>
    );
  }

  // Underlined variant
  if (variant === 'underlined') {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.relative}>
          <Pressable
            style={styles.labelPressableUnderlined}
            onPress={showTimePicker}>
            <Animated.Text
              style={[underlinedLabelStyle, styles.animatedLabelTextUnderlined]}>
              {label}
            </Animated.Text>
          </Pressable>
          <TouchableOpacity
            onPress={showTimePicker}
            disabled={disabled}
            style={[
              styles.fieldBase,
              styles.fieldUnderlined,
              isFocused ? styles.fieldFocused : styles.fieldUnfocused,
              error && styles.fieldError,
              disabled && styles.fieldDisabled,
            ]}>
            <ThemedText style={[styles.valueText, !value && styles.placeholderText]}>
              {value ? formattedTime(value) : ''}
            </ThemedText>
          </TouchableOpacity>
          <Pressable style={styles.iconRightUnderlined}>
            <Icon name="Clock" size={20} color={theme.colors.text} />
          </Pressable>
        </View>
        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
        {renderTimePicker()}
      </View>
    );
  }

  // Default animated variant
  return (
    <View style={[styles.container, style]}>
      <View style={styles.relative}>
        <Pressable
          style={styles.labelPressable}
          onPress={showTimePicker}>
          <Animated.Text
            style={[labelStyle, styles.animatedLabelText]}>
            {label}
          </Animated.Text>
        </Pressable>
        <TouchableOpacity
          onPress={showTimePicker}
          disabled={disabled}
          style={[
            styles.fieldBase,
            styles.fieldClassic,
            isFocused ? styles.fieldFocused : styles.fieldUnfocused,
            error && styles.fieldError,
            disabled && styles.fieldDisabled,
          ]}>
          <ThemedText style={[styles.valueText, !value && styles.placeholderText]}>
            {value ? formattedTime(value) : ''}
          </ThemedText>
        </TouchableOpacity>
        <Pressable style={styles.iconRight}>
          <Icon name="Clock" size={20} color={theme.colors.text} />
        </Pressable>
      </View>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
      {renderTimePicker()}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: theme.spacing.global,
  },
  relative: {
    position: 'relative',
  },
  classicLabel: {
    marginBottom: 4,
    fontWeight: '500',
  },
  fieldBase: {
    height: 56,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  fieldClassic: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    paddingRight: 40,
  },
  fieldUnderlined: {
    borderBottomWidth: 2,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 16,
    paddingRight: 40,
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
  fieldDisabled: {
    opacity: 0.5,
  },
  valueText: {
    fontSize: 16,
  },
  placeholderText: {
    color: theme.colors.subtext,
  },
  iconRight: {
    position: 'absolute',
    right: 12,
    top: 18,
    zIndex: 10,
  },
  iconRightUnderlined: {
    position: "absolute",
    top: 18,
    zIndex: 10,
    right: 0,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: palette.red500,
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
    position: "absolute",
    zIndex: 50,
    backgroundColor: theme.colors.bg,
    color: theme.colors.text,
    paddingHorizontal: 0,
  },
  sheetContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: theme.colors.bg,
  },
  sheetHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
    padding: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
}));
