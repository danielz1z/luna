# Restore Original ThemeToggle with Sun/Moon Icons

## Context
User wants the original elegant Sun/Moon animated toggle back, not the 3-chip selector.
The 3-way (Light/Dark/System) selection will be added to settings menu later.

## What to Do

### 1. Replace ThemeSelector with restored ThemeToggle

**File:** `components/ui/ThemeSelector.tsx` → rename/replace with `ThemeToggle.tsx`

**New content** (original design + new system internals):

```tsx
import React, { useState } from 'react';
import { Pressable, Animated } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

import Icon from './Icon';
import { setThemeMode } from '@/lib/storage';

interface ThemeToggleProps {
  size?: number;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ size = 24 }) => {
  const { theme } = useUnistyles();
  const [scale] = useState(new Animated.Value(1));
  const [rotate] = useState(new Animated.Value(0));
  const [isAnimating, setIsAnimating] = useState(false);

  const animateIcon = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 45,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setIsAnimating(false));
  };

  const handlePress = () => {
    // Toggle between light and dark
    const newMode = theme.isDark ? 'light' : 'dark';
    setThemeMode(newMode);
    animateIcon();
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={{
          transform: [
            { scale },
            { rotate: rotate.interpolate({ inputRange: [0, 45], outputRange: ['0deg', '45deg'] }) },
          ],
        }}>
        {theme.isDark ? <Icon name="Sun" size={size} /> : <Icon name="Moon" size={size} />}
      </Animated.View>
    </Pressable>
  );
};

export default ThemeToggle;
```

### 2. Move setThemeMode to storage.ts

**File:** `lib/storage.ts`

Add at the bottom:

```tsx
import { UnistylesRuntime } from 'react-native-unistyles';

/**
 * Programmatically change theme mode.
 * Persists to MMKV and updates Unistyles runtime.
 */
export const setThemeMode = (mode: ThemePreference): void => {
  setThemePreference(mode);

  if (mode === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(mode);
  }
};
```

### 3. Update imports in consumers

**Files:** `components/ui/CustomDrawerContent.tsx`, `app/screens/welcome.tsx`

Change:
```tsx
import ThemeSelector from '@/components/ui/ThemeSelector';
<ThemeSelector />
```

To:
```tsx
import ThemeToggle from '@/components/ui/ThemeToggle';
<ThemeToggle />
```

### 4. Delete ThemeSelector.tsx

After ThemeToggle is working, delete `components/ui/ThemeSelector.tsx`.

## Result
- ☀️ Sun icon shows in dark mode (tap to go light)
- 🌙 Moon icon shows in light mode (tap to go dark)  
- Animated scale + rotate on tap
- Persists to MMKV
- System mode available later in settings

## Commit
```
fix(theme): restore original Sun/Moon animated toggle
```
