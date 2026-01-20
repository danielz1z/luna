import React from 'react';
import { View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Avatar from './Avatar';
import Icon from './Icon';
import ThemedText from './ThemedText';

import useThemeColors from '@/app/contexts/ThemeColors';

interface ReviewProps {
  rating: number;
  description: string;
  date: string;
  username?: string;
  avatar?: string;
  className?: string;
  style?: ViewStyle;
}

const Review: React.FC<ReviewProps> = ({
  rating,
  description,
  date,
  username,
  avatar,
  className = '',
  style,
}) => {
  const colors = useThemeColors();

  const renderStars = () => {
    const stars = [];

    for (let i = 0; i < 5; i++) {
      stars.push(
        <Icon
          key={i}
          name="Star"
          size={16}
          fill={i < rating ? colors.text : 'none'}
          color={i < rating ? colors.text : colors.text}
          strokeWidth={1.5}
          style={styles.star}
        />
      );
    }

    return (
      <View style={styles.starsRow}>
        {stars}
        <ThemedText style={styles.ratingText}>{rating}.0</ThemedText>
      </View>
    );
  };

  return (
    <View style={style}>
      <View style={styles.row}>
        {(avatar || username) && (
          <Avatar src={avatar} name={username} size="xs" style={styles.avatar} />
        )}
        <View style={styles.content}>
          {username && <ThemedText style={styles.username}>{username}</ThemedText>}
          <View style={styles.headerRow}>
            {renderStars()}
            <ThemedText style={styles.date}>{date}</ThemedText>
          </View>
          <ThemedText style={styles.description}>{description}</ThemedText>
        </View>
      </View>
    </View>
  );
};

export default Review;

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
  },
  avatar: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  username: {
    marginBottom: 4,
    fontWeight: '700',
  },
  headerRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 4,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
  },
  date: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  description: {
    fontSize: 14,
  },
}));
