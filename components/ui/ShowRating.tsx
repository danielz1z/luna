import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import ThemedText from './ThemedText';

import { useUnistyles } from 'react-native-unistyles';

interface ShowRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  displayMode?: 'number' | 'stars';
  className?: string;
  color?: string;
  style?: ViewStyle;
}

const ShowRating: React.FC<ShowRatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  displayMode = 'number',
  className = '',
  color,
  style,
}) => {
  const { theme } = useUnistyles();

  const starColor = color || theme.colors.text;

  const getSize = () => {
    switch (size) {
      case 'sm':
        return { icon: 12, textSize: 12, fontWeight: '500' as const };
      case 'md':
        return { icon: 16, textSize: 14, fontWeight: '500' as const };
      case 'lg':
        return { icon: 20, textSize: 18, fontWeight: '700' as const };
      default:
        return { icon: 16, textSize: 14, fontWeight: '500' as const };
    }
  };

  if (displayMode === 'number') {
    const currentSize = getSize();

    return (
      <View style={[styles.numberRow, style]}>
        <Ionicons name="star" size={currentSize.icon} color={starColor} />
        <ThemedText
          style={[
            styles.numberText,
            { fontSize: currentSize.textSize, fontWeight: currentSize.fontWeight },
            color ? { color: starColor } : null,
          ]}>
          {rating.toFixed(1)}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.starsRow}>
      {[...Array(maxRating)].map((_, index) => (
        <Ionicons
          key={index}
          name={index < Math.round(rating) ? 'star' : 'star-outline'}
          size={getSize().icon}
          color={starColor}
        />
      ))}
    </View>
  );
};

export default ShowRating;

const styles = StyleSheet.create(() => ({
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
  },
  numberText: {
    fontWeight: '500',
  },
  starsRow: {
    flexDirection: 'row',
    columnGap: 2,
  },
}));
