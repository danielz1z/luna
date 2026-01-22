import React, { createContext, useContext } from 'react';
import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useUnistyles();

  const isDark = theme.colors.primary === '#171717';

  const toggleTheme = () => {
    // Read current theme name INSIDE the function to avoid stale closure issues
    const currentIsDark = UnistylesRuntime.themeName === 'dark';
    if (UnistylesRuntime.hasAdaptiveThemes) {
      UnistylesRuntime.setAdaptiveThemes(false);
    }
    UnistylesRuntime.setTheme(currentIsDark ? 'light' : 'dark');
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
