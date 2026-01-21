import { Link } from 'expo-router';
import React, { ReactNode } from 'react';
import {
  View,
  ViewStyle,
  ImageBackground,
  ImageSourcePropType,
  StyleSheet as RNStyleSheet,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { withOpacity } from '@/lib/unistyles';

interface CustomCardProps {
  children: ReactNode;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  border?: boolean;
  borderColor?: string;
  background?: boolean;
  elevation?: boolean;
  style?: ViewStyle;
  backgroundImage?: string;
  backgroundImageStyle?: ViewStyle;
  overlayColor?: string;
  overlayOpacity?: number;
  horizontal?: boolean;
  onPress?: () => void;
  href?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({
  children,
  rounded = 'lg',
  padding = 'md',
  shadow = 'none',
  border = false,
  borderColor,
  background = true,
  elevation = true,
  style,
  backgroundImage,
  backgroundImageStyle,
  overlayColor = 'black',
  overlayOpacity = 0.3,
  horizontal = false,
  onPress,
  href,
}) => {
  const roundedValue = getRoundedValue(rounded);

  const getPaddingStyle = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {};
      case 'sm':
        return { padding: 8 };
      case 'md':
        return { padding: 16 };
      case 'lg':
        return { padding: 24 };
      case 'xl':
        return { padding: 32 };
      default:
        return { padding: 16 };
    }
  };

  const getShadowStyle = (): ViewStyle => {
    if (!elevation || Platform.OS === 'android' || shadow === 'none') return {};

    const map = {
      sm: { shadowOpacity: 0.08, shadowRadius: 3, shadowOffset: { width: 0, height: 2 } },
      md: { shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 4 } },
      lg: { shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 8 } },
      xl: { shadowOpacity: 0.2, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
    } as const;

    const preset = map[shadow] ?? map.md;
    return {
      shadowColor: '#000000',
      ...preset,
    };
  };

  // Get elevation value for Android
  const getElevationStyle = (): ViewStyle => {
    if (!elevation || Platform.OS !== 'android' || shadow === 'none') {
      return {};
    }

    // Map shadow values to Android elevation values
    const elevationValues = {
      sm: 2,
      md: 4,
      lg: 8,
      xl: 16,
    };

    const elevationValue = elevationValues[shadow] || 4;

    return {
      elevation: elevationValue,
      shadowColor: 'rgba(0, 0, 0, 0.5)',
      //shadowOpacity: 0.1,
      shadowRadius: elevationValue / 2,
      shadowOffset: {
        height: elevationValue / 3,
        width: 0,
      },
    };
  };

  const getBorderStyle = (): ViewStyle => {
    if (!border) return {};
    return {
      borderWidth: 1,
      borderColor: borderColor ?? styles.borderDefault.borderColor,
    };
  };

  // Render the card with or without background image
  const renderCardContent = () => {
    // Combine regular style with elevation for Android
    const combinedStyle = {
      ...style,
      ...getElevationStyle(),
    };

    const baseStyle: ViewStyle = {
      width: '100%',
      borderRadius: roundedValue,
      ...(background ? styles.background : null),
      ...(horizontal ? styles.horizontal : styles.vertical),
      ...getPaddingStyle(),
      ...getBorderStyle(),
      ...getShadowStyle(),
      ...(backgroundImage ? styles.overflowVisible : styles.overflowHidden),
    };

    const content = backgroundImage ? (
      <View
        style={[styles.wrapper, { borderRadius: roundedValue }, getShadowStyle(), style]}>
        <ImageBackground
          source={typeof backgroundImage === 'string' ? { uri: backgroundImage } : backgroundImage}
          imageStyle={{ borderRadius: roundedValue }}
          style={[styles.imageBackground, { borderRadius: roundedValue }, combinedStyle, backgroundImageStyle]}>
          {overlayOpacity > 0 && (
            <View
              style={{
                ...RNStyleSheet.absoluteFillObject,
                ...getPaddingStyle(),
                backgroundColor: overlayColor,
                opacity: overlayOpacity,
                borderRadius: roundedValue,
              }}
            />
          )}
          <View>{children}</View>
        </ImageBackground>
      </View>
    ) : (
      <View style={[styles.wrapper, baseStyle, style]}>
        {children}
      </View>
    );

    if (href) {
      return (
        <Link href={href} asChild>
          <TouchableOpacity activeOpacity={1}>{content}</TouchableOpacity>
        </Link>
      );
    }

    if (onPress) {
      return (
        <TouchableOpacity onPress={onPress} activeOpacity={1}>
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  };

  return <>{renderCardContent()}</>;
};

export default CustomCard;

const getRoundedValue = (rounded: NonNullable<CustomCardProps['rounded']>) => {
  switch (rounded) {
    case 'none':
      return 0;
    case 'sm':
      return 2;
    case 'md':
      return 6;
    case 'lg':
      return 8;
    case 'xl':
      return 12;
    case '2xl':
      return 16;
    case 'full':
      return 9999;
    default:
      return 8;
  }
};

const styles = StyleSheet.create((theme) => ({
  wrapper: {
    width: '100%',
  },
  imageBackground: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  overflowHidden: {
    overflow: 'hidden',
  },
  overflowVisible: {
    overflow: 'visible',
  },
  horizontal: {
    flexDirection: 'row',
  },
  vertical: {
    flexDirection: 'column',
  },
  background: {
    backgroundColor: theme.colors.primary,
  },
  borderDefault: {
    borderColor: withOpacity(theme.colors.text, 0.1),
  },
}));
