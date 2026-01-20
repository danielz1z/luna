import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';

import { AiCircle } from '@/components/AiCircle';
import { BotSwitch } from '@/components/BotSwitch';
import { ChatInput } from '@/components/ChatInput';
import DrawerButton from '@/components/DrawerButton';
import Header, { HeaderIcon } from '@/components/Header';
import Icon from '@/components/Icon';
import ThemeScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';

const HomeScreen = () => {
  const rightComponents = [<BotSwitch />];

  const leftComponent = [
    <DrawerButton key="drawer-button" />,
    <ThemedText key="app-title" className="ml-4 font-outfit-bold text-2xl">
      Luna<Text className="text-highlight">.</Text>
    </ThemedText>,
  ];

  return (
    <View className="relative flex-1 bg-light-primary dark:bg-dark-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Header title="" leftComponent={leftComponent} rightComponents={rightComponents} />
          <View className="relative flex-1 items-center justify-center">
            <AiCircle />
          </View>
          <ChatInput />
        </View>
        <View className="absolute right-0 top-0 h-screen w-screen items-center justify-center" />
      </KeyboardAvoidingView>
    </View>
  );
};

export default HomeScreen;
