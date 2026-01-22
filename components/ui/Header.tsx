import { useUnistyles } from 'react-native-unistyles';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ViewStyle, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

import Icon, { IconName } from './Icon';

import { palette, withOpacity } from '@/lib/unistyles';

type HeaderProps = {
  title?: string;
  children?: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightComponents?: React.ReactNode[];
  backgroundColor?: string;
  textColor?: string;
  leftComponent?: React.ReactNode;
  middleComponent?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  collapsible?: boolean;
  visible?: boolean;
  variant?: 'default' | 'transparent' | 'blurred';
};

const Header: React.FC<HeaderProps> = ({
  title,
  children,
  showBackButton = false,
  onBackPress,
  rightComponents = [],
  leftComponent,
  middleComponent,
  style,
  collapsible = false,
  visible = true,
  variant = 'default',
}) => {
  const { theme } = useUnistyles();
  const translateY = useRef(new Animated.Value(0)).current;

  // Determine if we should use the transparent or blurred variant styling
  const isTransparent = variant === 'transparent';
  const isBlurred = variant === 'blurred';
  const insets = useSafeAreaInsets();
  useEffect(() => {
    if (!collapsible) return;

    // When visible, use spring for a nice bounce-in from the top
    if (visible) {
      // First move it up slightly off-screen (if it's not already)
      translateY.setValue(-70);

      // Then spring it back in
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 30, // Higher tension for faster movement
        friction: 50, // Lower friction for slight bounce
        velocity: 3, // Higher initial velocity for more dramatic entrance
      }).start();
    }
    // When hiding, use spring animation to slide up
    else {
      Animated.spring(translateY, {
        toValue: -150,
        useNativeDriver: true,
        tension: 80, // High tension for quick movement
        friction: 12, // Moderate friction for less bounce
        velocity: 2, // Initial velocity for natural feel
      }).start();
    }
  }, [visible, collapsible, translateY]);

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else {
      router.back();
    }
  };

  const AnimatedView = Animated.createAnimatedComponent(View);

  // Position absolute for collapsible or transparent/blurred variant
  const containerStyle =
    collapsible || isTransparent || isBlurred
      ? {
          transform: collapsible ? [{ translateY }] : undefined,
          position: 'absolute' as const,
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
        }
      : {};

  if (isBlurred) {
    return (
      <BlurView
        intensity={30}
        tint="light"
        style={[
          styles.blurredContainer,
          style,
          containerStyle,
          { paddingTop: insets.top + stylesVars.extraTopPadding },
        ]}>
        <View style={styles.row}>
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <Icon name="ArrowLeft" size={24} color="white" />
              </TouchableOpacity>
            )}

            <View style={styles.leftContent}>
              {leftComponent}

              {title && <Text style={styles.titleWhite}>{title}</Text>}
            </View>
          </View>

          {middleComponent && <View style={styles.middleContainer}>{middleComponent}</View>}

          <View style={styles.rightSection}>
            {rightComponents.map((component, index) => (
              <View key={index} style={styles.rightItem}>
                {component}
              </View>
            ))}
          </View>
        </View>
        {children}
      </BlurView>
    );
  }

  if (isTransparent) {
    return (
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={[
          styles.transparentContainer,
          style,
          containerStyle,
          { paddingTop: insets.top + stylesVars.extraTopPadding },
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}>
        <View style={styles.transparentRow}>
          <View style={styles.transparentLeftSection}>
            {showBackButton && (
              <TouchableOpacity onPress={handleBackPress} style={styles.transparentBackButton}>
                <Icon name="ArrowLeft" size={24} color="white" />
              </TouchableOpacity>
            )}

            <View style={styles.transparentLeftContent}>
              {leftComponent}

              {title && <Text style={styles.titleWhite}>{title}</Text>}
            </View>
          </View>

          {middleComponent && <View style={styles.middleOverlay}>{middleComponent}</View>}

          <View style={styles.transparentRightSection}>
            {rightComponents.map((component, index) => (
              <View key={index} style={styles.rightItem}>
                {component}
              </View>
            ))}
          </View>
        </View>
        {children}
      </LinearGradient>
    );
  }

  return (
    <AnimatedView
      style={[styles.defaultContainer, style, containerStyle, { paddingTop: insets.top }]}>
      {(showBackButton || leftComponent || title) && (
        <View style={styles.defaultLeftSection}>
          {showBackButton && (
            <TouchableOpacity onPress={handleBackPress} style={styles.defaultBackButton}>
              <Icon name="ArrowLeft" size={24} color={isTransparent ? 'white' : theme.colors.icon} />
            </TouchableOpacity>
          )}

          {leftComponent ||
            (title && (
              <View style={styles.defaultLeftContent}>
                {leftComponent}

                {title && <Text style={styles.title}>{title}</Text>}
              </View>
            ))}
        </View>
      )}
      {middleComponent && <View style={styles.defaultMiddleSection}>{middleComponent}</View>}

      {rightComponents.length > 0 && (
        <View style={styles.defaultRightSection}>
          {rightComponents.map((component, index) => (
            <View key={index} style={styles.rightItem}>
              {component}
            </View>
          ))}
        </View>
      )}
      {children}
    </AnimatedView>
  );
};

