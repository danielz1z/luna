import { Link, router } from 'expo-router';
import { View, Text, Pressable, TouchableOpacity, TextInput, Touchable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from './Avatar';
import Icon, { IconName } from './Icon';
import ThemedScroller from './ThemeScroller';
import ThemedText from './ThemedText';

import useThemeColors from '@/app/contexts/ThemeColors';
import ThemeToggle from '@/components/ThemeToggle';

const History = [
  { label: 'Home', href: '/' },
  { label: 'Chat with suggestions', href: '/(drawer)/suggestions' },
  { label: 'Lottie animation', href: '/(drawer)/lottie' },
  { label: 'Chat with results', href: '/(drawer)/results' },
];

export default function CustomDrawerContent() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  return (
    <View
      className="flex-1 bg-white px-global dark:bg-dark-primary"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <ThemedScroller className="flex-1 bg-white px-0 dark:bg-dark-primary">
        <View className="mt-4 flex-row items-center justify-between">
          <View className="relative mr-4 flex-1 rounded-full bg-light-primary dark:bg-white/20">
            <Icon name="Search" className="absolute left-4 top-3.5 z-50" size={20} />
            <TextInput
              className="h-[47px] rounded-lg pl-12 pr-3 text-black dark:text-white"
              placeholder="Search"
              placeholderTextColor={colors.placeholder}
              returnKeyType="done"
              autoFocus={false}
            />
          </View>
          <ThemeToggle />
        </View>

        <View className="mb-4 mt-4 flex-col border-b border-neutral-200 pb-4 dark:border-dark-secondary">
          <NavItem href="/" icon="Plus" label="New chat" />
          <NavItem href="/screens/search-form" icon="LayoutGrid" label="Explore" />
        </View>

        {History.map((item, index) => (
          <Link
            className="py-3 text-base font-semibold text-black dark:text-white"
            key={index}
            href={item.href}>
            {item.label}
          </Link>
        ))}
      </ThemedScroller>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => router.push('/screens/profile')}
        className="flex-row items-center justify-start border-t border-neutral-200  pb-4 pt-4 dark:border-dark-secondary">
        <Avatar src={require('@/assets/img/thomino.jpg')} size="md" />
        <View className="ml-4">
          <ThemedText className="text-base font-semibold">Thomino</ThemedText>
          <ThemedText className="text-xs opacity-50">thomino@gmail.com</ThemedText>
        </View>
        <Icon name="ChevronRight" size={18} className="ml-auto" />
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
  <TouchableOpacity onPress={() => router.push(href)} className="flex-row items-center py-2">
    <View className="h-9 w-9 flex-row items-center justify-center rounded-lg bg-light-primary dark:bg-dark-secondary">
      <Icon name={icon} size={18} className="" />
    </View>
    <View className="ml-4 flex-1 ">
      {label && (
        <ThemedText className="text-base font-bold text-gray-800 dark:text-gray-200">
          {label}
        </ThemedText>
      )}
      {description && <ThemedText className="text-xs opacity-50">{description}</ThemedText>}
    </View>
  </TouchableOpacity>
);
