import { StyleSheet } from 'react-native-unistyles';

const lightTheme = {
  colors: {
    highlight: '#0EA5E9',
    primary: '#f5f5f5',
    secondary: '#ffffff',
    darker: '#f5f5f5',
    text: '#000000',
    subtext: '#64748B',
    icon: 'black',
    bg: '#f5f5f5',
    invert: '#ffffff',
    state: 'rgba(0, 0, 0, 0.3)',
    sheet: '#ffffff',
    lightDark: 'white',
    border: '#E2E8F0',
    placeholder: 'rgba(0,0,0,0.4)',
    switch: '#ccc',
    chatBg: '#efefef',
  },
  spacing: {
    global: 16,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fonts: {
    regular: 'Outfit_400Regular',
    bold: 'Outfit_700Bold',
  },
} as const;

const darkTheme = {
  colors: {
    highlight: '#0EA5E9',
    primary: '#171717',
    secondary: '#323232',
    darker: '#000000',
    text: '#ffffff',
    subtext: '#A1A1A1',
    icon: 'white',
    bg: '#171717',
    invert: '#000000',
    state: 'rgba(255, 255, 255, 0.3)',
    sheet: '#262626',
    lightDark: '#262626',
    border: '#404040',
    placeholder: 'rgba(255,255,255,0.4)',
    switch: 'rgba(255,255,255,0.4)',
    chatBg: '#262626',
  },
  spacing: {
    global: 16,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fonts: {
    regular: 'Outfit_400Regular',
    bold: 'Outfit_700Bold',
  },
} as const;

type AppThemes = {
  light: typeof lightTheme;
  dark: typeof darkTheme;
};

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
}

StyleSheet.configure({
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  settings: {
    initialTheme: 'dark',
  },
});

export const withOpacity = (color: string, opacity: number): string => {
  if (color === 'white') return `rgba(255, 255, 255, ${opacity})`;
  if (color === 'black') return `rgba(0, 0, 0, ${opacity})`;

  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const palette = {
  red500: '#ef4444',
  green500: '#22c55e',
  yellow500: '#eab308',
  sky500: '#0ea5e9',
  teal300: '#5eead4',
  gray200: '#e5e5e5',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  neutral200: '#e5e5e5',
  neutral300: '#d4d4d4',
  neutral400: '#a3a3a3',
  neutral500: '#737373',
  white: '#ffffff',
  black: '#000000',
} as const;