export default Header;

type HeaderItemProps = {
  href: string;
  icon: IconName;
  className?: string;
  hasBadge?: boolean;
  onPress?: any;
  isWhite?: boolean;
};

export const HeaderIcon = ({ href, icon, hasBadge, onPress, isWhite = false }: HeaderItemProps) => (
  <>
    {onPress ? (
      <TouchableOpacity onPress={onPress} style={styles.headerIconTouchable}>
        <View style={styles.headerIconContainer}>
          {hasBadge && <View style={styles.headerIconBadge} />}
          {isWhite ? <Icon name={icon} size={25} color="white" /> : <Icon name={icon} size={25} />}
        </View>
      </TouchableOpacity>
    ) : (
      <Link href={href} asChild>
        <TouchableOpacity style={styles.headerIconTouchable}>
          <View style={styles.headerIconContainer}>
            {hasBadge && <View style={styles.headerIconBadgeOffset} />}
            {isWhite ? (
              <Icon name={icon} size={25} color="white" />
            ) : (
              <Icon name={icon} size={25} />
            )}
          </View>
        </TouchableOpacity>
      </Link>
    )}
  </>
);

const stylesVars = {
  extraTopPadding: 16,
} as const;

const styles = StyleSheet.create((theme) => {
  const isDark = UnistylesRuntime.themeName === 'dark';

  return {
    blurredContainer: {
      zIndex: 50,
      width: '100%',
      paddingHorizontal: theme.spacing.global,
      paddingBottom: 40,
      backgroundColor: isDark
        ? withOpacity(theme.colors.primary, 0.65)
        : withOpacity(theme.colors.primary, 0.85),
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      position: 'relative',
      zIndex: 50,
      marginRight: theme.spacing.global,
      paddingVertical: theme.spacing.md,
    },
    leftContent: {
      position: 'relative',
      zIndex: 50,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleWhite: {
      fontSize: 18,
      fontFamily: theme.fonts.bold,
      color: 'white',
    },
    middleContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    rightSection: {
      position: 'relative',
      zIndex: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    rightItem: {
      marginLeft: theme.spacing.lg,
    },

    transparentContainer: {
      zIndex: 50,
      width: '100%',
      paddingHorizontal: theme.spacing.global,
      paddingBottom: 40,
    },
    transparentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    transparentLeftSection: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    transparentBackButton: {
      position: 'relative',
      zIndex: 50,
      marginRight: theme.spacing.global,
    },
    transparentLeftContent: {
      position: 'relative',
      zIndex: 50,
      flexDirection: 'row',
      alignItems: 'center',
    },
    middleOverlay: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    transparentRightSection: {
      position: 'relative',
      zIndex: 50,
      flexDirection: 'row',
      alignItems: 'center',
    },

    defaultContainer: {
      position: 'relative',
      zIndex: 50,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.colors.primary,
      paddingHorizontal: theme.spacing.global,
      paddingBottom: 12,
    },
    defaultLeftSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    defaultBackButton: {
      position: 'relative',
      zIndex: 50,
      marginRight: theme.spacing.global,
      paddingVertical: theme.spacing.md,
    },
    defaultLeftContent: {
      position: 'relative',
      zIndex: 50,
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    title: {
      fontSize: 18,
      fontFamily: theme.fonts.bold,
      color: theme.colors.text,
    },
    defaultMiddleSection: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
    },
    defaultRightSection: {
      position: 'relative',
      zIndex: 50,
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },

    headerIconTouchable: {
      overflow: 'visible',
    },
    headerIconContainer: {
      position: 'relative',
      height: 28,
      width: 28,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
    },
    headerIconBadge: {
      position: 'absolute',
      right: 0,
      top: 0,
      zIndex: 30,
      height: 16,
      width: 16,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      backgroundColor: palette.red500,
    },
    headerIconBadgeOffset: {
      position: 'absolute',
      right: -3,
      top: 0,
      zIndex: 30,
      height: 16,
      width: 16,
      borderRadius: 9999,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      backgroundColor: palette.red500,
    },
  };
});
