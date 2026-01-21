import React from 'react';
import { Text, TextProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
  style?: any;
}

export default function ThemedText({ children, className, style, ...props }: ThemedTextProps) {
  return (
    <Text style={[styles.text, style]} {...props}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create((theme) => ({
  text: {
    color: theme.colors.text,
  },
}));
