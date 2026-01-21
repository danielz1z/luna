import { useThemeColors } from 'app/contexts/ThemeColors';
import { TabTriggerSlotProps } from 'expo-router/ui';
import { ComponentProps, forwardRef, useEffect, useState, ReactNode } from 'react';
import { Text, Pressable, View, Animated } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import AnimatedView from './AnimatedView';
import Avatar from './Avatar';
import ThemedText from './ThemedText';

import Icon, { IconName } from '@/components/ui/Icon';
import { palette } from '@/lib/unistyles';

export type TabButtonProps = TabTriggerSlotProps & {
  icon?: IconName;
  avatar?: string;
  customContent?: ReactNode;
  labelAnimated?: boolean;
  hasBadge?: boolean;
};

export const TabButton = forwardRef<View, TabButtonProps>(
  (
    {
      icon,
      avatar,
      children,
      isFocused,
      onPress,
      customContent,
      labelAnimated = true,
      hasBadge = false,
      ...props
    },
    ref
  ) => {
    const colors = useThemeColors();

    // Use Animated Values to control opacity and translateY
    const [labelOpacity] = useState(new Animated.Value(isFocused ? 1 : 0));
    const [labelMarginBottom] = useState(new Animated.Value(isFocused ? 0 : 10));
    const [lineScale] = useState(new Animated.Value(isFocused ? 0 : 10));

    // Animate opacity and translation when the tab becomes focused or unfocused
    useEffect(() => {
      Animated.parallel([
        Animated.timing(labelOpacity, {
          toValue: isFocused ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(labelMarginBottom, {
          toValue: isFocused ? 0 : 10,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(lineScale, {
          toValue: isFocused ? 1 : 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }, [isFocused]);

    // Render icon or custom content
    const renderContent = () => {
      if (customContent) {
        return customContent;
      }

      if (icon) {
        return (
          <View style={styles.contentWrapper}>
            <View style={[styles.iconWrapper, !isFocused && styles.iconWrapperUnfocused]}>
              {/*isFocused && (
                <AnimatedView animation='scaleIn' duration={200} className='absolute border-4 rounded-full border-light-primary dark:border-dark-primary -top-1 -left-1/3  w-full h-8  bg-highlight/20' ></AnimatedView>
              )}*/}
              <Icon
                name={icon}
                size={24}
                strokeWidth={isFocused ? 2.5 : 2}
                color={isFocused ? colors.highlight : colors.icon}
              />
            </View>
            {hasBadge && (
              <View style={[styles.badge, { borderColor: colors.bg }]} />
            )}
          </View>
        );
      }
      if (avatar) {
        return (
          <View
            style={[styles.avatarBorder, { borderColor: isFocused ? colors.highlight : 'transparent' }]}>
            <Avatar src={avatar} size="xxs" />
          </View>
        );
      }
      return null;
    };

    return (
      <Pressable
        style={styles.root}
        ref={ref}
        {...props}
        onPress={onPress}>
        <View style={styles.inner}>
          {renderContent()}

          {labelAnimated ? (
            <Animated.View
              style={[
                styles.labelWrapper,
                {
                  opacity: labelOpacity,
                  transform: [{ translateY: labelMarginBottom }],
                },
              ]}>
              <ThemedText style={[styles.labelText, { color: colors.highlight }]}>{children}</ThemedText>
            </Animated.View>
          ) : (
            <ThemedText style={styles.labelText}>{children}</ThemedText>
          )}
        </View>
      </Pressable>
    );
  }
);

const styles = StyleSheet.create(() => ({
  root: {
    width: '20%',
    overflow: 'hidden',
  },
  inner: {
    position: 'relative',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    paddingBottom: 0,
  },
  contentWrapper: {
    position: 'relative',
  },
  iconWrapper: {
    position: 'relative',
    width: '100%',
    opacity: 1,
  },
  iconWrapperUnfocused: {
    opacity: 0.4,
  },
  badge: {
    position: 'absolute',
    right: -6,
    top: -4,
    height: 12,
    width: 12,
    borderRadius: 9999,
    borderWidth: 1,
    backgroundColor: palette.red500,
  },
  avatarBorder: {
    borderRadius: 9999,
    borderWidth: 2,
  },
  labelWrapper: {
    position: 'relative',
  },
  labelText: {
    marginTop: 1,
    fontSize: 9,
  },
}));

export default TabButton;

TabButton.displayName = "TabButton";
