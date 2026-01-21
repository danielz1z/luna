import React, { ReactNode } from 'react';
import { View, Pressable, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

import AnimatedView from '../ui/AnimatedView';
import Icon, { IconName } from '../ui/Icon';
import ThemedText from '../ui/ThemedText';

import useThemeColors from '@/app/contexts/ThemeColors';
import { palette, withOpacity } from '@/lib/unistyles';

interface SelectableProps {
  title: string;
  description?: string;
  icon?: IconName;
  customIcon?: ReactNode;
  iconColor?: string;
  selected?: boolean;
  onPress?: () => void;
  error?: string;
  className?: string;
  containerClassName?: string;
  style?: StyleProp<ViewStyle>;
}

const Selectable: React.FC<SelectableProps> = ({
  title,
  description,
  icon,
  customIcon,
  iconColor,
  selected = false,
  onPress,
  error,
  className = '',
  containerClassName = '',
  style,
}) => {
  const colors = useThemeColors();
  const isDark = UnistylesRuntime.themeName === 'dark';

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          isDark && styles.cardDark,
          selected && styles.cardSelected,
          error && styles.cardError,
          style,
        ]}
        android_ripple={{ color: withOpacity(palette.black, 0.06) }}>
        <View style={styles.row}>
          {icon && (
            <View
              style={[
                styles.iconContainer,
                isDark ? styles.iconContainerDark : styles.iconContainerLight,
                selected && styles.iconContainerSelected,
              ]}>
              <Icon
                name={icon}
                size={20}
                strokeWidth={1.2}
                color={iconColor || (selected ? 'white' : colors.icon)}
              />
            </View>
          )}
          {customIcon && (
            <View style={styles.customIconContainer}>
              {customIcon}
            </View>
          )}
          <View style={styles.content}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {description && (
              <ThemedText style={styles.description}>
                {description}
              </ThemedText>
            )}
          </View>
          {selected ? (
            <AnimatedView style={styles.checkIcon} animation="bounceIn" duration={500}>
              <Icon name="CheckCircle2" size={24} color={colors.highlight} />
            </AnimatedView>
          ) : (
            <></>
          )}
        </View>
      </Pressable>

      {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
    </View>
  );
};

export default Selectable;

const styles = StyleSheet.create((theme) => ({
  container: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: theme.colors.secondary,
    padding: 16,
  },
  cardDark: {
    backgroundColor: withOpacity(theme.colors.secondary, 0.5),
  },
  cardSelected: {
    backgroundColor: withOpacity(theme.colors.subtext, 0.2),
  },
  cardError: {
    borderColor: palette.red500,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  iconContainerLight: {
    backgroundColor: palette.white,
  },
  iconContainerDark: {
    backgroundColor: withOpacity(palette.white, 0.1),
  },
  iconContainerSelected: {
    backgroundColor: theme.colors.highlight,
  },
  customIconContainer: {
    marginRight: 16,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    marginTop: 0,
    fontSize: 14,
    color: theme.colors.subtext,
  },
  checkIcon: {
    marginLeft: 12,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: palette.red500,
  },
}));
