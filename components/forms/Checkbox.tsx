import React from 'react';
import { View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Icon from '../ui/Icon';
import ThemedText from '../ui/ThemedText';

import { useUnistyles } from 'react-native-unistyles';
import { palette } from '@/lib/unistyles';

interface CheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  error?: string;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked = false,
  onChange,
  error,
  className = '',
  style,
}) => {
  const { theme } = useUnistyles();

  // Internal state if no onChange provided (for mockups)
  const [internalChecked, setInternalChecked] = React.useState(checked);

  // Use either the controlled prop or internal state
  const isChecked = onChange ? checked : internalChecked;

  const handlePress = () => {
    if (onChange) {
      onChange(!isChecked);
    } else {
      setInternalChecked(!internalChecked);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={handlePress} style={styles.row}>
        <View
          style={[
            styles.box,
            isChecked ? styles.boxChecked : styles.boxUnchecked,
            error && styles.boxError,
          ]}>
          {isChecked && (
            <View style={styles.checkContainer}>
              <Icon name="Check" size={14} color="#fff" />
            </View>
          )}
        </View>
        <ThemedText style={styles.label}>{label}</ThemedText>
      </Pressable>

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
};

export default Checkbox;

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: theme.spacing.global,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  box: {
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
  },
  boxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.highlight,
  },
  boxUnchecked: {
    borderColor: theme.colors.placeholder,
  },
  boxError: {
    borderColor: palette.red500,
  },
  checkContainer: {
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.highlight,
  },
  label: {
    marginLeft: 8,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: palette.red500,
  },
}));
