import React from 'react';
import { Text, TextProps } from 'react-native';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

export default function ThemedText({ children, className, ...props }: ThemedTextProps) {
  return (
    <Text className={`text-black dark:text-white ${className || ''}`} {...props}>
      {children}
    </Text>
  );
}
