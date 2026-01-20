# Luna Full Modernization Plan - DEFINITIVE GUIDE

**Status:** Ready for execution  
**Risk Level:** HIGH (NativeWind v2→v4 is breaking)  
**Estimated Time:** 5-7 days  
**Last Updated:** January 20, 2026

---

## CURRENT STATE → TARGET STATE

| Component      | Current | Target                  | Breaking?           |
| -------------- | ------- | ----------------------- | ------------------- |
| Expo SDK       | 54.0.8  | 54.0.31 (latest stable) | No                  |
| React Native   | 0.81.4  | 0.83.1                  | No                  |
| React          | 19.1.0  | 19.2.3                  | No                  |
| NativeWind     | 2.0.11  | 4.2.1                   | **YES - MAJOR**     |
| Tailwind CSS   | 3.3.2   | 4.1.18                  | **YES - MAJOR**     |
| ESLint         | 8.57.0  | 9.39.2                  | Yes - config format |
| iOS Deployment | 15.1    | 15.1 (keep same)        | No                  |

---

## PHASE 1: NativeWind v2 → v4 Migration

This is the **MOST CRITICAL** and **MOST RISKY** part. Every step must be exact.

### 1.1 FILES THAT MUST CHANGE

| File                             | Current Pattern                                                             | New Pattern                         | Lines Affected   |
| -------------------------------- | --------------------------------------------------------------------------- | ----------------------------------- | ---------------- |
| `app/_layout.tsx`                | `NativeWindStyleSheet.setOutput()`                                          | **DELETE** - not needed             | Lines 4, 12-14   |
| `app/contexts/ThemeContext.tsx`  | `useColorScheme` from nativewind                                            | Keep but verify API                 | Line 2           |
| `components/ThemedText.tsx`      | `styled(Text)`                                                              | Use `Text` directly                 | Lines 4, 11      |
| `components/ThemeFlatList.tsx`   | `styled(FlatList)`                                                          | Use `remapProps` or direct          | Lines 3, 6, 19   |
| `components/ThemeScroller.tsx`   | `styled(ScrollView)`                                                        | Use `ScrollView` directly           | Lines 3, 14      |
| `components/ThemeFooter.tsx`     | `styled(View)`                                                              | Use `View` directly                 | Lines 3, 10      |
| `components/forms/Input.tsx`     | `styled(RNTextInput)`                                                       | Use `TextInput` directly            | Lines 3, 23      |
| `components/forms/TextInput.tsx` | `styled(RNTextInput)`                                                       | Use `TextInput` directly            | Lines 3, 19      |
| `components/AnimatedFab.tsx`     | `styled(Animated.View)`, `styled(View)`, `styled(TouchableWithoutFeedback)` | Direct usage                        | Lines 3, 15-17   |
| `babel.config.js`                | `nativewind/babel` plugin                                                   | **REMOVE** plugin                   | Line 6           |
| `metro.config.js`                | Default config                                                              | Add `withNativeWind` wrapper        | Complete rewrite |
| `tailwind.config.js`             | CommonJS + v3 format                                                        | ESM + v4 format + nativewind plugin | Complete rewrite |
| `global.css`                     | `@tailwind` directives                                                      | Same (no change needed)             | None             |

### 1.2 EXACT CONFIG FILE CHANGES

#### metro.config.js - BEFORE (current):

```javascript
const { getDefaultConfig } = require('expo/metro-config');

module.exports = getDefaultConfig(__dirname);
```

#### metro.config.js - AFTER (v4):

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: './global.css',
});
```

---

#### babel.config.js - BEFORE (current):

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel', 'react-native-worklets/plugin'],
  };
};
```

#### babel.config.js - AFTER (v4):

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
    // NOTE: nativewind/babel plugin REMOVED - not needed in v4
  };
};
```

---

#### tailwind.config.js - BEFORE (current):

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,ts,tsx}',
    './components/**/*.{js,ts,tsx}',
    './app/**/*.{js,ts,tsx}',
    './global.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit_400Regular'],
        'outfit-bold': ['Outfit_700Bold'],
      },
      spacing: {
        global: '16px',
      },
      colors: {
        highlight: '#0EA5E9',
        light: {
          primary: '#f5f5f5',
          secondary: '#ffffff',
          text: '#000000',
          subtext: '#64748B',
        },
        dark: {
          primary: '#171717',
          secondary: '#323232',
          darker: '#000000',
          text: '#ffffff',
          subtext: '#A1A1A1',
        },
      },
    },
  },
  plugins: [],
};
```

#### tailwind.config.js - AFTER (v4 + NativeWind):

