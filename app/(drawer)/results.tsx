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
import { StyleSheet } from 'react-native-unistyles';

import { BotSwitch } from '@/components/ui/BotSwitch';
import { ChatInput } from '@/components/ui/ChatInput';
import DrawerButton from '@/components/ui/DrawerButton';
import Header, { HeaderIcon } from '@/components/ui/Header';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';
import { Divider } from '@/components/layout/Divider';


const ResultsScreen = () => {
  const [liked, setLiked] = useState(false);
  const [liked2, setLiked2] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const rightComponents = [<BotSwitch />];

  const leftComponent = [
    <DrawerButton key="drawer-button" />,
    <ThemedText key="app-title" style={styles.appTitle}>
      Luna<Text style={styles.appTitleDot}>.</Text>
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
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 180}
        style={{ flex: 1 }}>
        <View style={styles.flex1}>
          <Header title="" leftComponent={leftComponent} rightComponents={rightComponents} />

          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never">
            <View style={styles.flex1}>
              <View style={styles.sectionSpacer}>
                <View
                  style={styles.questionCard}
                >
                  <ThemedText style={styles.questionText}>
                    How does Luna compare to other templates?
                  </ThemedText>
                </View>
                <ThemedText style={[styles.h2, styles.mb4]}>Luna vs Other Templates</ThemedText>
                <ThemedText style={styles.mb5}>
                  Unlike most templates that focus on just UI components, Luna provides a complete
                  startup ecosystem. It integrates AI capabilities, authentication flows, and data
                  management patterns that other templates leave for you to implement.
                </ThemedText>
                <ThemedText style={[styles.h3, styles.mt2, styles.mb3]}>
                  Developer Experience
                </ThemedText>
                <ThemedText style={styles.mb5}>
                  Luna's architecture emphasizes developer productivity with clear conventions,
                  minimal boilerplate, and extensive documentation. The component system is designed
                  for maximum reusability while maintaining the flexibility to customize for your
                  specific needs.
                </ThemedText>
                <Divider spacing={12} />
                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => setLiked2(!liked2)}
                    style={[styles.actionButton, styles.mr6]}>
                    <Icon
                      name="Heart"
                      size={20}
                      color={liked2 ? '#E57DDF' : undefined}
                      fill={liked2 ? '#E57DDF' : 'none'}
                    />
                    <ThemedText style={styles.actionText}>{liked2 ? 'Liked' : 'Like'}</ThemedText>
                  </Pressable>
                  <Pressable style={styles.actionButton}>
                    <Icon name="Share2" size={20} />
                    <ThemedText style={styles.actionText}>Share</ThemedText>
                  </Pressable>
                </View>
              </View>

              <View>
                <View
                  style={styles.questionCard}
                >
                  <ThemedText style={styles.questionText}>
                    Why should I choose the Luna template for my startup?
                  </ThemedText>
                </View>
                <ThemedText style={[styles.h2, styles.mb4]}>
                  Luna: The Ultimate Startup Template
                </ThemedText>
                <ThemedText style={styles.mb5}>
                  Luna provides everything you need to launch your startup quickly and efficiently.
                  With its beautiful UI components, responsive design, and thoughtful architecture,
                  you'll save weeks of development time while delivering a premium user experience.
                </ThemedText>
                <ThemedText style={[styles.h3, styles.mt2, styles.mb3]}>
                  Built for Modern Experiences
                </ThemedText>
                <ThemedText style={styles.mb5}>
                  The template includes AI integration, dark/light mode support, and animations
                  right out of the box. Luna's component system is designed for flexibility and
                  reuse, making it easy to customize while maintaining a consistent look and feel
                  across your app.
                </ThemedText>
                <Divider spacing={12} />
                <View style={styles.actionRow}>
                  <Pressable
                    onPress={() => setLiked(!liked)}
                    style={[styles.actionButton, styles.mr6]}>
                    <Icon
                      name="Heart"
                      size={20}
                      color={liked ? '#E57DDF' : undefined}
                      fill={liked ? '#E57DDF' : 'none'}
                    />
                    <ThemedText style={[styles.actionText, styles.actionTextSubtext]}>
                      {liked ? 'Liked' : 'Like'}
                    </ThemedText>
                  </Pressable>
                  <Pressable style={styles.actionButton}>
                    <Icon name="Share2" size={20} />
                    <ThemedText style={[styles.actionText, styles.actionTextSubtext]}>
                      Share
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </View>
            <View style={styles.scrollSpacer} />
          </ScrollView>
          <ChatInput />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ResultsScreen;

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
  scrollView: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 32,
    paddingBottom: 40,
    paddingTop: 40,
  },
  sectionSpacer: {
    marginBottom: 64,
  },
  questionCard: {
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.global,
  },
  questionText: {
    fontSize: 16,
  },
  h2: {
    fontSize: 24,
    fontFamily: theme.fonts.bold,
  },
  h3: {
    fontSize: 20,
    fontFamily: theme.fonts.bold,
  },
  mb3: {
    marginBottom: 12,
  },
  mb4: {
    marginBottom: 16,
  },
  mb5: {
    marginBottom: 20,
  },
  mt2: {
    marginTop: 8,
  },
  actionRow: {
    marginTop: 16,
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mr6: {
    marginRight: 24,
  },
  actionText: {
    marginLeft: 8,
  },
  actionTextSubtext: {
    color: theme.colors.subtext,
  },
  scrollSpacer: {
    height: 40,
    width: '100%',
  },
}));
