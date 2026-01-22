import * as NavigationBar from 'expo-navigation-bar';
import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import ActionSheet, { ActionSheetRef } from 'react-native-actions-sheet';
import { StyleSheet } from 'react-native-unistyles';

import { useUnistyles } from 'react-native-unistyles';
import ThemedText from '@/components/ui/ThemedText';
import { palette } from '@/lib/unistyles';

interface ConfirmationModalProps {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  actionSheetRef: React.RefObject<ActionSheetRef>;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  actionSheetRef,
}) => {
  const { theme } = useUnistyles();
  const isDark = theme.isDark;

  React.useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(theme.colors.bg);
      NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');

      return () => {
        // Reset to default theme color when modal closes
        NavigationBar.setBackgroundColorAsync(theme.colors.bg);
        NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
      };
    }
  }, [isDark, theme.colors.bg]);

  const handleConfirm = () => {
    actionSheetRef.current?.hide();
    onConfirm();
  };

  const handleCancel = () => {
    actionSheetRef.current?.hide();
    onCancel();
  };

  return (
    <ActionSheet
      ref={actionSheetRef}
      gestureEnabled
      drawUnderStatusBar={false}
      statusBarTranslucent
      containerStyle={{
        backgroundColor: theme.colors.bg,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
      }}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.message}>{message}</ThemedText>

        <View style={styles.buttonsRow}>
          <Pressable onPress={handleCancel} style={styles.cancelButton}>
            <ThemedText>{cancelText}</ThemedText>
          </Pressable>
          <Pressable onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmText}>{confirmText}</Text>
          </Pressable>
        </View>
      </View>
    </ActionSheet>
  );
};

export default ConfirmationModal;

const styles = StyleSheet.create((theme) => ({
  content: {
    padding: 32,
    paddingBottom: 56,
  },
  title: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: '700',
  },
  message: {
    marginBottom: 24,
    color: theme.colors.subtext,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    columnGap: 12,
  },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  confirmButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: palette.red500,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  confirmText: {
    color: palette.white,
  },
}));
