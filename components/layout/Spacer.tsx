import React from 'react';
import { View, ViewStyle } from 'react-native';

interface SpacerProps {
  size?: number;
  orientation?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export const Spacer: React.FC<SpacerProps> = ({ size = 4, orientation = 'vertical', style }) => {
  return (
    <View
      style={[
        {
          width: orientation === 'horizontal' ? size : 'auto',
          height: orientation === 'vertical' ? size : 'auto',
        },
        style,
      ]}
    />
  );
};

export default Spacer;
