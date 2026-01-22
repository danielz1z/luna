import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useState, useRef } from 'react';
import { View, Text, FlatList, Dimensions, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

import { useUnistyles } from 'react-native-unistyles';

import Icon from '@/components/ui/Icon';
import ThemeSelector from '@/components/ui/ThemeSelector';
import ThemedText from '@/components/ui/ThemedText';
const { width } = Dimensions.get('window');
const windowWidth = Dimensions.get('window').width;

const slides = [
  {
    id: '1',
    title: 'Luna AI',
    image: require('@/assets/lottie/sphere.json'),
    description: 'Your personal assistant',
  },
  {
    id: '2',
    title: 'Voice assistant',
    image: require('@/assets/lottie/waves.json'),
    description: 'Your personal assistant',
  },
  {
    id: '3',
    title: 'Customizable & Fast',
    image: require('@/assets/lottie/waves.json'),
    description: 'Easily modify themes and layouts.',
  },
];

export default function OnboardingScreen() {
  const { theme } = useUnistyles();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <View style={styles.root}>
        <View style={styles.topRight}>
          <ThemeSelector />
        </View>
        <FlatList
          ref={flatListRef}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          snapToAlignment="start"
          decelerationRate="fast"
          snapToInterval={windowWidth} // 👈 Ensures snapping works perfectly
          renderItem={({ item }) => (
            <View style={[styles.slide, { width: windowWidth }]}>
              <LottieView
                source={item.image}
                autoPlay
                loop
                style={{ width: windowWidth, height: 300 }}
              />
              <ThemedText style={styles.slideTitle}>{item.title}</ThemedText>
              <Text style={styles.slideDescription}>{item.description}</Text>
            </View>
          )}
          ListFooterComponent={() => <View style={styles.listFooter} />}
          keyExtractor={(item) => item.id}
        />

        <View style={styles.dotsRow}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        {/* Login/Signup Buttons */}
        <View style={styles.actionsWrap}>
          <View style={styles.actionsInner}>
            <View style={styles.providerRow}>
              <Pressable onPress={() => router.push('/(drawer)/')} style={styles.providerButton}>
                <AntDesign name="google" size={22} color={theme.colors.text} />
                <ThemedText style={styles.providerButtonText}>Google</ThemedText>
              </Pressable>
              <Pressable onPress={() => router.push('/(drawer)/')} style={styles.providerButton}>
                <AntDesign name="apple" size={22} color={theme.colors.text} />
                <ThemedText style={styles.providerButtonText}>Apple</ThemedText>
              </Pressable>
            </View>
            <Pressable onPress={() => router.push('/screens/signup')} style={styles.emailButton}>
              <Icon name="Mail" size={20} color={theme.colors.invert} />
              <ThemedText style={[styles.providerButtonText, { color: theme.colors.invert }]}>
                Email
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  root: {
    position: 'relative',
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  topRight: {
    width: '100%',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingRight: 24,
    paddingTop: 24,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  slideTitle: {
    marginTop: 16,
    fontFamily: theme.fonts.bold,
    fontSize: 24,
  },
  slideDescription: {
    marginTop: 8,
    textAlign: 'center',
    color: theme.colors.subtext,
  },
  listFooter: {
    height: 112,
    width: '100%',
  },
  dotsRow: {
    marginBottom: 80,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    marginHorizontal: 4,
    height: 8,
    width: 8,
    borderRadius: 9999,
  },
  dotActive: {
    backgroundColor: theme.colors.highlight,
  },
  dotInactive: {
    backgroundColor: theme.colors.secondary,
  },
  actionsWrap: {
    marginBottom: theme.spacing.global,
    width: '100%',
    flexDirection: 'column',
    paddingHorizontal: 24,
  },
  actionsInner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
    rowGap: 8,
  },
  providerRow: {
    width: '100%',
    flexDirection: 'row',
    columnGap: 8,
  },
  providerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.colors.text,
    paddingVertical: 16,
  },
  providerButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },
  emailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
    backgroundColor: theme.colors.text,
    paddingVertical: 16,
  },
}));
