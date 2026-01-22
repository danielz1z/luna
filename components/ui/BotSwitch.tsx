import React, { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { StyleSheet } from 'react-native-unistyles';

import ActionSheetThemed from './ActionSheetThemed';
import Icon from './Icon';
import ThemedText from './ThemedText';

import { palette, withOpacity } from '@/lib/unistyles';

export const BotSwitch = () => {
  const [selectedModel, setSelectedModel] = useState('GPT-4o');
  const actionSheetRef = useRef<ActionSheetRef>(null);

  // AI model options
  const modelOptions = [
    { label: 'GPT-4o', value: 'GPT-4o' },
    { label: 'Claude 3', value: 'Claude 3' },
    { label: 'Llama 3', value: 'Llama 3' },
    { label: 'Gemini', value: 'Gemini' },
  ];

  // Open the action sheet
  const openModelSelector = () => {
    if (actionSheetRef.current) {
      actionSheetRef.current.show();
    }
  };

  // Handle model selection
  const handleModelSelect = (model: string) => {
    setSelectedModel(model);
    if (actionSheetRef.current) {
      actionSheetRef.current.hide();
    }
  };

  return (
    <>
      <Pressable style={styles.trigger} onPress={openModelSelector}>
        <ThemedText style={styles.triggerText}>{selectedModel}</ThemedText>
        <Icon name="ChevronDown" size={16} style={styles.chevronIcon} />
      </Pressable>

      {/* ActionSheet for model selection */}
      <ActionSheetThemed ref={actionSheetRef}>
        <View style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <ThemedText style={styles.title}>Select AI Model</ThemedText>
            <ThemedText style={styles.subtitle}>Choose the AI model to chat with</ThemedText>
          </View>

          {modelOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => handleModelSelect(option.value)}
              style={[
                styles.optionRow,
                selectedModel === option.value && styles.optionRowSelected,
              ]}>
              <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
              {selectedModel === option.value && <Icon name="Check" size={20} />}
            </Pressable>
          ))}

          <Pressable onPress={() => actionSheetRef.current?.hide()} style={styles.cancelButton}>
            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
          </Pressable>
        </View>
      </ActionSheetThemed>
    </>
  );
};

const styles = StyleSheet.create((theme) => ({
  trigger: {
    flexDirection: 'row',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: theme.isDark ? 'transparent' : palette.neutral300,
    backgroundColor: theme.colors.secondary,
    paddingVertical: 4,
    paddingLeft: 12,
    paddingRight: 8,
  },
  triggerText: {
    marginRight: 4,
  },
  chevronIcon: {
    opacity: 0.5,
  },
  sheetContent: {
    padding: 16,
  },
  sheetHeader: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    color: theme.colors.subtext,
  },
  optionRow: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    padding: 12,
  },
  optionRowSelected: {
    backgroundColor: theme.isDark ? theme.colors.primary : withOpacity(theme.colors.primary, 0.1),
  },
  optionLabel: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 16,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
  },
  cancelText: {
    fontWeight: '600',
  },
}));
