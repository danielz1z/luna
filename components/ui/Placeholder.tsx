import { Link } from 'expo-router';
import { View, StyleProp, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from '@/components/ui/Button';
import Icon, { IconName } from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';

interface PlaceholderProps {
  title: string;
  subtitle?: string;
  button?: string;
  href?: string;
  icon?: IconName;
  className?: string;
  style?: StyleProp<ViewStyle>;
}

export function Placeholder({
  title,
  subtitle,
  button,
  href,
  icon = 'Inbox',
  className = '',
  style,
}: PlaceholderProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrapper}>
        <Icon name={icon} size={30} color={styles.icon.color} />
      </View>

      <ThemedText style={styles.title}>{title}</ThemedText>

      {subtitle && (
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      )}

      {button && href && (
        <View style={styles.buttonWrapper}>
          <Button title={button} variant="outline" href={href} rounded="full" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: 16,
  },
  iconWrapper: {
    marginBottom: 16,
    height: 80,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
  },
  icon: {
    color: theme.colors.subtext,
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: 16,
    textAlign: 'center',
    color: theme.colors.subtext,
  },
  buttonWrapper: {
    marginTop: 16,
  },
}));

export default Placeholder;
