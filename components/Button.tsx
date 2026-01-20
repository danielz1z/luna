import { Link, router } from 'expo-router';
import React from 'react';
import { Text, ActivityIndicator, TouchableOpacity, View, Pressable } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Icon, { IconName } from './Icon';

type RoundedOption = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ButtonProps {
  title?: string;
  onPress?: () => void;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  rounded?: RoundedOption;
  href?: string;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  iconStart?: IconName;
  iconEnd?: IconName;
  iconSize?: number;
  iconColor?: string;
  iconClassName?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  variant = 'primary',
  size = 'medium',
  rounded = 'lg',
  href,
  className = '',
  textClassName = '',
  disabled = false,
  iconStart,
  iconEnd,
  iconSize,
  iconColor,
  iconClassName = '',
  ...props
}) => {
  const getIconSize = () => {
    if (iconSize) return iconSize;
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 18;
      case 'large':
        return 20;
      default:
        return 18;
    }
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;
    return undefined;
  };

  const getButtonStyle = (): any[] => {
    const variantStyle = styles[`variant_${variant}` as keyof typeof styles];
    const sizeStyle = styles[`size_${size}` as keyof typeof styles];
    const roundedStyle = styles[`rounded_${rounded}` as keyof typeof styles];
    return [styles.base, variantStyle, sizeStyle, roundedStyle, disabled && styles.disabled];
  };

  const getTextStyle = () => {
    const textColorStyle =
      variant === 'outline' || variant === 'secondary' || variant === 'ghost'
        ? styles.textPrimary
        : styles.textInverse;
    return [styles.text, textColorStyle];
  };

  const ButtonContent = (
    <>
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'secondary' || variant === 'ghost'
              ? '#0EA5E9'
              : '#fff'
          }
        />
      ) : (
        <View style={styles.contentContainer}>
          {iconStart && (
            <Icon
              name={iconStart}
              size={getIconSize()}
              color={getIconColor()}
              style={styles.iconStart}
            />
          )}

          <Text style={getTextStyle()}>{title}</Text>

          {iconEnd && (
            <Icon
              name={iconEnd}
              size={getIconSize()}
              color={getIconColor()}
              style={styles.iconEnd}
            />
          )}
        </View>
      )}
    </>
  );

  if (href) {
    return (
      <TouchableOpacity
        disabled={loading || disabled}
        activeOpacity={0.8}
        style={getButtonStyle()}
        {...props}
        onPress={() => {
          router.push(href);
        }}>
        {ButtonContent}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading || disabled}
      activeOpacity={0.8}
      style={getButtonStyle()}
      {...props}>
      {ButtonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create((theme) => ({
  base: {
    position: 'relative',
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  variant_primary: {
    backgroundColor: theme.colors.invert,
  },
  variant_secondary: {
    backgroundColor: theme.colors.secondary,
  },
  variant_outline: {
    borderWidth: 1,
    borderColor: theme.colors.text,
    backgroundColor: 'transparent',
  },
  variant_ghost: {
    backgroundColor: 'transparent',
  },
  size_small: {
    paddingVertical: 8,
  },
  size_medium: {
    paddingVertical: 12,
  },
  size_large: {
    paddingVertical: 20,
  },
  rounded_none: {
    borderRadius: 0,
  },
  rounded_xs: {
    borderRadius: 2,
  },
  rounded_sm: {
    borderRadius: 4,
  },
  rounded_md: {
    borderRadius: 6,
  },
  rounded_lg: {
    borderRadius: 8,
  },
  rounded_xl: {
    borderRadius: 12,
  },
  rounded_full: {
    borderRadius: 9999,
  },
  disabled: {
    opacity: 0.5,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '500',
  },
  textPrimary: {
    color: theme.colors.text,
  },
  textInverse: {
    color: theme.colors.primary,
  },
  iconStart: {
    marginRight: 8,
  },
  iconEnd: {
    marginLeft: 8,
  },
}));
