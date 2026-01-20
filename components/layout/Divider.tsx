import React from 'react';
import { View, ViewStyle } from 'react-native';

import useThemeColors from '@/app/contexts/ThemeColors';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  color?: string;
  thickness?: number;
  spacing?: number;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  color,
  thickness = 1,
  spacing = 0,
  style,
}) => {
  const colors = useThemeColors();
  const dividerColor = color || colors.border;

  return (
    <View
      style={[
        {
          backgroundColor: dividerColor,
          height: orientation === 'horizontal' ? thickness : '100%',
          width: orientation === 'vertical' ? thickness : '100%',
          marginVertical: orientation === 'horizontal' ? spacing : 0,
          marginHorizontal: orientation === 'vertical' ? spacing : 0,
        },
        style,
      ]}
    />
  );
};

export default Divider;
