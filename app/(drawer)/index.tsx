import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

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
            <AiCircle />
          </View>
          <ChatInput />
        </View>
        <View style={styles.overlay} />
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
}));
