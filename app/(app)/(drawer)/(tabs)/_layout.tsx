import { Tabs } from 'expo-router';
import React from 'react';
import { useUnistyles } from 'react-native-unistyles';

import Icon from '@/components/ui/Icon';

export default function TabsLayout() {
  const { theme } = useUnistyles();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.bg,
          borderTopColor: theme.colors.border,
          borderTopWidth: 0.5,
        },
        tabBarActiveTintColor: theme.colors.highlight,
        tabBarInactiveTintColor: theme.colors.subtext,
        tabBarLabelStyle: {
          fontFamily: 'Outfit_400Regular',
          fontSize: 11,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, size }) => <Icon name="MessageCircle" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat/[id]"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="images"
        options={{
          title: 'Images',
          tabBarIcon: ({ color, size }) => <Icon name="Image" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
