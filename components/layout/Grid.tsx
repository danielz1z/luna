import React from 'react';
import { View, StyleProp, ViewStyle, LayoutChangeEvent } from 'react-native';

interface GridProps {
  children: React.ReactNode[];
  columns?: number;
  spacing?: number;
  style?: StyleProp<ViewStyle>;
}

export default function Grid({ children, columns = 2, spacing = 16, style }: GridProps) {
  const [containerWidth, setContainerWidth] = React.useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const totalSpacing = spacing * (columns - 1);
  const itemWidth = containerWidth > 0 ? (containerWidth - totalSpacing) / columns : 0;

  const rows = React.useMemo(() => {
    const items = React.Children.toArray(children);
    const rowsArray = [];

    for (let i = 0; i < items.length; i += columns) {
      rowsArray.push(items.slice(i, i + columns));
    }

    return rowsArray;
  }, [children, columns]);

  return (
    <View style={[{ width: '100%' }, style]} onLayout={handleLayout}>
      {rows.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={{
            flexDirection: 'row',
            marginBottom: rowIndex < rows.length - 1 ? spacing : 0,
          }}>
          {row.map((item, colIndex) => (
            <View
              key={colIndex}
              style={{
                width: itemWidth,
                marginRight: colIndex < row.length - 1 ? spacing : 0,
              }}>
              {item}
            </View>
          ))}

          {row.length < columns &&
            Array(columns - row.length)
              .fill(null)
              .map((_, index) => (
                <View
                  key={`placeholder-${index}`}
                  style={{
                    width: itemWidth,
                    marginRight: index < columns - row.length - 1 ? spacing : 0,
                  }}
                />
              ))}
        </View>
      ))}
    </View>
  );
}
