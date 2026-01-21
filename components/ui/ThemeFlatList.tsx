import React, { forwardRef } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

export type ThemedFlatListProps<T> = FlatListProps<T> & {
  className?: string;
};

function ThemedFlatListInner<T>(
  { className, ...props }: ThemedFlatListProps<T>,
  ref: React.Ref<FlatList<T>>
) {
  return (
    <FlatList
      bounces
      overScrollMode="never"
      ref={ref}
      showsVerticalScrollIndicator={false}
      style={styles.list}
      {...props}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.global,
  },
}));

const ThemedFlatList = forwardRef(ThemedFlatListInner) as <T>(
  props: ThemedFlatListProps<T> & { ref?: React.Ref<FlatList<T>> }
) => React.ReactElement;

export default ThemedFlatList;
