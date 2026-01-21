import { Link } from 'expo-router';
import React, { ReactNode } from 'react';
import { Text, View, TouchableOpacity, ViewStyle, ImageSourcePropType } from 'react-native';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native-unistyles';

import Icon, { IconName } from './Icon';

import useThemeColors from '@/app/contexts/ThemeColors';
type ChipSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

interface ChipProps {
  label: string;
  isSelected?: boolean;
  className?: string;
  style?: ViewStyle;
  size?: ChipSize;
  href?: string;
  onPress?: () => void;
  icon?: IconName; // Correct icon type
  iconSize?: number;
  iconColor?: string;
  image?: ImageSourcePropType;
  imageSize?: number;
  leftContent?: ReactNode; // For custom left content
  selectable?: boolean; // New property for selectable chips
}

export const Chip = ({
  label,
  isSelected,
  className,
  style,
  size = 'md',
  href,
  onPress,
  icon,
  iconSize,
  iconColor,
  image,
  imageSize,
  leftContent,
  selectable,
}: ChipProps) => {
  const sizePadding = {
    xs: { paddingHorizontal: 6, paddingVertical: 2 },
    sm: { paddingHorizontal: 8, paddingVertical: 2 },
    md: { paddingHorizontal: 12, paddingVertical: 4 },
    lg: { paddingHorizontal: 16, paddingVertical: 6 },
    xl: { paddingHorizontal: 20, paddingVertical: 8 },
    xxl: { paddingHorizontal: 24, paddingVertical: 10 },
  };

  const textSizes = {
    xs: 12,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
  };

  const getDefaultIconSize = () => {
    const sizes = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24 };
    return iconSize || sizes[size];
  };

  const getDefaultImageSize = () => {
    const sizes = { xs: 16, sm: 18, md: 20, lg: 24, xl: 28, xxl: 32 };
    return imageSize || sizes[size];
  };

  const [selected, setSelected] = React.useState(isSelected || false);

  const handlePress = () => {
    if (selectable) {
      setSelected(!selected);
    }
    onPress && onPress();
  };

  const isChipSelected = selectable ? selected : isSelected;
  const colors = useThemeColors();

  const renderLeftContent = () => {
    if (leftContent) {
      return leftContent;
    }

    if (icon) {
      return (
        <Icon
          name={icon}
          size={getDefaultIconSize()}
          color={iconColor || colors.icon}
          style={styles.iconLeft}
        />
      );
    }

    if (image) {
      return (
        <Image
          source={image}
          style={[
            styles.imageLeft,
            {
              width: getDefaultImageSize(),
              height: getDefaultImageSize(),
            },
          ]}
        />
      );
    }

    return null;
  };

  const chipContent = (
    <>
      <View style={styles.contentContainer}>
        {renderLeftContent()}
        <Text
          style={[
            { fontSize: textSizes[size] },
            isChipSelected ? styles.textSelected : styles.textUnselected,
          ]}>
          {label}
        </Text>
      </View>
    </>
  );

  const chipWrapper = (children: ReactNode) => (
    <View style={style}>
      <View
        style={[
          sizePadding[size],
          styles.chipContainer,
          isChipSelected ? styles.chipSelected : styles.chipUnselected,
        ]}>
        {children}
      </View>
    </View>
  );

  if (href) {
    return (
      <Link href={href} asChild>
        <TouchableOpacity activeOpacity={0.7}>{chipWrapper(chipContent)}</TouchableOpacity>
      </Link>
    );
  }

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7} disabled={!onPress && !selectable}>
      {chipWrapper(chipContent)}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create((theme) => ({
  chipContainer: {
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: theme.colors.invert,
  },
  chipUnselected: {
    backgroundColor: theme.colors.secondary,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textSelected: {
    color: theme.colors.primary,
  },
  textUnselected: {
    color: theme.colors.subtext,
  },
  iconLeft: {
    marginLeft: -4,
    marginRight: 8,
  },
  imageLeft: {
    marginLeft: -8,
    marginRight: 8,
    borderRadius: 8,
  },
}));
