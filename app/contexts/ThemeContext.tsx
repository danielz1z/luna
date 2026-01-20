import React, { createContext, useContext } from 'react';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useUnistyles();

  const isDark = UnistylesRuntime.themeName === 'dark';

  const toggleTheme = () => {
    if (UnistylesRuntime.hasAdaptiveThemes) {
      UnistylesRuntime.setAdaptiveThemes(false);
    }
    UnistylesRuntime.setTheme(isDark ? 'light' : 'dark');
  };

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
