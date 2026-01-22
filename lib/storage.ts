import { createMMKV } from 'react-native-mmkv';
import { UnistylesRuntime } from 'react-native-unistyles';

export const storage = createMMKV({ id: 'app-preferences' });

export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_KEY = 'theme-preference';
const VALID_VALUES: ThemePreference[] = ['light', 'dark', 'system'];

export const getThemePreference = (): ThemePreference => {
  const value = storage.getString(THEME_KEY);
  // Validate: if missing or invalid, return default and fix storage
  if (!value || !VALID_VALUES.includes(value as ThemePreference)) {
    storage.set(THEME_KEY, 'system'); // Fix corrupted value
    return 'system';
  }
  return value as ThemePreference;
};

export const setThemePreference = (preference: ThemePreference): void => {
  storage.set(THEME_KEY, preference);
};

export const setThemeMode = (mode: ThemePreference): void => {
  setThemePreference(mode);

  if (mode === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(mode);
  }
};
