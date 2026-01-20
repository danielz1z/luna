import { Link } from 'expo-router';
import React, { forwardRef } from 'react';
import { View, Pressable, ViewStyle, PressableProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { withOpacity } from '@/app/unistyles';

import Avatar from '../Avatar';
import Icon, { IconName } from '../Icon';
import ThemedText from '../ThemedText';

interface IconConfig {
  name: IconName;
  color?: string;
  size?: number;
  variant?: 'plain' | 'bordered' | 'contained';
  iconSize?: 'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl';
}

interface ListItemProps extends PressableProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  avatar?: {
    src?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md';
  };
  icon?: IconConfig;
  trailing?: React.ReactNode;
  trailingIcon?: IconConfig;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
  href?: string;
}

const ListItem = forwardRef<View, ListItemProps>((props, ref) => {
  const {
    title,
    subtitle,
    leading,
    avatar,
    icon,
    trailing,
    trailingIcon,
    onPress,
    disabled = false,
    className = '',
    style,
    href,
    ...rest
  } = props;

  const renderLeading = () => {
    if (leading) return leading;
    if (avatar) return <Avatar {...avatar} size={avatar.size || 'sm'} />;
    if (icon) return <Icon name={icon.name} color={icon.color} variant="bordered" iconSize="m" />;
    return null;
  };

  const renderTrailing = () => {
    if (trailing) return trailing;
    if (trailingIcon) return <Icon {...trailingIcon} />;
    return null;
  };

  const hasLeading = leading || avatar || icon;
  const hasTrailing = trailing || trailingIcon;

  const itemContent = (
    <View style={[styles.container, disabled && styles.disabled, style]}>
      {hasLeading && <View style={styles.leading}>{renderLeading()}</View>}

      <View style={styles.content}>
        {typeof title === 'string' ? <ThemedText style={styles.title}>{title}</ThemedText> : title}
        {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
      </View>

      {hasTrailing && <View style={styles.trailing}>{renderTrailing()}</View>}
    </View>
  );

  if (href && !disabled) {
    return (
      <Link href={href} asChild>
        <Pressable ref={ref} style={({ pressed }) => [pressed && styles.pressed]} {...rest}>
          {itemContent}
        </Pressable>
      </Link>
    );
  }

  return (
    <Pressable
      ref={ref}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [onPress && pressed && styles.pressed]}
      {...rest}>
      {itemContent}
    </Pressable>
  );
});

ListItem.displayName = 'ListItem';

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  leading: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  trailing: {
    marginLeft: 16,
  },
  pressed: {
    backgroundColor: withOpacity(theme.colors.secondary, 0.1),
  },
}));

export default ListItem;
