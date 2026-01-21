import { router } from 'expo-router';
import React, { useState, useRef } from 'react';
import { Pressable, View, Text } from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { StyleSheet } from 'react-native-unistyles';

import ActionSheetThemed from './ActionSheetThemed';
import { Button } from './Button';
import Icon from './Icon';
import ThemedText from './ThemedText';

import { useThemeColors } from '@/app/contexts/ThemeColors';

interface FavoriteProps {
  initialState?: boolean;
  size?: number;
  productName?: string;
  isWhite?: boolean;
  onToggle?: (isFavorite: boolean) => void;
}

const Favorite: React.FC<FavoriteProps> = ({
  initialState = false,
  size = 24,
  productName = 'Product',
  onToggle,
  isWhite = false,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialState);
  const actionSheetRef = useRef<ActionSheetRef>(null);
  const colors = useThemeColors();

  const handleToggle = () => {
    const newState = !isFavorite;
    setIsFavorite(newState);
    actionSheetRef.current?.show();

    if (onToggle) {
      onToggle(newState);
    }
  };

  const handleViewFavorites = () => {
    actionSheetRef.current?.hide();
    // Navigate to favorites screen
    router.push('/(drawer)/(tabs)/favorites');
  };

  return (
    <>
      <Pressable onPress={handleToggle}>
        {isWhite ? (
          <Icon
            name="Bookmark"
            size={size}
            fill={isFavorite ? 'white' : 'none'}
            color={isFavorite ? 'white' : 'white'}
            strokeWidth={1.8}
          />
        ) : (
          <Icon
            name="Bookmark"
            size={size}
            fill={isFavorite ? colors.highlight : 'none'}
            color={isFavorite ? colors.highlight : colors.icon}
            strokeWidth={1.8}
          />
        )}
      </Pressable>

      <ActionSheetThemed ref={actionSheetRef} gestureEnabled>
        <View style={styles.sheetContent}>
          <ThemedText style={styles.title}>
            {isFavorite ? 'Added to Bookmarks' : 'Removed from Bookmarks'}
          </ThemedText>

          <ThemedText style={styles.message}>
            {isFavorite
              ? `${productName} has been added to your bookmarks.`
              : `${productName} has been removed from your bookmarks.`}
          </ThemedText>

          <View style={styles.actionsRow}>
            {isFavorite && (
              <View style={styles.flexButton}>
                <Button title="View Bookmarks" onPress={handleViewFavorites} />
              </View>
            )}

            <View style={[styles.flexButton, isFavorite && styles.continueButtonSpacing]}>
              <Button
                title="Continue Browsing"
                variant="outline"
                onPress={() => actionSheetRef.current?.hide()}
              />
            </View>
          </View>
        </View>
      </ActionSheetThemed>
    </>
  );
};

export default Favorite;

const styles = StyleSheet.create(() => ({
  sheetContent: {
    padding: 16,
    paddingBottom: 24,
  },
  title: {
    marginTop: 16,
    marginBottom: 4,
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '700',
  },
  message: {
    marginBottom: 24,
    textAlign: 'left',
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 12,
  },
  flexButton: {
    flex: 1,
  },
  continueButtonSpacing: {
    marginLeft: 12,
  },
}));
