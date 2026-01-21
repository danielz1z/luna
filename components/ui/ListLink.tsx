import { Link } from 'expo-router';
import React from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';

interface ListLinkProps {
  icon?: IconName;
  title: string;
  description?: string;
  href?: string;
  onPress?: () => void;
  showChevron?: boolean;
  className?: string;
  iconSize?: number;
  rightIcon?: IconName;
  disabled?: boolean;
  style?: ViewStyle;
  hasBorder?: boolean;
}

const ListLink: React.FC<ListLinkProps> = ({
  icon,
  title,
  description,
  href,
  onPress,
  showChevron = false,
  className = '',
  iconSize = 18,
  rightIcon = 'ChevronRight',
  disabled = false,
  style,
  hasBorder = false,
}) => {
  // Component for the actual content
  const Content = () => (
    <View style={[styles.row, disabled && styles.disabled, style]}>
      {icon && (
        <View style={styles.iconWrapper}>
          <Icon name={icon} size={iconSize} />
        </View>
      )}
      <View style={styles.textContent}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        {description && (
          <ThemedText style={styles.description}>{description}</ThemedText>
        )}
      </View>
      {showChevron && (
        <View style={styles.chevron}>
          <Icon name={rightIcon} size={20} />
        </View>
      )}
    </View>
  );

  // If we have an href, make it a Link, otherwise a Pressable
  if (href && !disabled) {
    return (
      <Link href={href} asChild>
        <Pressable style={hasBorder && styles.border}>
          <Content />
        </Pressable>
      </Link>
    );
  }

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={hasBorder && styles.border}>
      <Content />
    </Pressable>
  );
};

export default ListLink;

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  disabled: {
    opacity: 0.5,
  },
  iconWrapper: {
    marginRight: 16,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 12,
    color: theme.colors.subtext,
  },
  chevron: {
    opacity: 0.2,
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
  },
}));