```javascript
import nativewind from 'nativewind/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './app/**/*.{js,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit_400Regular'],
        'outfit-bold': ['Outfit_700Bold'],
      },
      spacing: {
        global: '16px',
      },
      colors: {
        highlight: '#0EA5E9',
        light: {
          primary: '#f5f5f5',
          secondary: '#ffffff',
          text: '#000000',
          subtext: '#64748B',
        },
        dark: {
          primary: '#171717',
          secondary: '#323232',
          darker: '#000000',
          text: '#ffffff',
          subtext: '#A1A1A1',
        },
      },
    },
  },
  plugins: [nativewind],
};
```

---

### 1.3 EXACT COMPONENT CHANGES

#### app/\_layout.tsx - BEFORE:

```tsx
import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
import { NativeWindStyleSheet } from 'nativewind';
import { ThemeProvider } from './contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerProvider } from '@/app/contexts/DrawerContext';
import useThemedNavigation from './hooks/useThemedNavigation';
import { Platform } from 'react-native';

NativeWindStyleSheet.setOutput({
  default: 'native',
});

// ... rest of file
```

#### app/\_layout.tsx - AFTER:

```tsx
import '../global.css';
import React from 'react';
import { Stack } from 'expo-router';
// REMOVED: import { NativeWindStyleSheet } from 'nativewind';
import { ThemeProvider } from './contexts/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DrawerProvider } from '@/app/contexts/DrawerContext';
import useThemedNavigation from './hooks/useThemedNavigation';
import { Platform } from 'react-native';

// REMOVED: NativeWindStyleSheet.setOutput({ default: 'native' });

// ... rest of file unchanged
```

---

#### components/ThemedText.tsx - BEFORE:

```tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
import { styled } from 'nativewind';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
}

const StyledText = styled(Text);

export default function ThemedText({ children, className, ...props }: ThemedTextProps) {
  return (
    <StyledText className={`text-black dark:text-white ${className || ''}`} {...props}>
      {children}
    </StyledText>
  );
}
```

#### components/ThemedText.tsx - AFTER:

```tsx
import React from 'react';
import { Text, TextProps } from 'react-native';
// REMOVED: import { styled } from 'nativewind';

interface ThemedTextProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

// REMOVED: const StyledText = styled(Text);

export default function ThemedText({ children, className, ...props }: ThemedTextProps) {
  return (
    <Text className={`text-black dark:text-white ${className || ''}`} {...props}>
      {children}
    </Text>
  );
}
```

---

#### components/ThemeScroller.tsx - BEFORE:

```tsx
import React from 'react';
import { ScrollView, ScrollViewProps, View, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { styled } from 'nativewind';

// ... interface ...

const StyledScrollView = styled(ScrollView);

export default function ThemedScroller({...}: ThemeScrollerProps) {
  return (
    <StyledScrollView
      // ... props
    >
      {children}
    </StyledScrollView>
  );
}
```

#### components/ThemeScroller.tsx - AFTER:

```tsx
import React from 'react';
import { ScrollView, ScrollViewProps, View, Animated, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
// REMOVED: import { styled } from 'nativewind';

// ... interface (add className?: string if not present) ...

// REMOVED: const StyledScrollView = styled(ScrollView);

export default function ThemedScroller({...}: ThemeScrollerProps) {
  return (
    <ScrollView
      // ... props unchanged
    >
      {children}
    </ScrollView>
  );
}
```

---

#### components/ThemeFooter.tsx - BEFORE:

```tsx
import React from 'react';
import { ScrollView, View, ViewProps } from 'react-native';
import { styled } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ThemeFooterProps extends ViewProps {
  children: React.ReactNode;
}

const ThemeFooter = styled(View);

export default function ThemedFooter({ children, className, ...props }: ThemeFooterProps) {
  const insets = useSafeAreaInsets();
  return (
    <ThemeFooter
      style={{ paddingBottom: insets.bottom }}
      className={`w-full bg-light-primary px-global pt-global dark:bg-dark-primary ${className || ''}`}
      {...props}>
      {children}
    </ThemeFooter>
  );
}
```

#### components/ThemeFooter.tsx - AFTER:

```tsx
import React from 'react';
import { View, ViewProps } from 'react-native';
// REMOVED: import { styled } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ThemeFooterProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
}

// REMOVED: const ThemeFooter = styled(View);

export default function ThemedFooter({ children, className, ...props }: ThemeFooterProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className={`w-full bg-light-primary px-global pt-global dark:bg-dark-primary ${className || ''}`}
      {...props}>
      {children}
    </View>
  );
}
```

---

#### components/ThemeFlatList.tsx - BEFORE:

```tsx
import React, { forwardRef } from 'react';
import { FlatList, FlatListProps } from 'react-native';
import { styled } from 'nativewind';

const StyledFlatList = styled(FlatList);

// ... component using StyledFlatList and casting to any
```

