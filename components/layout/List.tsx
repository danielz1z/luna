import React from 'react';
import { View, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { withOpacity } from '@/app/unistyles';

interface ListProps {
  children: React.ReactNode;
  spacing?: number;
  variant?: 'plain' | 'separated' | 'divided';
  style?: ViewStyle;
}

export const List: React.FC<ListProps> = ({ children, spacing = 0, variant = 'plain', style }) => {
  // Convert children to array and filter out null/undefined
  const items = React.Children.toArray(children).filter(Boolean);

  // For 'divided' variant, we need to add borders to children
  // In RN, we render items with conditional borders instead of using divide-y
  if (variant === 'divided') {
    return (
      <View style={[{ gap: spacing }, style]}>
        {items.map((child, index) => (
          <View key={index} style={[index > 0 && styles.dividedItem]}>
            {child}
          </View>
        ))}
      </View>
    );
  }

  return <View style={[{ gap: spacing }, style]}>{items}</View>;
};

const styles = StyleSheet.create(() => ({
  dividedItem: {
    borderTopWidth: 1,
    borderTopColor: withOpacity('black', 0.1),
  },
}));

export default List;
