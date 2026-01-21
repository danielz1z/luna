import { Link } from 'expo-router';
import * as LucideIcons from 'lucide-react-native';
import { LucideProps } from 'lucide-react-native';
import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { useThemeColors } from '@/app/contexts/ThemeColors';

type IconVariant = 'plain' | 'bordered' | 'contained';
type IconSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
type IconName = Exclude<keyof typeof LucideIcons, 'createLucideIcon' | 'default'>;

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  variant?: IconVariant;
  iconSize?: IconSize;
  href?: string;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  strokeWidth?: number;
  fill?: string;
}

const Icon: React.FC<IconProps> = ({
  name,
  size,
  color,
  variant = 'plain',
  iconSize,
  href,
  onPress,
  disabled = false,
  className,
  style,
  strokeWidth = 2,
  fill = 'none',
}) => {
  const colors = useThemeColors();

  const sizeMap = {
    xs: { containerSize: 32, icon: 16 },
    s: { containerSize: 40, icon: 20 },
    m: { containerSize: 48, icon: 24 },
    l: { containerSize: 64, icon: 32 },
    xl: { containerSize: 80, icon: 40 },
    xxl: { containerSize: 96, icon: 48 },
  };

  const getSize = () => {
    if (iconSize && sizeMap[iconSize]) {
      return sizeMap[iconSize];
    }
    if (typeof size === 'number') {
      return { containerSize: 0, icon: size };
    }
    return { containerSize: 0, icon: 24 };
  };

  const getVariantStyle = () => {
    switch (variant) {
      case 'bordered':
        return styles.bordered;
      case 'contained':
        return styles.contained;
      default:
        return null;
    }
  };

  const { containerSize, icon } = getSize();

  // eslint-disable-next-line import/namespace -- Dynamic icon lookup by name is intentional
  const IconComponent = LucideIcons[name] as React.ComponentType<LucideProps>;

  const containerStyle = [
    styles.base,
    variant !== 'plain' && containerSize > 0 && { width: containerSize, height: containerSize },
    getVariantStyle(),
    style,
  ];

  const content = (
    <View style={containerStyle}>
      <IconComponent
        size={icon}
        color={color || colors.text}
        strokeWidth={strokeWidth}
        fill={fill}
      />
    </View>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable disabled={disabled}>{content}</Pressable>
      </Link>
    );
  }

  if (onPress) {
    return (
      <Pressable
        onPress={disabled ? undefined : onPress}
        disabled={disabled}
        style={containerStyle}>
        <IconComponent
          size={icon}
          color={color || colors.text}
          strokeWidth={strokeWidth}
          fill={fill}
        />
      </Pressable>
    );
  }

  return content;
};

const styles = StyleSheet.create((theme) => ({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bordered: {
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contained: {
    backgroundColor: theme.colors.secondary,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export default Icon;
export type { IconName };
