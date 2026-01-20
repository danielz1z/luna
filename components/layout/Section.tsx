import { Link } from 'expo-router';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Icon, { IconName } from '../Icon';
import ThemedText from '../ThemedText';

type TitleSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';

interface SectionProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  className?: string;
  icon?: IconName;
  titleSize?: TitleSize;
  style?: ViewStyle;
  link?: string;
  linkText?: string;
  linkClassName?: string;
}

export const Section: React.FC<SectionProps> = ({
  children,
  title,
  subtitle,
  header,
  footer,
  padding = 'none',
  className = '',
  style,
  icon,
  titleSize = 'xl',
  link,
  linkText,
  linkClassName = '',
}) => {
  const getPaddingValue = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'sm':
        return 8;
      case 'md':
        return 16;
      case 'lg':
        return 24;
      case 'xl':
        return 32;
      case '2xl':
        return 40;
      case '3xl':
        return 48;
      case '4xl':
        return 64;
      default:
        return 16;
    }
  };

  const getTitleFontSize = () => {
    switch (titleSize) {
      case 'sm':
        return 14;
      case 'md':
        return 16;
      case 'lg':
        return 18;
      case 'xl':
        return 20;
      case '2xl':
        return 24;
      case '3xl':
        return 30;
      case '4xl':
        return 36;
      default:
        return 20;
    }
  };

  return (
    <View style={[{ width: '100%', paddingVertical: getPaddingValue() }, style]}>
      {(title || header) && (
        <View style={styles.headerContainer}>
          {icon && (
            <View style={styles.iconContainer}>
              <Icon name={icon} size={24} />
            </View>
          )}
          <View>
            {header || (
              <>
                {title && (
                  <View style={styles.titleRow}>
                    <ThemedText style={[styles.title, { fontSize: getTitleFontSize() }]}>
                      {title}
                    </ThemedText>
                    {link && (
                      <Link href={link} asChild>
                        <ThemedText style={styles.link}>{linkText}</ThemedText>
                      </Link>
                    )}
                  </View>
                )}
                {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
              </>
            )}
          </View>
        </View>
      )}

      <View>{children}</View>

      {footer && <View style={styles.footer}>{footer}</View>}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  titleRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontWeight: '700',
  },
  link: {
    textDecorationLine: 'underline',
  },
  subtitle: {
    color: theme.colors.subtext,
  },
  footer: {
    marginTop: 16,
  },
}));

export default Section;
