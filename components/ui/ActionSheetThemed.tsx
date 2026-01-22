import React, { forwardRef } from 'react';
import ActionSheet, { ActionSheetProps, ActionSheetRef } from 'react-native-actions-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnistyles } from 'react-native-unistyles';

type ActionSheetThemedProps = ActionSheetProps;

const ActionSheetThemed = forwardRef<ActionSheetRef, ActionSheetThemedProps>(
  ({ containerStyle, ...props }, ref) => {
    const mergedContainerStyle = typeof containerStyle === 'object' ? containerStyle : {};
    const { theme } = useUnistyles();
    const insets = useSafeAreaInsets();

    return (
      <ActionSheet
        {...props}
        ref={ref}
        containerStyle={{
          backgroundColor: theme.colors.sheet,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          ...mergedContainerStyle,
          paddingBottom: insets.bottom,
        }}
      />
    );
  }
);

ActionSheetThemed.displayName = "ActionSheetThemed";

export default ActionSheetThemed;
