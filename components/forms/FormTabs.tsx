import React, { useState } from 'react';
import { View, Pressable, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import ThemedText from '../ui/ThemedText';

import { palette } from '@/lib/unistyles';

interface FormTabProps {
  title: string;
  isActive?: boolean;
  onPress?: () => void;
}

export function FormTab({ title, isActive, onPress }: FormTabProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tab, isActive ? styles.tabActive : styles.tabInactive]}>
      <ThemedText
        style={[styles.tabText, isActive ? styles.tabTextActive : styles.tabTextInactive]}>
        {title}
      </ThemedText>
    </Pressable>
  );
}

interface FormTabsProps {
  children: React.ReactElement<FormTabProps>[];
  defaultActiveTab?: string;
  onChange?: (tab: string) => void;
  className?: string;
  props?: any;
  style?: ViewStyle;
}

export default function FormTabs({
  children,
  defaultActiveTab,
  style,
  onChange,
  className = '',
}: FormTabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || children[0].props.title);

  return (
    <View style={[styles.container, style]}>
      {React.Children.map(children, (child) => {
        return React.cloneElement(child, {
          isActive: activeTab === child.props.title,
          onPress: () => {
            setActiveTab(child.props.title);
            onChange?.(child.props.title);
          },
        });
      })}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: theme.colors.secondary,
    padding: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  tabInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: palette.black,
  },
  tabTextInactive: {
    color: theme.colors.text,
  },
}));
