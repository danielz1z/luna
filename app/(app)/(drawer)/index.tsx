import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, FlatList } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { useQuery, useMutation } from 'convex/react';
import { useUnistyles } from 'react-native-unistyles';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { AiCircle } from '@/components/ui/AiCircle';
import { BotSwitch } from '@/components/ui/BotSwitch';
import { ChatInput } from '@/components/ui/ChatInput';
import DrawerButton from '@/components/ui/DrawerButton';
import Header from '@/components/ui/Header';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { withOpacity } from '@/lib/unistyles';
import { useChatContext } from '@/contexts/ChatContext';

type Message = {
  _id: Id<'messages'>;
  _creationTime: number;
  conversationId: Id<'conversations'>;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokenCount?: number;
  status?: 'streaming' | 'complete' | 'error';
};

function TypingIndicator() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 600 }), -1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.typingContainer, animatedStyle]}>
      <View style={styles.typingDot} />
      <View style={styles.typingDot} />
      <View style={styles.typingDot} />
    </Animated.View>
  );
}

function MessageBubble({ message, isStreaming }: { message: Message; isStreaming: boolean }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const showTyping = isStreaming && isAssistant && !message.content;

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
      {showTyping ? (
        <TypingIndicator />
      ) : (
        <ThemedText style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </ThemedText>
      )}
      {isStreaming && isAssistant && message.content && (
        <View style={styles.streamingIndicator}>
          <TypingIndicator />
        </View>
      )}
    </Animated.View>
  );
}

const HomeScreen = () => {
  const flatListRef = useRef<FlatList<Message>>(null);
  const { theme } = useUnistyles();

  // Current conversation from context
  const { conversationId, setConversationId } = useChatContext();

  // Selected model
  const [selectedModelId, setSelectedModelId] = useState<Id<'models'> | null>(null);

  // Mutations
  const createConversation = useMutation(api.conversations.create);
  const sendMessage = useMutation(api.messages.send);

  // Get conversation messages if we have one
  const conversation = useQuery(
    api.queries.getConversation,
    conversationId ? { conversationId } : 'skip'
  );

  // Get streaming message for current conversation
  const streamingMessage = useQuery(
    api.queries.getStreamingMessage,
    conversationId ? { conversationId } : 'skip'
  );

  // Get models to set default
  const models = useQuery(api.queries.getModels);

  // Get user credits
  const credits = useQuery(api.queries.getUserCredits);

  // Set default model when loaded
  useEffect(() => {
    if (models && models.length > 0 && !selectedModelId) {
      setSelectedModelId(models[0]._id);
    }
  }, [models, selectedModelId]);

  // Determine if we're in fresh state
  const isFreshState = !conversationId || !conversation?.messages?.length;

  const messages = conversation?.messages ?? [];

  // Scroll to end when messages change
  const scrollToEnd = useCallback(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToEnd();
  }, [messages.length, streamingMessage?.content, scrollToEnd]);

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (text: string, _images?: string[]): Promise<boolean> => {
      if (!text.trim() || !selectedModelId) return false;

      try {
        let convId = conversationId;

        // Create conversation if first message
        if (!convId) {
          convId = await createConversation({
            modelId: selectedModelId,
            title: text.slice(0, 50),
          });
          setConversationId(convId);
        }

        // Send message - this triggers LLM response via scheduler
        await sendMessage({
          conversationId: convId,
          content: text,
        });

        scrollToEnd();
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        return false;
      }
    },
    [conversationId, selectedModelId, createConversation, sendMessage, scrollToEnd]
  );

  // Render message item
  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isCurrentlyStreaming =
        streamingMessage?._id === item._id && streamingMessage?.status === 'streaming';
      return <MessageBubble message={item} isStreaming={isCurrentlyStreaming} />;
    },
    [streamingMessage]
  );

  const keyExtractor = useCallback((item: Message) => item._id, []);

  const rightComponents = [
    <View key="credits" style={styles.creditsContainer}>
      <Icon name="Coins" size={14} color={theme.colors.highlight} />
      <ThemedText style={styles.creditsText}>
        {credits !== undefined ? credits.toLocaleString() : '...'}
      </ThemedText>
    </View>,
    <BotSwitch
      key="bot-switch"
      selectedModel={selectedModelId}
      onModelSelect={setSelectedModelId}
    />,
  ];

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
        <View style={{ flex: 1 }}>
          <Header title="" leftComponent={leftComponent} rightComponents={rightComponents} />
          <View style={styles.center}>
            {isFreshState ? (
              <Animated.View exiting={FadeOut.duration(300)}>
                <AiCircle />
              </Animated.View>
            ) : (
              <Animated.View entering={FadeIn.duration(300)} style={styles.messagesContainer}>
                <FlatList
                  ref={flatListRef}
                  data={messages}
                  renderItem={renderMessage}
                  keyExtractor={keyExtractor}
                  contentContainerStyle={styles.messagesList}
                  showsVerticalScrollIndicator={false}
                  onContentSizeChange={scrollToEnd}
                />
              </Animated.View>
            )}
          </View>
          <ChatInput onSendMessage={handleSendMessage} />
        </View>
        <View style={styles.overlay} pointerEvents="none" />
      </KeyboardAvoidingView>
    </View>
  );
};

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
  center: {
    position: 'relative',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesContainer: {
    flex: 1,
    width: '100%',
  },
  messagesList: {
    paddingHorizontal: theme.spacing.global,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderCurve: 'continuous',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: theme.colors.highlight,
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.card,
    borderBottomLeftRadius: 6,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: theme.colors.text,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.subtext,
  },
  streamingIndicator: {
    marginTop: 8,
  },
  creditsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: withOpacity(theme.colors.highlight, 0.1),
    marginRight: 8,
  },
  creditsText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.highlight,
  },
}));
