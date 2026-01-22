import React, { useState } from 'react';
import { Pressable, Animated } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import Icon from './Icon';
import { setThemeMode } from '@/lib/storage';

interface ThemeToggleProps {
  size?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24 }) => {
  const { theme } = useUnistyles();
  const [scale] = useState(new Animated.Value(1));
  const [rotate] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);

  const animateIcon = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 45,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setIsAnimating(false));
  };

  const handlePress = () => {
    const newMode = theme.isDark ? 'light' : 'dark';
    setThemeMode(newMode);
    animateIcon();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={{
          transform: [
            { scale },
            { rotate: rotate.interpolate({ inputRange: [0, 45], outputRange: ['0deg', '45deg'] }) },
          ],
        }}>
        {theme.isDark ? <Icon name="Sun" size={size} /> : <Icon name="Moon" size={size} />}
      </Animated.View>
    </Pressable>
  );
};

export default ThemeToggle;
