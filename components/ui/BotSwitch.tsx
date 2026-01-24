import React, { useRef } from 'react';
import { Pressable, View, ActivityIndicator } from 'react-native';
import { ActionSheetRef } from 'react-native-actions-sheet';
import { StyleSheet } from 'react-native-unistyles';
import { useQuery } from 'convex/react';

import ActionSheetThemed from './ActionSheetThemed';
import Icon from './Icon';
import ThemedText from './ThemedText';

import { palette, withOpacity } from '@/lib/unistyles';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

interface BotSwitchProps {
  selectedModel: Id<'models'> | null;
  onModelSelect: (modelId: Id<'models'>) => void;
}

export const BotSwitch = ({ selectedModel, onModelSelect }: BotSwitchProps) => {
  const models = useQuery(api.queries.getModels);
  const actionSheetRef = useRef<ActionSheetRef>(null);

  // Build model options from Convex data
  const modelOptions =
    models?.map((m) => ({
      label: m.name,
      value: m._id,
    })) || [];

  // Open the action sheet
  const openModelSelector = () => {
    if (actionSheetRef.current) {
      actionSheetRef.current.show();
    }
  };

  // Handle model selection
  const handleModelSelect = (modelId: Id<'models'>) => {
    onModelSelect(modelId);
    if (actionSheetRef.current) {
      actionSheetRef.current.hide();
    }
  };

  // Show loading state while fetching models
  if (!models) {
    return (
      <View style={styles.trigger}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  // Get the selected model name
  const selectedModelName = models.find((m) => m._id === selectedModel)?.name || 'Select Model';

  return (
    <>
      <Pressable style={styles.trigger} onPress={openModelSelector}>
        <ThemedText style={styles.triggerText}>{selectedModelName}</ThemedText>
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