#### components/ThemeFlatList.tsx - AFTER:

```tsx
import React, { forwardRef } from 'react';
import { FlatList, FlatListProps } from 'react-native';
// REMOVED: import { styled } from 'nativewind';

export type ThemedFlatListProps<T> = FlatListProps<T> & {
  className?: string;
};

function ThemedFlatListInner<T>(
  { className, ...props }: ThemedFlatListProps<T>,
  ref: React.Ref<FlatList<T>>
) {
  return (
    <FlatList
      bounces={true}
      overScrollMode="never"
      ref={ref}
      showsVerticalScrollIndicator={false}
      className={`flex-1 bg-light-primary px-global dark:bg-dark-primary ${className || ''}`}
      {...props}
    />
  );
}

const ThemedFlatList = forwardRef(ThemedFlatListInner) as <T>(
  props: ThemedFlatListProps<T> & { ref?: React.Ref<FlatList<T>> }
) => React.ReactElement;

export default ThemedFlatList;
```

---

#### components/forms/Input.tsx & TextInput.tsx - CHANGES:

```tsx
// REMOVE this line:
import { styled } from 'nativewind';

// REMOVE this line:
const StyledTextInput = styled(RNTextInput);

// REPLACE all <StyledTextInput with <TextInput
// (TextInput is already imported as RNTextInput, just use it directly)
```

---

#### components/AnimatedFab.tsx - BEFORE:

```tsx
import { styled } from 'nativewind';
// ...
const StyledAnimatedView = styled(Animated.View);
const StyledView = styled(View);
const StyledTouchableWithoutFeedback = styled(TouchableWithoutFeedback);
```

#### components/AnimatedFab.tsx - AFTER:

```tsx
// REMOVED: import { styled } from 'nativewind';
// ...
// REMOVED: const StyledAnimatedView = styled(Animated.View);
// REMOVED: const StyledView = styled(View);
// REMOVED: const StyledTouchableWithoutFeedback = styled(TouchableWithoutFeedback);

// Then replace ALL instances:
// StyledAnimatedView -> Animated.View
// StyledView -> View
// StyledTouchableWithoutFeedback -> TouchableWithoutFeedback
```

---

### 1.4 useColorScheme - NO CHANGE NEEDED

The `useColorScheme` hook in v4 has the SAME API:

```tsx
import { useColorScheme } from 'nativewind';

const { colorScheme, setColorScheme, toggleColorScheme } = useColorScheme();
```

Your `ThemeContext.tsx` should work without changes.

---

## PHASE 2: Package Updates

### 2.1 Uninstall Old Packages

```bash
npm uninstall nativewind tailwindcss @react-native-community/viewpager
```

### 2.2 Install New Packages

```bash
npm install nativewind@^4.2.1 tailwindcss@^4.1.18
npm install react-native@0.83.1 react@^19.2.3 react-dom@^19.2.3
```

### 2.3 Update Expo Packages

```bash
npx expo install --fix
```

### 2.4 Remove Dead Dependency

The `@react-native-community/viewpager` is in package.json but NEVER imported anywhere. Safe to remove.

---

## PHASE 3: ESLint v9 Migration

### 3.1 Update Packages

```bash
npm uninstall eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-universe
npm install -D eslint@^9 @typescript-eslint/eslint-plugin@^8 @typescript-eslint/parser@^8 eslint-config-universe@^15
```

### 3.2 Create eslint.config.js (flat config)

**DELETE:** `.eslintrc` or eslintConfig in package.json

**CREATE:** `eslint.config.js`

```javascript
import universe from 'eslint-config-universe';

export default [
  ...universe.flat.node,
  ...universe.flat.react,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // Your custom rules
    },
  },
];
```

---

## PHASE 4: TypeScript `any` Cleanup

### Files with `any` that need fixing:

