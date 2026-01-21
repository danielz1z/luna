import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

interface ThemeFooterProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

export default function ThemedFooter({ children, className, ...props }: ThemeFooterProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom }]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  footer: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.global,
    paddingTop: theme.spacing.global,
  },
}));
