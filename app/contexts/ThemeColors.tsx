import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

export const useThemeColors = () => {
  const { theme } = useUnistyles();

  const isDark = UnistylesRuntime.themeName === 'dark';

  return {
    icon: theme.colors.icon,
    bg: theme.colors.bg,
    invert: theme.colors.invert,
    secondary: theme.colors.secondary,
    state: theme.colors.state,
    sheet: theme.colors.sheet,
    highlight: theme.colors.highlight,
    lightDark: theme.colors.lightDark,
    border: theme.colors.border,
    text: theme.colors.text,
    placeholder: theme.colors.placeholder,
    switch: theme.colors.switch,
    chatBg: theme.colors.chatBg,
    isDark,
  };
};

export default useThemeColors;
