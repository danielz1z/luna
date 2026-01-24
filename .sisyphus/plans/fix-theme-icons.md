# Fix Theme Selector Icons

## Problem
The ThemeSelector replaced the beautiful Sun/Moon icons from ThemeToggle with plain text.

## Solution
The Chip component already supports icons via the `icon` prop. Just add them.

## Single Change Required

**File:** `components/ui/ThemeSelector.tsx`

**Replace lines 55-66:**
```tsx
  return (
    <View style={styles.container}>
      {(['light', 'dark', 'system'] as const).map((mode) => (
        <Chip
          key={mode}
          label={mode.charAt(0).toUpperCase() + mode.slice(1)} // "Light", "Dark", "System"
          isSelected={preference === mode}
          onPress={() => handleSelect(mode)}
        />
      ))}
    </View>
  );
```

**With:**
```tsx
  const modeConfig = {
    light: { label: 'Light', icon: 'Sun' as const },
    dark: { label: 'Dark', icon: 'Moon' as const },
    system: { label: 'System', icon: 'Smartphone' as const },
  };

  return (
    <View style={styles.container}>
      {(['light', 'dark', 'system'] as const).map((mode) => (
        <Chip
          key={mode}
          label={modeConfig[mode].label}
          icon={modeConfig[mode].icon}
          isSelected={preference === mode}
          onPress={() => handleSelect(mode)}
        />
      ))}
    </View>
  );
```

## Icons Used
- **Light**: Sun ☀️
- **Dark**: Moon 🌙  
- **System**: Smartphone 📱

## Commit
```
fix(theme): add Sun/Moon/Smartphone icons to ThemeSelector
```
