import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useUnistyles, StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import { Chip } from '@/components/ui/Chip';
import { getThemePreference, setThemePreference, ThemePreference } from '@/lib/storage';

/**
 * Module-level function to programmatically change theme mode.
 * Persists to MMKV and updates Unistyles runtime.
 *
 * @param mode - 'light', 'dark', or 'system'
 */
export const setThemeMode = (mode: ThemePreference): void => {
  // 1. ALWAYS persist to MMKV first
  setThemePreference(mode);

  // 2. Update Unistyles based on mode
  if (mode === 'system') {
    // System mode: enable adaptive themes
    // Do NOT call setTheme() - let Unistyles follow device
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    // Manual mode: disable adaptive, then set specific theme
    // ORDER MATTERS: disable adaptive BEFORE setting theme
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(mode); // 'light' or 'dark'
  }
};

/**
 * ThemeSelector component with 3-way toggle (Light/Dark/System).
 * Manages local state and syncs with external theme changes.
 */
const ThemeSelector = () => {
  // REQUIRED: Subscribe to Unistyles theme updates
  const { theme, rt } = useUnistyles();

  // CRITICAL: Use LOCAL STATE for preference
  const [preference, setPreference] = useState<ThemePreference>(getThemePreference);

  // SYNC EFFECT: Keep local state in sync with external setThemeMode() calls
  // Key on BOTH rt.themeName AND rt.hasAdaptiveThemes to catch all cases
  useEffect(() => {
    const currentPref = getThemePreference();
    if (currentPref !== preference) {
      setPreference(currentPref);
    }
  }, [rt.themeName, rt.hasAdaptiveThemes, preference]);

  const handleSelect = (mode: ThemePreference) => {
    setPreference(mode); // Local state update → guaranteed re-render
    setThemeMode(mode); // Persists to MMKV + updates Unistyles
  };

  return (
    <View style={styles.container}>
      {(['light', 'dark', 'system'] as const).map((mode) => (
        <Chip
          key={mode}
          label={mode.charAt(0).toUpperCase() + mode.slice(1)} // "Light", "Dark", "System"
          isSelected={preference === mode}
          onPress={() => handleSelect(mode)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
}));

export default ThemeSelector;
