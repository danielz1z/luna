import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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
    <ThemedText key="app-title" style={styles.appTitle}>
      Luna<Text style={styles.appTitleDot}>.</Text>
    </ThemedText>,
  ];

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        style={{ flex: 1 }}>
        {/* Main Content */}
        <View style={{ flex: 1 }}>
          <Header title="" leftComponent={leftComponent} rightComponents={rightComponents} />

          {messages.length === 0 && !isLoading && <Sphere />}

          {(messages.length > 0 || isLoading) && (
            <ThemeScroller contentContainerStyle={styles.scrollerContent}>
              {isLoading && (
                <View style={styles.loadingBubble}>
                  <View style={styles.loadingDotsRow}>
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
                    <View style={styles.loadingDot} />
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

const styles = StyleSheet.create((theme) => ({
  root: {
    position: 'relative',
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  appTitle: {
    marginLeft: 16,
    fontFamily: 'Outfit_700Bold',
    fontSize: 24,
  },
  appTitleDot: {
    color: theme.colors.highlight,
  },
  scrollerContent: {
    paddingTop: 80,
    paddingHorizontal: 16,
  },
  loadingBubble: {
    marginVertical: 8,
    maxWidth: '80%',
    borderRadius: 16,
    backgroundColor: theme.colors.secondary,
    padding: 16,
  },
  loadingDotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    marginHorizontal: 4,
    height: 8,
    width: 8,
    borderRadius: 9999,
    backgroundColor: theme.colors.highlight,
  },
}));
