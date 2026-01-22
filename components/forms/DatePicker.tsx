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
import { formatToYYYYMMDD } from '@/utils/date';
import { palette, withOpacity } from '@/lib/unistyles';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  maxDate?: Date;
  minDate?: Date;
  error?: string;
  containerClassName?: string;
  variant?: InputVariant;
  style?: StyleProp<ViewStyle>;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  maxDate,
  minDate,
  error,
  containerClassName = '',
  variant = 'animated',
  style,
}) => {
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
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

  const showDatePicker = () => {
    setIsFocused(true);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setIsFocused(false);
    setDatePickerVisible(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      hideDatePicker();
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
    hideDatePicker();
  };

  // Helper function to render date picker modal/component
  const renderDatePicker = () => {
    if (Platform.OS === 'ios') {
      return (
        <Modal
          isVisible={isDatePickerVisible}
          onBackdropPress={hideDatePicker}
          style={{ margin: 0, justifyContent: 'flex-end' }}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHeader}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={hideDatePicker}
                textClassName="text-base font-normal"
              />
              <ThemedText style={styles.sheetTitle}>{label || 'Select Date'}</ThemedText>
              <Button
                title="Done"
                variant="ghost"
                onPress={handleConfirm}
                textClassName="text-base font-semibold"
              />
            </View>
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              maximumDate={maxDate}
              minimumDate={minDate}
              themeVariant={theme.isDark ? 'dark' : 'light'}
              style={{ backgroundColor: theme.colors.bg }}
            />
          </View>
        </Modal>
      );
    } else {
      return (
        isDatePickerVisible && (
          <DateTimePicker
            value={value || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={maxDate}
            minimumDate={minDate}
          />
        )
      );
    }
  };

  // Classic non-animated variant
  if (variant === 'classic') {
    return (
      <View style={[styles.container, style]}>
        {label && <ThemedText style={styles.classicLabel}>{label}</ThemedText>}
        <View style={styles.relative}>
          <TouchableOpacity
            onPress={showDatePicker}
            style={[
              styles.fieldBase,
              styles.fieldClassic,
              isFocused ? styles.fieldFocused : styles.fieldUnfocused,
              error && styles.fieldError,
            ]}>
            <ThemedText style={[styles.valueText, !value && styles.placeholderText]}>
              {value ? formatToYYYYMMDD(value) : placeholder}
            </ThemedText>
          </TouchableOpacity>
          <Pressable style={styles.iconRight}>
            <Icon name="Calendar" size={20} color={theme.colors.text} />
          </Pressable>
        </View>
        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
        {renderDatePicker()}
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
            onPress={showDatePicker}>
            <Animated.Text
              style={[underlinedLabelStyle, styles.animatedLabelTextUnderlined]}>
              {label}
            </Animated.Text>
          </Pressable>
          <TouchableOpacity
            onPress={showDatePicker}
            style={[
              styles.fieldBase,
              styles.fieldUnderlined,
              isFocused ? styles.fieldFocused : styles.fieldUnfocused,
              error && styles.fieldError,
            ]}>
            <ThemedText style={[styles.valueText, !value && styles.placeholderText]}>
              {value ? formatToYYYYMMDD(value) : ''}
            </ThemedText>
          </TouchableOpacity>
          <Pressable style={styles.iconRightUnderlined}>
            <Icon name="Calendar" size={20} color={theme.colors.text} />
          </Pressable>
        </View>
        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
        {renderDatePicker()}
      </View>
    );
  }

  // Default animated variant
  return (
    <View style={[styles.container, style]}>
      <View style={styles.relative}>
        <Pressable
          style={styles.labelPressable}
          onPress={showDatePicker}>
          <Animated.Text
            style={[labelStyle, styles.animatedLabelText]}>
            {label}
          </Animated.Text>
        </Pressable>
        <TouchableOpacity
          onPress={showDatePicker}
          style={[
            styles.fieldBase,
            styles.fieldClassic,
            isFocused ? styles.fieldFocused : styles.fieldUnfocused,
            error && styles.fieldError,
          ]}>
          <ThemedText style={[styles.valueText, !value && styles.placeholderText]}>
            {value ? formatToYYYYMMDD(value) : ''}
          </ThemedText>
        </TouchableOpacity>
        <Pressable style={styles.iconRight}>
          <Icon name="Calendar" size={20} color={theme.colors.text} />
        </Pressable>
      </View>
      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
      {renderDatePicker()}
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
