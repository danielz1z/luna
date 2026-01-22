import { DrawerActions, useNavigation, NavigationProp } from '@react-navigation/native';
import { useUnistyles } from 'react-native-unistyles';
import React from 'react';
import { Pressable, View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import Avatar from './Avatar';
import Icon from './Icon';

interface DrawerButtonProps {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  isAvatar?: boolean;
}

export default function DrawerButton({
  size = 'md',
  style,
  isAvatar = false,
}: DrawerButtonProps) {
  const { theme } = useUnistyles();
  const navigation = useNavigation<NavigationProp<any>>();

  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const handlePress = () => {
    try {
      navigation.dispatch(DrawerActions.openDrawer());
    } catch {
      // Drawer navigation context not available - silently ignore
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={handlePress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
        {isAvatar ? (
          <Avatar src="https://mighty.tools/mockmind-api/content/human/5.jpg" size="xs" />
        ) : (
          <Icon name="Menu" size={sizeMap[size]} color={theme.colors.text} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create(() => ({
  container: {
    borderRadius: 9999,
  },
}));
