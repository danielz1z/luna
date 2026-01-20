import { useFocusEffect } from 'expo-router';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { BotSwitch } from '@/components/BotSwitch';
import { ChatInput } from '@/components/ChatInput';
import DrawerButton from '@/components/DrawerButton';
import Header, { HeaderIcon } from '@/components/Header';
import Icon from '@/components/Icon';
import ThemedText from '@/components/ThemedText';
import { Divider } from '@/components/layout/Divider';
import { shadowPresets } from '@/utils/useShadow';

const ResultsScreen = () => {
  const [liked, setLiked] = useState(false);
  const [liked2, setLiked2] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const rightComponents = [<BotSwitch />];

  const leftComponent = [
    <DrawerButton key="drawer-button" />,
    <ThemedText key="app-title" className="ml-4 font-outfit-bold text-2xl">
      Luna<Text className="text-highlight">.</Text>
    </ThemedText>,
  ];

  useFocusEffect(
    useCallback(() => {
      const timer = setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 100);

      return () => clearTimeout(timer);
    }, [])
  );

  return (
    <View className="relative flex-1 bg-light-primary dark:bg-dark-primary">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 180}
        style={{ flex: 1 }}>
        <View className="flex-1 ">
          <Header title="" leftComponent={leftComponent} rightComponents={rightComponents} />

          <ScrollView
            ref={scrollViewRef}
            className="flex-1 bg-light-primary px-8 pb-10 pt-10 dark:bg-dark-primary"
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never">
            <View className="flex-1">
              <View className="mb-16">
                <View
                  style={shadowPresets.small}
                  className="mb-6 rounded-xl bg-light-secondary p-global dark:bg-dark-secondary">
                  <ThemedText className="text-base">
                    How does Luna compare to other templates?
                  </ThemedText>
                </View>
                <ThemedText className="mb-4 text-2xl font-bold">Luna vs Other Templates</ThemedText>
                <ThemedText className="mb-5 ">
                  Unlike most templates that focus on just UI components, Luna provides a complete
                  startup ecosystem. It integrates AI capabilities, authentication flows, and data
                  management patterns that other templates leave for you to implement.
                </ThemedText>
                <ThemedText className="mb-3 mt-2 text-xl font-bold">
                  Developer Experience
                </ThemedText>
                <ThemedText className="mb-5 ">
                  Luna's architecture emphasizes developer productivity with clear conventions,
                  minimal boilerplate, and extensive documentation. The component system is designed
                  for maximum reusability while maintaining the flexibility to customize for your
                  specific needs.
                </ThemedText>
                <Divider className="my-3" />
                <View className="mt-4 flex-row">
                  <Pressable
                    onPress={() => setLiked2(!liked2)}
                    className="mr-6 flex-row items-center">
                    <Icon
                      name="Heart"
                      size={20}
                      color={liked2 ? '#E57DDF' : undefined}
                      fill={liked2 ? '#E57DDF' : 'none'}
                    />
                    <ThemedText className="ml-2 ">{liked2 ? 'Liked' : 'Like'}</ThemedText>
                  </Pressable>
                  <Pressable className="flex-row items-center">
                    <Icon name="Share2" size={20} />
                    <ThemedText className="ml-2 ">Share</ThemedText>
                  </Pressable>
                </View>
              </View>

              <View>
                <View
                  style={shadowPresets.small}
                  className="mb-6 rounded-xl bg-light-secondary p-global dark:bg-dark-secondary">
                  <ThemedText className="text-base">
                    Why should I choose the Luna template for my startup?
                  </ThemedText>
                </View>
                <ThemedText className="mb-4 text-2xl font-bold">
                  Luna: The Ultimate Startup Template
                </ThemedText>
                <ThemedText className="mb-5 ">
                  Luna provides everything you need to launch your startup quickly and efficiently.
                  With its beautiful UI components, responsive design, and thoughtful architecture,
                  you'll save weeks of development time while delivering a premium user experience.
                </ThemedText>
                <ThemedText className="mb-3 mt-2 text-xl font-bold">
                  Built for Modern Experiences
                </ThemedText>
                <ThemedText className="mb-5 ">
                  The template includes AI integration, dark/light mode support, and animations
                  right out of the box. Luna's component system is designed for flexibility and
                  reuse, making it easy to customize while maintaining a consistent look and feel
                  across your app.
                </ThemedText>
                <Divider className="my-3" />
                <View className="mt-4 flex-row">
                  <Pressable
                    onPress={() => setLiked(!liked)}
                    className="mr-6 flex-row items-center">
                    <Icon
                      name="Heart"
                      size={20}
                      color={liked ? '#E57DDF' : undefined}
                      fill={liked ? '#E57DDF' : 'none'}
                    />
                    <ThemedText className="ml-2 text-light-subtext dark:text-dark-subtext">
                      {liked ? 'Liked' : 'Like'}
                    </ThemedText>
                  </Pressable>
                  <Pressable className="flex-row items-center">
                    <Icon name="Share2" size={20} />
                    <ThemedText className="ml-2 text-light-subtext dark:text-dark-subtext">
                      Share
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
            <View className="h-10 w-full" />
          </ScrollView>
          <ChatInput />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResultsScreen;
