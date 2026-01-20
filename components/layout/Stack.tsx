import React from 'react';
import { View, ViewStyle, FlexAlignType } from 'react-native';

interface StackProps {
  children: React.ReactNode;
  spacing?: number;
  direction?: 'vertical' | 'horizontal';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  style?: ViewStyle;
}

export const Stack: React.FC<StackProps> = ({
  children,
  spacing = 4,
  direction = 'vertical',
  align = 'start',
  justify = 'start',
  style,
}) => {
  const items = React.Children.toArray(children).filter(Boolean);

  const getAlignment = (): FlexAlignType => {
    switch (align) {
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'stretch':
        return 'stretch';
      default:
        return 'flex-start';
    }
  };

  const getJustify = () => {
    switch (justify) {
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      case 'between':
        return 'space-between';
      case 'around':
        return 'space-around';
      default:
        return 'flex-start';
    }
  };

  return (
    <View
      style={[
        {
          flexDirection: direction === 'vertical' ? 'column' : 'row',
          alignItems: getAlignment(),
          justifyContent: getJustify(),
          gap: spacing,
        },
        style,
      ]}>
      {items.map((child, index) => (
        <View key={index}>{child}</View>
      ))}
    </View>
  );
};

export default Stack;
