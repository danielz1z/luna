import React, { useState } from 'react';
import { View, Pressable, Text, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import ThemedText from '../ThemedText';

interface CounterProps {
  label: string;
  value?: number;
  onChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export default function Counter({
  label,
  value: controlledValue,
  onChange,
  min = 0,
  max = 99,
  className,
  style,
}: CounterProps) {
  const [internalValue, setInternalValue] = useState<number | undefined>(undefined);

  // Handle controlled and uncontrolled modes
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (newValue: number | undefined) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const increment = () => {
    if (value === undefined) {
      handleChange(1);
    } else if (value < max) {
      handleChange(value + 1);
    }
  };

  const decrement = () => {
    if (value === 1) {
      handleChange(undefined);
    } else if (value !== undefined && value > min) {
      handleChange(value - 1);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.row}>
        <ThemedText style={styles.label}>{label}</ThemedText>
        <View style={styles.counter}>
          <Pressable
            onPress={decrement}
            style={styles.button}>
            <ThemedText style={styles.buttonText}>-</ThemedText>
          </Pressable>

          <View style={styles.valueWrapper}>
            <ThemedText style={styles.valueText}>
              {value === undefined ? 'Any' : value}
            </ThemedText>
          </View>

          <Pressable
            onPress={increment}
            style={styles.button}>
            <ThemedText style={styles.buttonText}>+</ThemedText>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '100%',
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  counter: {
    minWidth: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderRadius: 9999,
    backgroundColor: theme.colors.secondary,
    padding: 4,
  },
  button: {
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    fontSize: 18,
  },
  valueWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '500',
  },
}));
