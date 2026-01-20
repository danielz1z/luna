import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Rive from 'rive-react-native';

import { BotSwitch } from '@/components/BotSwitch';
import { CardScroller } from '@/components/CardScroller';
import { ChatInput } from '@/components/ChatInput';
import DrawerButton from '@/components/DrawerButton';
import Header, { HeaderIcon } from '@/components/Header';
import Icon from '@/components/Icon';
import ThemeScroller from '@/components/ThemeScroller';
import ThemedText from '@/components/ThemedText';
import { shadowPresets } from '@/utils/useShadow';

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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 180}
        style={{ flex: 1 }}>
        <View className="flex-1 ">
          <Header title="" leftComponent={leftComponent} rightComponents={rightComponents} />

          <View className="flex-1 items-center justify-end">
            <CardScroller className="px-global pb-2">
              <SuggestionCard
                title="Make a recipe"
                description="Find the best recipes for a healthy diet"
                icon="Cookie"
              />
              <SuggestionCard
                title="Generate image"
                description="Use text to generate an image"
                icon="Image"
              />
              <SuggestionCard
                title="Generate text"
                description="Use an image to generate text"
                icon="Text"
              />
              <SuggestionCard
                title="Generate code"
                description="Use text to generate code"
                icon="Code"
              />
            </CardScroller>
          </View>
          <ChatInput />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const SuggestionCard = (props: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={{ ...shadowPresets.card }}
      className="flex w-[270px] flex-row items-center rounded-2xl border border-light-secondary bg-light-primary p-4 dark:border-dark-secondary dark:bg-dark-primary">
      <Icon
        name={props.icon}
        size={20}
        className="h-12 w-12 rounded-full bg-light-secondary dark:bg-dark-secondary"
      />
      <View className="ml-4 flex-1">
        <ThemedText className="text-lg font-semibold">{props.title}</ThemedText>
        <ThemedText className="text-sm">{props.description}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default HomeScreen;
