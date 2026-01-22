// lib/storage.ts
// CRITICAL: This file must NOT import from lib/unistyles.ts to avoid circular dependency
import { createMMKV } from 'react-native-mmkv';

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
