import React, { useState, useRef } from 'react';
import { View, Pressable, Animated, Platform, UIManager, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Icon, { IconName } from './Icon';
import ThemedText from './ThemedText';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface ExpandableProps {
  icon?: IconName;
  title: string;
  description?: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onPress?: () => void;
  className?: string;
  style?: ViewStyle;
}

const Expandable: React.FC<ExpandableProps> = ({
  icon,
  title,
  description,
  children,
  defaultExpanded = false,
  expanded,
  onPress,
  style,
}) => {
  const [isExpanded, setIsExpanded] = useState(expanded ?? defaultExpanded);
  const rotateAnim = useRef(new Animated.Value((expanded ?? defaultExpanded) ? 1 : 0)).current;
  const heightAnim = useRef(new Animated.Value((expanded ?? defaultExpanded) ? 1 : 0)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    onPress?.();

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(heightAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={toggleExpand} style={styles.header}>
        {icon && (
          <View style={styles.iconWrapper}>
            <Icon name={icon} size={24} />
          </View>
        )}
        <View style={styles.textContent}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          {description && (
            <ThemedText style={styles.description}>{description}</ThemedText>
          )}
        </View>
        <Animated.View
          style={{
            transform: [
              {
                rotate: rotateAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '180deg'],
                }),
              },
            ],
          }}>
          <Icon name="ChevronDown" size={20} />
        </Animated.View>
      </Pressable>
      <Animated.View
        style={{
          maxHeight: heightAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1000],
          }),
          opacity: heightAnim,
          overflow: 'hidden',
        }}>
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  );
};

export default Expandable;

const styles = StyleSheet.create((theme) => ({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  iconWrapper: {
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: theme.colors.subtext,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
}));
