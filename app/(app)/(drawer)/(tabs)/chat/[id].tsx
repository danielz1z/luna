import { useLocalSearchParams, router } from 'expo-router';
import React, { useRef, useEffect, useCallback } from 'react';
import { View, FlatList, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import { useQuery, useMutation } from 'convex/react';
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
import { ChatInput } from '@/components/ui/ChatInput';
import Header from '@/components/ui/Header';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';

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
  }, []); // opacity is a stable shared value from Reanimated

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

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useUnistyles();
  const flatListRef = useRef<FlatList<Message>>(null);

  const conversationId = id as Id<'conversations'>;

  const conversation = useQuery(api.queries.getConversation, { conversationId });
  const streamingMessage = useQuery(api.queries.getStreamingMessage, { conversationId });
  const sendMessage = useMutation(api.messages.send);

  const messages = conversation?.messages ?? [];

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

  const handleSendMessage = useCallback(
    async (text: string, _images?: string[]): Promise<boolean> => {
      if (!text.trim()) return false;
      try {
        await sendMessage({ conversationId, content: text });
        scrollToEnd();
        return true;
      } catch (error) {
        console.error('Failed to send message:', error);
        return false;
      }
    },
    [conversationId, sendMessage, scrollToEnd]
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const isCurrentlyStreaming =
        streamingMessage?._id === item._id && streamingMessage?.status === 'streaming';
      return <MessageBubble message={item} isStreaming={isCurrentlyStreaming} />;
    },
    [streamingMessage]
  );

  const keyExtractor = useCallback((item: Message) => item._id, []);

  const leftComponent = [
    <Pressable key="back" onPress={() => router.back()} style={styles.backButton}>
      <Icon name="ChevronLeft" size={24} color={theme.colors.text} />
    </Pressable>,
  ];

  if (!conversation) {
    return (
      <View style={styles.container}>
        <Header title="Loading..." leftComponent={leftComponent} />
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading conversation...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title={conversation.title || 'Chat'} leftComponent={leftComponent} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
        keyboardVerticalOffset={0}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={keyExtractor}
          contentContainerStyle={[styles.messageList, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToEnd}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>Start a conversation</ThemedText>
            </View>
          }
        />
        <ChatInput onSendMessage={handleSendMessage} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  keyboardAvoid: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.subtext,
    fontSize: 16,
  },
  messageList: {
    paddingHorizontal: theme.spacing.global,
    paddingTop: 16,
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: theme.colors.subtext,
    fontSize: 16,
  },
}));