| File                       | Line                           | Current                                                     | Fix |
| -------------------------- | ------------------------------ | ----------------------------------------------------------- | --- |
| `BackHandlerManager.tsx:8` | `backHandlerSubscription: any` | `EmitterSubscription \| null`                               |
| `provider.tsx:51`          | `props: any`                   | Define proper interface                                     |
| `subscription.tsx:119`     | Multiple `any` in props        | Define `SelectPlanProps` interface                          |
| `subscription.tsx:141`     | `props: { label: any; ... }`   | Define `RowItemProps` interface                             |
| `DrawerButton.tsx:22`      | `NavigationProp<any>`          | Use specific navigation type                                |
| `search-form.tsx:102`      | `data: any[]`                  | Use proper generic `<T>`                                    |
| `MultiStep.tsx:22`         | `child: any`                   | `React.ReactNode`                                           |
| `ThemeFlatList.tsx:19`     | Cast to `any`                  | Remove - not needed in v4                                   |
| `suggestions.tsx:69`       | `props: any`                   | Define `SuggestionCardProps`                                |
| `ChatInput.tsx:160`        | `event: any`                   | `NativeSyntheticEvent<TextInputContentSizeChangeEventData>` |
| `ThemeTabs.tsx:72`         | `event: any`                   | `NativeSyntheticEvent<NativeScrollEvent>`                   |
| `DatePicker.tsx:95`        | `event: any`                   | `DateTimePickerEvent`                                       |
| `FormTabs.tsx:36`          | `props?: any`                  | Define proper type                                          |
| `SliderCard.tsx:18`        | `distance?: any`               | `number \| string`                                          |
| `Card.tsx:33`              | `width?: any`                  | `DimensionValue`                                            |
| `AnimatedView.tsx:236`     | `(): any`                      | `ViewStyle`                                                 |
| `Header.tsx:247`           | `onPress?: any`                | `() => void`                                                |
| `TimePicker.tsx:95`        | `event: any`                   | `DateTimePickerEvent`                                       |
| `ThemeScroller.tsx:7-8`    | `any`                          | Proper event/style types                                    |

---

## PHASE 5: Console Statement Removal

| File                        | Line                | Statement | Action |
| --------------------------- | ------------------- | --------- | ------ |
| `DrawerButton.tsx:34`       | `console.warn(...)` | REMOVE    |
| `MultiStep.tsx:124`         | `console.log(...)`  | REMOVE    |
| `MultiStep.tsx:154`         | `console.log(...)`  | REMOVE    |
| `MultiStep.tsx:167`         | `console.log(...)`  | REMOVE    |
| `BackHandlerManager.tsx:23` | `console.log(...)`  | REMOVE    |
| `BackHandlerManager.tsx:40` | `console.log(...)`  | REMOVE    |
| `BackHandlerManager.tsx:44` | `console.log(...)`  | REMOVE    |
| `BackHandlerManager.tsx:58` | `console.log(...)`  | REMOVE    |
| `BackHandlerManager.tsx:61` | `console.log(...)`  | REMOVE    |
| `BackHandlerManager.tsx:67` | `console.log(...)`  | REMOVE    |
| `BackHandlerManager.tsx:86` | `console.log(...)`  | REMOVE    |
| `signup.tsx:118`            | `console.log(...)`  | REMOVE    |
| `login.tsx:59`              | `console.log(...)`  | REMOVE    |

---

## PHASE 6: Accessibility (NEW CODE)

Every interactive component needs accessibility props. Priority files:

### Button.tsx - Add:

```tsx
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel={label || children?.toString()}
  // ... rest
>
```

### forms/Input.tsx - Add:

```tsx
<TextInput
  accessible={true}
  accessibilityLabel={label}
  accessibilityHint="Enter text"
  // ... rest
/>
```

### ChatInput.tsx - Add:

```tsx
<TextInput
  accessible={true}
  accessibilityLabel="Message input"
  accessibilityHint="Type your message here"
  // ... rest
/>
```

---

## PHASE 7: Rebuild Native Projects

After all changes:

```bash
# Clear caches
rm -rf node_modules/.cache
rm -rf .expo

# Reinstall
npm install --legacy-peer-deps

# Rebuild iOS
rm -rf ios
npx expo prebuild --platform ios --clean
cd ios && pod install && cd ..

# Test
npx expo run:ios --device
```

---

## VERIFICATION CHECKLIST

Before considering migration complete:

- [ ] `npx expo start --dev-client` works
- [ ] App builds on iOS device
- [ ] Dark mode toggle works
- [ ] All screens render correctly (manual check each)
- [ ] `npm run lint` passes
- [ ] `npm run format` runs clean
- [ ] No console.log in production code
- [ ] No TypeScript `any` remaining

---

## ROLLBACK PLAN

If migration fails:

```bash
git checkout .
npm install --legacy-peer-deps
rm -rf ios
npx expo prebuild --platform ios
```

---

## RISK SUMMARY

| Risk                       | Likelihood | Impact | Mitigation                    |
| -------------------------- | ---------- | ------ | ----------------------------- |
| Styles render differently  | HIGH       | MEDIUM | Test every screen             |
| Build fails                | MEDIUM     | HIGH   | Keep git clean, rollback plan |
| useColorScheme API change  | LOW        | MEDIUM | Verified same API             |
| Third-party packages break | MEDIUM     | MEDIUM | Update one at a time          |

---

**READY FOR EXECUTION. Proceed with Phase 1?**
