import { useFonts, Outfit_400Regular, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { Drawer } from 'expo-router/drawer';
import React from 'react';

import { useUnistyles } from 'react-native-unistyles';

import CustomDrawerContent from '@/components/ui/CustomDrawerContent';
import { ChatProvider } from '@/contexts/ChatContext';

export default function DrawerLayout() {
  const { theme } = useUnistyles();
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ChatProvider>
      <Drawer
        screenOptions={{
          headerShown: false,
          drawerType: 'slide',
          drawerPosition: 'left',
          drawerStyle: {
            backgroundColor: theme.colors.bg,
            //backgroundColor: 'red',
            width: '85%',
            flex: 1,
          },
          overlayColor: 'rgba(0,0,0, 0.4)',
          swipeEdgeWidth: 100,
        }}
        drawerContent={(props) => <CustomDrawerContent />}>
        <Drawer.Screen
          name="index"
          options={{
            title: 'Menu',
            drawerLabel: 'Menu',
          }}
        />
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: 'Chats',
            drawerLabel: 'Chats',
          }}
        />
      </Drawer>
    </ChatProvider>
  );
}
