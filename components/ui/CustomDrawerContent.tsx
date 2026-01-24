import { useMemo, useState } from 'react';
import { useClerk, useUser } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import { useQuery } from 'convex/react';

import Avatar from './Avatar';
import Icon, { IconName } from './Icon';
import ThemedScroller from './ThemeScroller';
import ThemedText from './ThemedText';

import { useUnistyles } from 'react-native-unistyles';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { palette, withOpacity } from '@/lib/unistyles';
import { api } from '@/convex/_generated/api';
import { useChatContext } from '@/contexts/ChatContext';

export default function CustomDrawerContent() {
  const { onSelectConversation, onNewChat } = useChatContext();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [searchQuery, setSearchQuery] = useState('');
  const conversations = useQuery(api.conversations.list, {});

  const groupedConversations = useMemo(() => {
    if (!conversations) return {};

    const groups: Record<string, typeof conversations> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    conversations.forEach((conv) => {
      const convDate = new Date(conv.updatedAt);
      let label: string;

      if (convDate.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (convDate.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      } else {
        label = convDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(conv);
    });

    return groups;
  }, [conversations]);

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return groupedConversations;

    const filtered: Record<string, typeof conversations> = {};
    Object.entries(groupedConversations).forEach(([date, convs]) => {
      if (!convs) return;
      const matches = convs.filter((c) =>
        c.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matches.length) filtered[date] = matches;
    });
    return filtered;
  }, [groupedConversations, searchQuery]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/(auth)/login');
    } catch (err) {
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || '';
  const userName = user?.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : userEmail.split('@')[0] || 'User';

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
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <ThemeToggle />
        </View>

        <View style={styles.navSection}>
          <TouchableOpacity onPress={onNewChat} style={styles.navItem}>
            <View style={styles.navIconContainer}>
              <Icon name="Plus" size={18} />
            </View>
            <View style={styles.navContent}>
              <ThemedText style={styles.navLabel}>New chat</ThemedText>
            </View>
          </TouchableOpacity>
          {/* TODO: Wire Explore to real functionality */}
          {/* <NavItem href="/screens/search-form" icon="LayoutGrid" label="Explore" /> */}
          {isSignedIn && (
            <TouchableOpacity onPress={handleSignOut} style={styles.navItem}>
              <View style={styles.navIconContainer}>
                <Icon name="LogOut" size={18} />
              </View>
              <View style={styles.navContent}>
                <ThemedText style={styles.navLabel}>Sign out</ThemedText>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {Object.entries(filteredConversations).map(([date, convs]) => (
          <View key={date} style={styles.dateGroup}>
            <ThemedText style={styles.dateHeader}>{date}</ThemedText>
            {convs?.map((conv) => (
              <TouchableOpacity
                key={conv._id}
                onPress={() => onSelectConversation(conv._id)}
                style={styles.conversationItem}
                activeOpacity={0.7}>
                <ThemedText style={styles.conversationTitle} numberOfLines={1}>
                  {conv.title || 'Untitled conversation'}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {conversations && conversations.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>No conversations yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>Start a new chat to begin</ThemedText>
          </View>
        )}

        {searchQuery.trim() &&
          Object.keys(filteredConversations).length === 0 &&
          conversations &&
          conversations.length > 0 && (
            <View style={styles.emptyState}>
              <ThemedText style={styles.emptyText}>No results found</ThemedText>
              <ThemedText style={styles.emptySubtext}>Try a different search term</ThemedText>
            </View>
          )}
      </ThemedScroller>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/screens/profile')}
        style={styles.profileButton}>
        <Avatar
          src={user?.imageUrl ? { uri: user.imageUrl } : require('@/assets/img/thomino.jpg')}
          size="md"
        />
        <View style={styles.profileInfo}>
          <ThemedText style={styles.profileName}>{userName}</ThemedText>
          <ThemedText style={styles.profileEmail}>{userEmail}</ThemedText>
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
    dateGroup: {
      marginTop: 16,
    },
    dateHeader: {
      fontSize: 12,
      fontWeight: '600',
      opacity: 0.5,
      marginBottom: 8,
      paddingHorizontal: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    conversationItem: {
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    conversationTitle: {
      fontSize: 14,
      fontWeight: '400',
    },
    emptyState: {
      paddingVertical: 32,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      opacity: 0.6,
    },
  };
});
