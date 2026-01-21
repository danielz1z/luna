import React, { forwardRef } from 'react';
import { FlashList, FlashListProps, type FlashListRef } from '@shopify/flash-list';
import { StyleSheet } from 'react-native-unistyles';

export type ThemedFlatListProps<T> = FlashListProps<T> & {
  className?: string;
};

function ThemedFlatListInner<T>(
  { className, ...props }: ThemedFlatListProps<T>,
  ref: React.Ref<FlashListRef<T>>
) {
  return (
    <FlashList
      overScrollMode="never"
      ref={ref}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      {...props}
    />
  );
}

const styles = StyleSheet.create((theme) => ({
  list: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.global,
  },
}));

const ThemedFlatList = forwardRef(ThemedFlatListInner) as <T>(
  props: ThemedFlatListProps<T> & { ref?: React.Ref<FlashListRef<T>> }
) => React.ReactElement;

export default ThemedFlatList;
