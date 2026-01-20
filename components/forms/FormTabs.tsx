import React, { useState } from 'react';
import { View, Pressable, ViewStyle } from 'react-native';

import ThemedText from '../ThemedText';

import { cn } from '@/lib/utils';

interface FormTabProps {
  title: string;
  isActive?: boolean;
  onPress?: () => void;
}

export function FormTab({ title, isActive, onPress }: FormTabProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 rounded-xl px-4 py-2.5 ${isActive ? 'bg-light-primary shadow-lg dark:bg-light-primary' : 'bg-transparent'}`}>
      <ThemedText
        className={`text-center text-sm font-medium ${isActive ? 'text-black dark:text-black' : 'text-black dark:text-white'}`}>
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
    <View
      className={`flex-row overflow-hidden rounded-xl bg-light-secondary p-1 dark:bg-dark-secondary ${className}`}
      style={style}>
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
