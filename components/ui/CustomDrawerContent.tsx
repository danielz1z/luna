import { Link, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';

import Avatar from './Avatar';
import Icon, { IconName } from './Icon';
import ThemedScroller from './ThemeScroller';
import ThemedText from './ThemedText';

import { useUnistyles } from 'react-native-unistyles';
import ThemeSelector from '@/components/ui/ThemeSelector';
import { palette, withOpacity } from '@/lib/unistyles';

const History = [
  { label: 'Home', href: '/' },
  { label: 'Chat with suggestions', href: '/(drawer)/suggestions' },
  { label: 'Lottie animation', href: '/(drawer)/lottie' },
  { label: 'Chat with results', href: '/(drawer)/results' },
];

export default function CustomDrawerContent() {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <ThemedScroller style={styles.scroller}>
        <View style={styles.searchRow}>
          <View style={styles.searchContainer}>
            <Icon name="Search" style={styles.searchIcon} size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search"
              placeholderTextColor={theme.colors.placeholder}
              returnKeyType="done"
              autoFocus={false}
            />
          </View>
          <ThemeSelector />
        </View>

        <View style={styles.navSection}>
          <NavItem href="/" icon="Plus" label="New chat" />
          <NavItem href="/screens/search-form" icon="LayoutGrid" label="Explore" />
        </View>

        {History.map((item, index) => (
          <Link key={index} href={item.href} asChild>
            <ThemedText style={styles.historyLink}>{item.label}</ThemedText>
          </Link>
        ))}
      </ThemedScroller>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/screens/profile')}
        style={styles.profileButton}>
        <Avatar src={require('@/assets/img/thomino.jpg')} size="md" />
        <View style={styles.profileInfo}>
          <ThemedText style={styles.profileName}>Thomino</ThemedText>
          <ThemedText style={styles.profileEmail}>thomino@gmail.com</ThemedText>
        </View>
        <Icon name="ChevronRight" size={18} style={styles.chevron} />
      </TouchableOpacity>
    </View>
  );
}

type NavItemProps = {
  href: string;
  icon: IconName;
  label: string;
  className?: string;
  description?: string;
};

export const NavItem = ({ href, icon, label, description }: NavItemProps) => (
  <TouchableOpacity onPress={() => router.push(href)} style={styles.navItem}>
    <View style={styles.navIconContainer}>
      <Icon name={icon} size={18} />
    </View>
    <View style={styles.navContent}>
      {label && <ThemedText style={styles.navLabel}>{label}</ThemedText>}
      {description && <ThemedText style={styles.navDescription}>{description}</ThemedText>}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create((theme) => {
  const isDark = UnistylesRuntime.themeName === 'dark';

  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
    },
    scroller: {
      flex: 1,
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 0,
    },
    searchRow: {
      marginTop: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    searchContainer: {
      position: 'relative',
      marginRight: 16,
      flex: 1,
      borderRadius: 9999,
      backgroundColor: isDark ? withOpacity('white', 0.2) : theme.colors.primary,
    },
    searchIcon: {
      position: 'absolute',
      left: 16,
      top: 14,
      zIndex: 50,
    },
    searchInput: {
      height: 47,
      borderRadius: 8,
      paddingLeft: 48,
      paddingRight: 12,
      color: theme.colors.text,
    },
    navSection: {
      marginBottom: 16,
      marginTop: 16,
      flexDirection: 'column',
      borderBottomWidth: 1,
      borderBottomColor: isDark ? theme.colors.secondary : palette.neutral200,
      paddingBottom: 16,
    },
    historyLink: {
      paddingVertical: 12,
      fontSize: 16,
      fontWeight: '600',
    },
    profileButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-start',
      borderTopWidth: 1,
      borderTopColor: isDark ? theme.colors.secondary : palette.neutral200,
      paddingBottom: 16,
      paddingTop: 16,
    },
    profileInfo: {
      marginLeft: 16,
    },
    profileName: {
      fontSize: 16,
      fontWeight: '600',
    },
    profileEmail: {
      fontSize: 12,
      opacity: 0.5,
    },
    chevron: {
      marginLeft: 'auto',
    },
    navItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
    },
    navIconContainer: {
      height: 36,
      width: 36,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: isDark ? theme.colors.secondary : theme.colors.primary,
    },
    navContent: {
      marginLeft: 16,
      flex: 1,
    },
    navLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: isDark ? palette.gray200 : palette.gray800,
    },
    navDescription: {
      fontSize: 12,
      opacity: 0.5,
    },
  };
});
