import { Link, router } from 'expo-router';
import React from 'react';
import { Image, Pressable, View, Text, ViewStyle, ImageSourcePropType } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import ThemedText from './ThemedText';

type AvatarProps = {
  size?: 'xxs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  src?: string | ImageSourcePropType; // Can be a URL string or required image
  name?: string; // for displaying initials if no image
  border?: boolean;
  bgColor?: string; // Optional background color (unused - kept for API compatibility)
  onPress?: () => void; // Optional onPress for Pressable or Link
  link?: string; // Optional URL for Link
  className?: string;
  style?: ViewStyle;
};

const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  src,
  name,
  border = false,
  bgColor,
  onPress,
  link,
  className,
  style,
}) => {
  // Avatar size styles
  const sizeMap = {
    xxs: { width: 28, height: 28 },
    xs: { width: 32, height: 32 },
    sm: { width: 40, height: 40 },
    md: { width: 48, height: 48 },
    lg: { width: 64, height: 64 },
    xl: { width: 80, height: 80 },
    xxl: { width: 96, height: 96 },
  };

  // Component for initials if image is not provided
  const renderInitials = () => {
    if (!name) return null;
    const initials = name
      .split(' ')
      .map((part) => part[0].toUpperCase())
      .join('');
    return <ThemedText style={styles.initialsText}>{initials}</ThemedText>;
  };

  // Convert the src prop to an appropriate Image source prop
  const getImageSource = (): ImageSourcePropType => {
    if (!src) {
      // Return a transparent 1x1 pixel as fallback instead of null
      return {
        uri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
      };
    }

    // If src is a string (URL), return it as a uri object
    if (typeof src === 'string') {
      return { uri: src };
    }

    // Otherwise it's already a required image or other valid source
    return src;
  };

  const avatarContent = (
    <View style={[styles.container, sizeMap[size], border && styles.border, style]}>
      {src ? <Image source={getImageSource()} style={styles.image} /> : renderInitials()}
    </View>
  );

  if (link) {
    return <Pressable onPress={() => router.push(link)}>{avatarContent}</Pressable>;
  }

  return onPress ? <Pressable onPress={onPress}>{avatarContent}</Pressable> : avatarContent;
};

const styles = StyleSheet.create((theme) => ({
  container: {
    flexShrink: 0,
    borderRadius: 9999,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  border: {
    borderWidth: 2,
    borderColor: theme.colors.secondary,
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius: 9999,
    resizeMode: 'cover',
  },
  initialsText: {
    textAlign: 'center',
    fontWeight: '500',
  },
}));

export default Avatar;
