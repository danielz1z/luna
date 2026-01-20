import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated, Easing, Dimensions } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Button } from './Button';
import Icon from './Icon';

import useThemeColors from '@/app/contexts/ThemeColors';
import { shadowPresets } from '@/utils/useShadow';

interface VoiceItemProps {
  name: string;
  description: string;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

export const VoiceSelectCard = (props: VoiceItemProps) => {
  const windowWidth = Dimensions.get('window').width;
  const colors = useThemeColors();
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(10)).current;

  // Create a separate scale value
  const [isScaled, setIsScaled] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Toggle scale animation
  const toggleScale = () => {
    // Determine target scale value
    const toValue = isScaled ? 0.8 : 1;

    // Run animation
    Animated.timing(scaleAnim, {
      toValue,
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    // Toggle state
    setIsScaled(!isScaled);
  };

  const toggleVisibility = () => {
    const toValue = isVisible ? 10 : 0;
    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start();
    setIsVisible(!isVisible);
  };

  // Function to handle the "Use" button click
  const handleUse = () => {
    props.onSelect(props.name);
  };

  return (
    <View style={[styles.container, { width: windowWidth / 2 - 30 }]}>
      <Animated.View
        style={[
          styles.gradientContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          colors={['#FD984D', '#F77B79', '#F265D6']}
          style={styles.gradient}
        />
      </Animated.View>
      <Pressable
        style={[styles.pressable, shadowPresets.card]}
        onPress={() => {
          toggleVisibility();
          toggleScale();
        }}>
        <View style={styles.content}>
          <Icon name={isVisible ? 'Pause' : 'Play'} fill={colors.icon} size={20} />
          <Text style={styles.name}>{props.name}</Text>
          <Text style={styles.description}>{props.description}</Text>
        </View>
        <Animated.View
          style={[
            styles.lottieContainer,
            {
              opacity: slideAnim.interpolate({
                inputRange: [0, 10],
                outputRange: [1, 0],
              }),
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <LottieView
            autoPlay
            style={{
              width: '100%',
              height: 150,
            }}
            source={require('@/assets/lottie/waves.json')}
          />
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'relative',
    marginHorizontal: 6,
    marginBottom: 12,
    overflow: 'hidden',
    borderRadius: 24,
    backgroundColor: 'transparent',
    padding: 6,
  },
  gradientContainer: {
    overflow: 'hidden',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
  },
  gradient: {
    height: '100%',
    width: '100%',
  },
  pressable: {
    position: 'relative',
    zIndex: 50,
    width: '100%',
    flexDirection: 'column',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.secondary,
    borderRadius: 20,
  },
  content: {
    alignItems: 'flex-start',
    padding: 16,
  },
  name: {
    marginTop: 64,
    fontFamily: 'Outfit_700Bold',
    fontSize: 18,
    color: '#ffffff',
  },
  description: {
    marginTop: -1,
    fontSize: 12,
    color: '#ffffff',
    opacity: 0.6,
  },
  lottieContainer: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    width: '100%',
  },
}));
