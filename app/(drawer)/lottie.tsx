import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';

import { BotSwitch } from '@/components/BotSwitch';
import { ChatInput } from '@/components/ChatInput';
import DrawerButton from '@/components/DrawerButton';
import Header, { HeaderIcon } from '@/components/Header';
import Icon from '@/components/Icon';
import { Sphere } from '@/components/Sphere';
import ThemeScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import { shadowPresets } from '@/utils/useShadow';
// Types for the chat messages
type MessageType = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  images?: string[];
};

const HomeScreen = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <Header title="" leftComponent={leftComponent} rightComponents={rightComponents} />

          {messages.length === 0 && !isLoading && <Sphere />}

          {(messages.length > 0 || isLoading) && (
            <ThemeScroller className="flex-1 px-4 pt-20">
              {isLoading && (
                <View className="my-2 max-w-[80%] rounded-2xl bg-light-secondary p-4 dark:bg-dark-secondary">
                  <View className="flex-row items-center">
                    <View className="mx-1 h-2 w-2 rounded-full bg-highlight" />
                    <View className="mx-1 h-2 w-2 rounded-full bg-highlight" />
                    <View className="mx-1 h-2 w-2 rounded-full bg-highlight" />
                  </View>
                </View>
              )}
            </ThemeScroller>
          )}

          <ChatInput />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// Helper function to get simulated responses

export default HomeScreen;
