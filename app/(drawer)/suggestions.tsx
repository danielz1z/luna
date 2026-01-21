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
import { StyleSheet } from 'react-native-unistyles';
import Rive from 'rive-react-native';

import { BotSwitch } from '@/components/ui/BotSwitch';
import { CardScroller } from '@/components/ui/CardScroller';
import { ChatInput } from '@/components/ui/ChatInput';
import DrawerButton from '@/components/ui/DrawerButton';
import Header, { HeaderIcon } from '@/components/ui/Header';
import Icon from '@/components/ui/Icon';
import ThemeScroller from '@/components/ui/ThemeScroller';
import ThemedText from '@/components/ui/ThemedText';


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
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 180}
        style={{ flex: 1 }}>
        <View style={styles.flex1}>
          <Header title="" leftComponent={leftComponent} rightComponents={rightComponents} />

          <View style={styles.suggestionsContainer}>
            <CardScroller style={styles.cardScroller}>
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
      style={styles.suggestionCard}>
      <Icon
        name={props.icon}
        size={20}
        style={styles.suggestionIcon}
      />
      <View style={styles.suggestionBody}>
        <ThemedText style={styles.suggestionTitle}>{props.title}</ThemedText>
        <ThemedText style={styles.suggestionDescription}>{props.description}</ThemedText>
      </View>
    </TouchableOpacity>
  );
};

export default HomeScreen;

const styles = StyleSheet.create((theme) => ({
  root: {
    position: 'relative',
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  flex1: {
    flex: 1,
  },
  appTitle: {
    marginLeft: 16,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
  appTitleDot: {
    color: theme.colors.highlight,
  },
  suggestionsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cardScroller: {
    paddingHorizontal: theme.spacing.global,
    paddingBottom: theme.spacing.sm,
  },
  suggestionCard: {
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    shadowOffset: { width: 0, height: 2 },
    width: 270,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: theme.colors.primary,
    padding: 16,
  },
  suggestionIcon: {
    height: 48,
    width: 48,
    borderRadius: 9999,
    backgroundColor: theme.colors.secondary,
  },
  suggestionBody: {
    marginLeft: 16,
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  suggestionDescription: {
    fontSize: 14,
  },
}));
