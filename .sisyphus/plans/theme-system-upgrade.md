# Theme System Upgrade - World-Class iOS Production-Grade

## Context

### Original Request

User requested upgrading Luna's theme system to properly use Unistyles v3 with world-class semantic colors and persistence.

### Interview Summary

**Key Discussions:**

- Current architecture has redundant layers (ThemeContext, ThemeColors) wrapping Unistyles
- 37 files use `useThemeColors()` hook (to be migrated)
- 5 files use `useTheme()` for `isDark` and `toggleTheme()`
- No theme persistence - resets on app restart
- Fixed theme toggle bug earlier in session (stale closure)

**Research Findings:**

- Unistyles v3 provides `{ theme, rt }` from `useUnistyles()` - `rt.themeName` is reactive
- Can add `isDark: boolean` directly to theme objects
- MMKV is synchronous - theme restore must happen BEFORE React renders
- Best practice: 3-way toggle with `UnistylesRuntime.setAdaptiveThemes()`
- iOS HIG semantic colors: #34C759 (success), #FF3B30 (error), #FF9500 (warning), #007AFF (info)

### Metis Review

**Identified Gaps (addressed):**

- toggleTheme() replacement: Keep minimal context with `setThemePreference()`
- Default initial state: System (follow device)
- MMKV key schema: `theme-preference` storing `'light' | 'dark' | 'system'`
- 3-way toggle UI: Create ThemeSelector component
- Migration path: Direct replacement with codemod-style AST grep

---

## Work Objectives

### Core Objective

Upgrade Luna's theme system to use Unistyles v3 properly with world-class iOS semantic colors, MMKV persistence, and 3-way theme toggle.

### Concrete Deliverables

- `lib/unistyles.ts` - Updated with `isDark`, semantic colors, MMKV persistence
- `lib/storage.ts` - MMKV instance for preferences
- `components/ui/ThemeSelector.tsx` - 3-way toggle component (Light/Dark/System)
- 36 files migrated from `useThemeColors()` → `useUnistyles()` (37th is ThemeColors.tsx itself)
- 5 files migrated from `useTheme()` to new API
- 2 files (`BotSwitch.tsx`, `ChatInput.tsx`) magic string patterns fixed
- `app/contexts/ThemeContext.tsx` - Simplified or removed
- `app/contexts/ThemeColors.tsx` - Deleted (redundant)

### Definition of Done

- [ ] Theme persists across app restart
- [ ] 3-way toggle works: Light → Dark → System → Light
- [ ] System preference changes reflect immediately when in "System" mode
- [ ] Zero imports from `ThemeColors.tsx`
- [ ] Zero `theme.colors.primary === '#171717'` patterns remain
- [ ] All 37 `useThemeColors()` consumers migrated
- [ ] App builds successfully on iOS
- [ ] No TypeScript errors

### Must Have

- `isDark: boolean` property on both theme objects
- Semantic colors: success, error, warning, info
- Text hierarchy: text, textSecondary, textTertiary, textInverse
- Background hierarchy: background (primary), backgroundSecondary, backgroundTertiary
- MMKV persistence with synchronous restore before first render
- 3-way toggle: Light / Dark / System

### Must NOT Have (Guardrails)

- ❌ DO NOT change existing color hex values (only ADD new ones)
- ❌ DO NOT change gradient visuals/logic in `components/ui/AiCircle.tsx` - only swap theme hook if applicable (Note: AiCircle is NOT in the 36 migration files - it doesn't use useThemeColors)
- ❌ DO NOT add theme transition animations
- ❌ DO NOT add additional theme variants (midnight, sepia, etc.)
- ❌ DO NOT rename existing color keys (primary, secondary, etc.)
- ❌ DO NOT refactor the `palette` object
- ❌ DO NOT modify spacing or font configuration
- ❌ DO NOT create new abstraction layers beyond what Unistyles provides

---

## Verification Strategy

### Test Decision

- **Infrastructure exists**: NO (no test setup)
- **User wants tests**: Manual verification only
- **Framework**: None
- **QA approach**: Visual verification via simulator

### Manual Verification Procedure

For each task, verification involves:

1. Running the app in iOS simulator
2. Testing theme toggle functionality
3. Force-killing and restarting to verify persistence
4. Checking all screens render correctly in both modes

---

## Task Flow

```
1. Storage Setup → 2. Theme Definition → 3. ThemeSelector UI
                                              ↓
                    4. Migrate useThemeColors (37 files)
                                              ↓
                    5. Migrate useTheme (5 files)
                                              ↓
                    6. Cleanup redundant files
                                              ↓
                    7. Final verification
```

## Parallelization

| Group | Tasks | Reason                      |
| ----- | ----- | --------------------------- |
| A     | 4a-4g | Independent file migrations |

| Task | Depends On | Reason                                         |
| ---- | ---------- | ---------------------------------------------- |
| 2    | 1          | Theme definition needs storage for persistence |
| 3    | 2          | ThemeSelector needs updated theme API          |
| 4    | 2, 3       | Migration needs new colors available           |
| 5    | 4          | useTheme migration after useThemeColors        |
| 6    | 5          | Cleanup only after all migrations              |
| 7    | 6          | Final verification after cleanup               |

---

## TODOs

- [x] 1. Create MMKV storage instance

  **What to do:**
  - Create `lib/storage.ts` with MMKV instance
  - Export theme preference getter/setter functions
  - Use synchronous MMKV API (no async)
  - Handle invalid/corrupted values gracefully

**Implementation:**

```typescript
// lib/storage.ts
// CRITICAL: This file must NOT import from lib/unistyles.ts to avoid circular dependency
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({ id: 'app-preferences' });

export type ThemePreference = 'light' | 'dark' | 'system';

const THEME_KEY = 'theme-preference';
const VALID_VALUES: ThemePreference[] = ['light', 'dark', 'system'];

export const getThemePreference = (): ThemePreference => {
  const value = storage.getString(THEME_KEY);
  // Validate: if missing or invalid, return default and fix storage
  if (!value || !VALID_VALUES.includes(value as ThemePreference)) {
    storage.set(THEME_KEY, 'system'); // Fix corrupted value
    return 'system';
  }
  return value as ThemePreference;
};

export const setThemePreference = (preference: ThemePreference): void => {
  storage.set(THEME_KEY, preference);
};
```

**CRITICAL:** `lib/storage.ts` must NOT import from `lib/unistyles.ts` (or any file that imports it) to prevent circular initialization bugs. The import direction is: `unistyles.ts` imports from `storage.ts`, never the reverse.

**Must NOT do:**

- Do not create async wrappers
- Do not add complex storage abstractions

**Parallelizable**: NO (foundation for all other tasks)

**References:**

- `package.json` line with `"react-native-mmkv": "^4.1.1"` - confirms installed
- MMKV docs pattern: `new MMKV({ id: 'preferences' })`
- Research finding: MMKV is fully synchronous, no async/await needed

**Acceptance Criteria:**

- [ ] `lib/storage.ts` exists with MMKV instance
- [ ] `getThemePreference()` returns `'light' | 'dark' | 'system'`
- [ ] `setThemePreference()` persists to MMKV
- [ ] Default value is `'system'` when no preference saved
- [ ] Invalid values (e.g., 'garbage') are corrected to 'system'
- [ ] Manual: Use React Native debugger to verify storage works
- [ ] Manual: Test invalid MMKV value handling using this procedure:
  1. Add temporary debug code at bottom of `lib/storage.ts`:
     ```typescript
     // DEBUG ONLY - remove after testing
     export const _debugSetRawTheme = (v: string) => storage.set('theme-preference', v);
     ```
  2. In any component, import and call: `_debugSetRawTheme('garbage')`
  3. Force-kill app, reopen
  4. Verify: App starts normally (defaults to system), not crash
  5. Verify: `getThemePreference()` returns `'system'` (auto-corrected)
  6. **CRITICAL: Remove debug code from `lib/storage.ts` BEFORE committing Task 1** - do NOT include debug helpers in the commit

**Commit**: YES

- Message: `feat(theme): add MMKV storage for theme persistence`
- Files: `lib/storage.ts`
- Pre-commit: TypeScript compile check

---

- [x] 2. Update theme definitions with world-class colors

  **What to do:**
  - Add `isDark: boolean` to both themes (lightTheme: false, darkTheme: true)
  - Add `name: 'light' | 'dark'` to both themes
  - Add semantic colors: `success`, `error`, `warning`, `info`
  - Add text hierarchy: `textSecondary`, `textTertiary`, `textInverse`
  - Add background hierarchy: `backgroundSecondary`, `backgroundTertiary`
  - Add `separator`, `card`, `cardPressed`, `shadow`, `shadowStrong`
  - Update TypeScript module declaration to include new properties
  - Add MMKV restore logic with exact startup sequence (see below)

  **EXACT NEW THEME KEY MAPPINGS:**

  | New Key               | Light Theme Value     | Dark Theme Value      | Notes             |
  | --------------------- | --------------------- | --------------------- | ----------------- |
  | `isDark`              | `false`               | `true`                | Boolean flag      |
  | `name`                | `'light'`             | `'dark'`              | String identifier |
  | `success`             | `#34C759`             | `#30D158`             | iOS systemGreen   |
  | `error`               | `#FF3B30`             | `#FF453A`             | iOS systemRed     |
  | `warning`             | `#FF9500`             | `#FF9F0A`             | iOS systemOrange  |
  | `info`                | `#007AFF`             | `#0A84FF`             | iOS systemBlue    |
  | `textSecondary`       | alias `subtext`       | alias `subtext`       | Reuse existing    |
  | `textTertiary`        | `#8E8E93`             | `#8E8E93`             | iOS tertiaryLabel |
  | `textInverse`         | `#FFFFFF`             | `#000000`             | For contrast      |
  | `backgroundSecondary` | alias `secondary`     | alias `secondary`     | Reuse existing    |
  | `backgroundTertiary`  | alias `sheet`         | alias `sheet`         | Reuse existing    |
  | `separator`           | `rgba(60,60,67,0.29)` | `rgba(84,84,88,0.65)` | iOS separator     |
  | `card`                | alias `secondary`     | alias `secondary`     | Reuse existing    |
  | `cardPressed`         | alias `primary`       | alias `primary`       | Reuse existing    |
  | `shadow`              | `rgba(0,0,0,0.1)`     | `rgba(0,0,0,0.3)`     | Standard shadow   |
  | `shadowStrong`        | `rgba(0,0,0,0.2)`     | `rgba(0,0,0,0.5)`     | Elevated shadow   |

  **NOTE:** "alias X" means the value should be the SAME literal as the existing key `X`. For example, if `subtext: '#6B7280'` exists, then `textSecondary: '#6B7280'` (duplicate the literal, don't reference). This avoids refactoring the object structure while achieving semantic aliasing.

  **CRITICAL: Startup Sequence (Pseudocode)**

  ```typescript
  // lib/unistyles.ts - EXACT ORDER MATTERS
  // NOTE: Unistyles v3 settings type is a union - adaptiveThemes and initialTheme are MUTUALLY EXCLUSIVE

  // 1. Import storage (synchronous)
  import { getThemePreference } from './storage';
  import { UnistylesRuntime, StyleSheet } from 'react-native-unistyles';

  // 2. Read preference BEFORE any Unistyles calls
  const preference = getThemePreference(); // 'light' | 'dark' | 'system'

  // 3. Define themes (unchanged)
  const lightTheme = { isDark: false, ... };
  const darkTheme = { isDark: true, ... };

  // 4. Configure StyleSheet - use CONDITIONAL object shape (type-correct)
  if (preference === 'system') {
    // System mode: use adaptiveThemes ONLY (no initialTheme)
    StyleSheet.configure({
      themes: { light: lightTheme, dark: darkTheme },
      settings: {
        adaptiveThemes: true,
      },
    });
    // No additional calls needed - Unistyles follows device theme
  } else {
    // Manual mode: use initialTheme ONLY (no adaptiveThemes)
    StyleSheet.configure({
      themes: { light: lightTheme, dark: darkTheme },
      settings: {
        initialTheme: preference, // 'light' or 'dark'
      },
    });
    // Explicitly disable adaptive to prevent device changes overriding user choice
    UnistylesRuntime.setAdaptiveThemes(false);
  }
  ```

  **TYPE CORRECTNESS:** In Unistyles v3, the `settings` type is a union:
  - `{ adaptiveThemes: true }` OR
  - `{ initialTheme: 'light' | 'dark' }`

  You CANNOT combine both in the same object (TypeScript will error). The conditional structure above is type-correct.

  **Why this works:** `index.js` imports `./lib/unistyles` BEFORE `expo-router/entry`, so this code runs synchronously before any React component mounts.

  **Note on import paths:** `index.js` uses `./lib/unistyles` while `app/_layout.tsx` may use `@/lib/unistyles`. Both resolve to the same module (verified). The `app/_layout.tsx` import can be kept - it doesn't affect initialization order since `index.js` runs first.

  **Must NOT do:**
  - Do not change existing color values
  - Do not modify spacing or fonts
  - Do not remove any existing color keys
  - Do not put restore logic in a React component (would cause theme flash)

  **Parallelizable**: NO (depends on task 1)

  **References:**
  - `lib/unistyles.ts:1-118` - Current theme definitions
  - `index.js:1-5` - Entry point imports lib/unistyles BEFORE expo-router (critical)
  - iOS HIG colors: #34C759 (success), #FF3B30 (error), #FF9500 (warning), #007AFF (info)
  - Dark variants: #30D158, #FF453A, #FF9F0A, #0A84FF
  - Research: `UnistylesRuntime.setAdaptiveThemes()` for system preference

  **Acceptance Criteria:**
  - [ ] `theme.isDark` returns `false` for light, `true` for dark
  - [ ] `theme.colors.success` exists in both themes
  - [ ] `theme.colors.error` exists in both themes
  - [ ] `theme.colors.warning` exists in both themes
  - [ ] `theme.colors.info` exists in both themes
  - [ ] `theme.colors.textSecondary` exists in both themes
  - [ ] `theme.colors.textTertiary` exists in both themes
  - [ ] `theme.colors.backgroundSecondary` exists in both themes
  - [ ] TypeScript: `const { theme } = useUnistyles(); theme.isDark` compiles
  - [ ] Manual: Set MMKV to 'dark', force-kill, reopen → App starts in dark mode
  - [ ] Manual: Clear MMKV, reopen → App follows system preference (adaptive)
  - [ ] Manual: No theme flash on startup

  **Commit**: YES
  - Message: `feat(theme): add world-class semantic colors and persistence`
  - Files: `lib/unistyles.ts`
  - Pre-commit: TypeScript compile check

---

- [x] 3. Create ThemeSelector component with 3-way toggle

  **What to do:**
  - Create `components/ui/ThemeSelector.tsx`
  - Show 3 options: Light, Dark, System (as horizontal pills/chips)
  - Read current preference from MMKV on mount
  - Highlight currently selected option
  - On selection: update MMKV via `setThemePreference()`, then call UnistylesRuntime
  - Use proper Unistyles StyleSheet for styling
  - Export a `setThemeMode(mode: ThemePreference)` function for programmatic use

**ThemeSelector API:**

```typescript
// Usage: Drop-in replacement for current ThemeToggle in drawer/welcome
<ThemeSelector />

// Programmatic usage (for other components that need to change theme)
import { setThemeMode } from '@/components/ui/ThemeSelector';
setThemeMode('dark'); // Updates both MMKV and Unistyles
```

**Sync mechanism (CRITICAL):** ThemeSelector uses local React state for `preference` PLUS a sync effect keyed off Unistyles theme changes to handle external `setThemeMode()` calls.

```typescript
// Inside ThemeSelector.tsx
const ThemeSelector = () => {
  // REQUIRED: Subscribe to Unistyles theme updates
  const { theme, rt } = useUnistyles();

  // CRITICAL: Use LOCAL STATE for preference
  // This guarantees re-render when user taps any option, even if resolved theme doesn't change
  const [preference, setPreference] = useState<ThemePreference>(getThemePreference);

  // SYNC EFFECT: Keep local state in sync with external setThemeMode() calls
  // Key on BOTH rt.themeName AND rt.hasAdaptiveThemes to catch all cases:
  // - rt.themeName changes: light ↔ dark transitions
  // - rt.hasAdaptiveThemes changes: system ↔ manual transitions (even if resolved theme stays same)
  useEffect(() => {
    const currentPref = getThemePreference();
    if (currentPref !== preference) {
      setPreference(currentPref);
    }
  }, [rt.themeName, rt.hasAdaptiveThemes]); // Both signals needed for full coverage

  const handleSelect = (mode: ThemePreference) => {
    setPreference(mode);  // Local state update → guaranteed re-render
    setThemeMode(mode);   // Persists to MMKV + updates Unistyles
  };

  // The component re-renders when:
  // 1. User taps an option (local state change via handleSelect)
  // 2. setThemeMode() is called externally (rt.themeName changes → useEffect syncs state)
  // 3. System preference changes in "system" mode (rt.themeName changes → useEffect syncs)

  // NOTE: Chip component API (from components/ui/Chip.tsx):
  // - Uses `isSelected` prop (not `selected`)
  // - Requires `label` prop for display text
  // - Do NOT use `selectable` prop (that enables internal state) - we need controlled selection
  return (
    <View style={styles.container}>
      {(['light', 'dark', 'system'] as const).map(mode => (
        <Chip
          key={mode}
          label={mode.charAt(0).toUpperCase() + mode.slice(1)} // "Light", "Dark", "System"
          isSelected={preference === mode}  // Uses local state (controlled)
          onPress={() => handleSelect(mode)}
          // Do NOT pass selectable={true} - we manage selection externally
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create((theme) => ({
  container: {
    backgroundColor: theme.colors.primary,
  }
}));
```

**Why this sync pattern is required:**

1. **Local state** ensures re-render even when selecting "system" doesn't change resolved theme
2. **useEffect on rt.themeName** ensures external `setThemeMode()` calls update the highlight
3. **Reading getThemePreference()** in the effect gets the actual user preference (not just resolved theme)

**Edge cases handled:**

- User taps "system" when already on matching theme → local state updates immediately (via handleSelect)
- External code calls `setThemeMode('dark')` → rt.themeName changes → effect syncs local state
- System theme changes while in "system" mode → rt.themeName changes → effect verifies preference unchanged
- **External `setThemeMode('system')` from manual light on light device** → rt.themeName doesn't change BUT `rt.hasAdaptiveThemes` changes (false → true) → effect syncs local state

**IMPORTANT: `setThemeMode()` behavior contract:**

- Calling `setThemeMode()` from any module WILL update a mounted ThemeSelector's highlight
- The sync happens via Unistyles theme change → useEffect → MMKV read
- Latency: effectively synchronous (within same React render cycle)

**EXACT `setThemeMode()` implementation (module-level export):**

```typescript
// In ThemeSelector.tsx - exported for programmatic use
import { UnistylesRuntime } from 'react-native-unistyles';
import { setThemePreference, ThemePreference } from '@/lib/storage';

export const setThemeMode = (mode: ThemePreference): void => {
  // 1. ALWAYS persist to MMKV first
  setThemePreference(mode);

  // 2. Update Unistyles based on mode
  if (mode === 'system') {
    // System mode: enable adaptive themes
    // Do NOT call setTheme() - let Unistyles follow device
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    // Manual mode: disable adaptive, then set specific theme
    // ORDER MATTERS: disable adaptive BEFORE setting theme
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(mode); // 'light' or 'dark'
  }
};
```

**Why this order matters:**

- If `setAdaptiveThemes(false)` is called AFTER `setTheme()`, a race condition can cause the device theme to briefly override
- MMKV write first ensures persistence even if Unistyles call fails

**Integration Points:**

- `components/ui/CustomDrawerContent.tsx` - Replace `<ThemeToggle />` with `<ThemeSelector />`
- `app/screens/welcome.tsx` - Replace `<ThemeToggle />` with `<ThemeSelector />`
- `components/ui/ThemeToggle.tsx` - Will be deleted after migration (Task 6)

**Must NOT do:**

- Do not add animations
- Do not create settings screen (just the selector component)

**Parallelizable**: NO (depends on task 2)

**References:**

- `components/ui/Chip.tsx:1-100` - Similar selection UI pattern
- `components/ui/ThemeToggle.tsx:1-77` - Current toggle being replaced
- `components/ui/CustomDrawerContent.tsx:12,39` - Uses ThemeToggle
- `app/screens/welcome.tsx:12,52` - Uses ThemeToggle
- Research: `UnistylesRuntime.setAdaptiveThemes(true)` for system mode
- Research: `UnistylesRuntime.setTheme('dark')` for manual mode
- `lib/storage.ts` - `setThemePreference()` function

**Acceptance Criteria:**

- [ ] Component renders 3 options (Light, Dark, System)
- [ ] Current selection is visually highlighted
- [ ] Selecting "System" calls `setAdaptiveThemes(true)` and persists 'system'
- [ ] Selecting "Light" calls `setTheme('light')`, `setAdaptiveThemes(false)`, persists 'light'
- [ ] Selecting "Dark" calls `setTheme('dark')`, `setAdaptiveThemes(false)`, persists 'dark'
- [ ] `setThemeMode()` export works for programmatic theme changes AND updates mounted ThemeSelector highlight
- [ ] Local state + useEffect sync: ThemeSelector uses `useState` for preference AND `useEffect` keyed on `[rt.themeName, rt.hasAdaptiveThemes]` to sync all external changes
- [ ] Manual: Toggle through all 3 modes, verify each works
- [ ] Manual: Theme persists after force-kill and reopen
- [ ] Manual: If testing external setThemeMode() - call from another component, verify ThemeSelector highlight updates
- [ ] Manual: Edge case - set to manual "light", then externally call `setThemeMode('system')` on a light-theme device → verify ThemeSelector shows "System" highlighted (tests rt.hasAdaptiveThemes sync)

**Where to test ThemeSelector (explicit paths):**

1. **Drawer menu**: Open app → Swipe right (or tap hamburger) → ThemeSelector visible at bottom of drawer
   - File: `components/ui/CustomDrawerContent.tsx` (after Task 6 migration)
2. **Welcome/onboarding screen**: Fresh install or logout → Welcome screen shows ThemeSelector
   - File: `app/screens/welcome.tsx` (after Task 6 migration)
   - To reach: Clear app data or use different simulator user
3. **Test all modes at each location**:
   - Light → verify light colors
   - Dark → verify dark colors
   - System → verify follows iOS Settings > Display & Brightness
4. **Test persistence**:
   - Select "Dark" in drawer → Force kill app (swipe up in app switcher) → Reopen → Should still be dark
5. **Test system mode live update**:
   - Select "System" → Go to iOS Settings > Display & Brightness > toggle Light/Dark → Return to app → Theme should have changed

**Commit**: YES

- Message: `feat(theme): add ThemeSelector with 3-way toggle`
- Files: `components/ui/ThemeSelector.tsx`
- Pre-commit: TypeScript compile check

---

- [x] 4. Migrate useThemeColors consumers (36 files)

  **What to do:**

**Import Replacement Patterns (EXACT counts verified via grep - 36 consumer files total):**

```typescript
// Pattern A: Default import with @/ prefix (24 files)
// BEFORE: import useThemeColors from '@/app/contexts/ThemeColors';
// AFTER:  import { useUnistyles } from 'react-native-unistyles';
// Files: components/layout/Divider.tsx, components/ui/VoiceSelectCard.tsx,
//        components/ui/CustomDrawerContent.tsx, components/forms/Input.tsx,
//        components/ui/Review.tsx, components/forms/Select.tsx, components/ui/Card.tsx,
//        components/ui/ProductVariantCreator.tsx, components/ui/SliderCard.tsx,
//        components/ui/SkeletonLoader.tsx, components/forms/Slider.tsx,
//        components/forms/TextInput.tsx, components/ui/ActionSheetThemed.tsx,
//        components/forms/Checkbox.tsx, components/ui/AnimatedFab.tsx,
//        components/forms/Selectable.tsx, components/ui/Chip.tsx, components/forms/Switch.tsx,
//        components/ui/ConfirmationModal.tsx, components/ui/ChatInput.tsx,
//        components/ui/PageLoader.tsx, components/ui/Toast.tsx, app/screens/search-form.tsx,
//        app/hooks/useThemedNavigation.tsx

// Pattern B: Named import with @/ prefix (6 files)
// BEFORE: import { useThemeColors } from '@/app/contexts/ThemeColors';
// AFTER:  import { useUnistyles } from 'react-native-unistyles';
// Files: Icon.tsx, Favorite.tsx, MultiStep.tsx, ShowRating.tsx, TimePicker.tsx, DatePicker.tsx

// Pattern C: Named import with bare path (no @/) (3 files)
// BEFORE: import { useThemeColors } from 'app/contexts/ThemeColors';
// AFTER:  import { useUnistyles } from 'react-native-unistyles';
// Files: DrawerButton.tsx, Header.tsx, TabButton.tsx

// Pattern D: Default import with relative path ../ (2 files)
// BEFORE: import useThemeColors from '../contexts/ThemeColors';
// AFTER:  import { useUnistyles } from 'react-native-unistyles';
// Files: welcome.tsx, subscription.tsx

// Pattern E: Named import with relative path ../ (1 file)
// BEFORE: import { useThemeColors } from '../contexts/ThemeColors';
// AFTER:  import { useUnistyles } from 'react-native-unistyles';
// Files: app/(drawer)/_layout.tsx

// TOTAL: 24 + 6 + 3 + 2 + 1 = 36 consumer files
```

**Usage Replacement:**

```typescript
// BEFORE: const colors = useThemeColors();
// AFTER:  const { theme } = useUnistyles();

// BEFORE: colors.highlight, colors.primary, etc.
// AFTER:  theme.colors.highlight, theme.colors.primary, etc.
```

**SPECIAL CASE: `colors.isDark` (4 files)**
These files access `colors.isDark` which doesn't exist on the raw colors object:

- `components/ui/AnimatedFab.tsx:70` - `colors.isDark`
- `components/ui/ProductVariantCreator.tsx:32` - `const isDark = colors.isDark`
- `components/forms/TimePicker.tsx:166` - `themeVariant={colors.isDark ? 'dark' : 'light'}`
- `components/forms/DatePicker.tsx:158` - `themeVariant={colors.isDark ? 'dark' : 'light'}`

**Migration for these files:**

```typescript
// BEFORE: colors.isDark
// AFTER:  theme.isDark  (NOT theme.colors.isDark)
```

**Must NOT do:**

- Do not change any logic beyond the hook replacement
- Do not refactor components while migrating
- Do not change gradient logic in VoiceSelectCard (only swap the hook)

**Parallelizable**: YES (split into 7 batches of ~5 files)

**References:**

- `app/contexts/ThemeColors.tsx:3-26` - Hook being replaced
- Files with named import: `app/(drawer)/_layout.tsx`, `components/forms/TimePicker.tsx`, `components/ui/Favorite.tsx`, `components/ui/Icon.tsx`, `components/ui/MultiStep.tsx`, `components/ui/ShowRating.tsx`, `components/forms/DatePicker.tsx`
- Files with `colors.isDark`: see special case above
- Pattern: `useUnistyles()` returns `{ theme, rt }`

**File List (36 files - excludes ThemeColors.tsx itself which defines the hook):**

```
components/layout/Divider.tsx
components/ui/VoiceSelectCard.tsx
components/ui/CustomDrawerContent.tsx
components/forms/Input.tsx
components/ui/Review.tsx
components/forms/Select.tsx
components/ui/DrawerButton.tsx
components/ui/Card.tsx
app/(drawer)/_layout.tsx
components/ui/ProductVariantCreator.tsx
components/ui/SliderCard.tsx
components/ui/SkeletonLoader.tsx
components/ui/Favorite.tsx
components/ui/TabButton.tsx
components/forms/TimePicker.tsx
components/forms/Slider.tsx
components/ui/Icon.tsx
app/hooks/useThemedNavigation.tsx
components/forms/TextInput.tsx
components/ui/ActionSheetThemed.tsx
components/forms/Checkbox.tsx
components/ui/AnimatedFab.tsx
components/forms/Selectable.tsx
components/ui/Chip.tsx
components/forms/Switch.tsx
components/ui/Header.tsx
app/screens/welcome.tsx
components/ui/Toast.tsx
components/ui/PageLoader.tsx
components/ui/MultiStep.tsx
components/ui/ChatInput.tsx
components/ui/ShowRating.tsx
components/ui/ConfirmationModal.tsx
app/screens/subscription.tsx
components/forms/DatePicker.tsx
app/screens/search-form.tsx
```

**Note:** Grep shows 37 files because it includes `app/contexts/ThemeColors.tsx` itself (which defines and exports the hook). That file is deleted in Task 6, not migrated.

**Acceptance Criteria:**

- [ ] Zero consumer files import from `ThemeColors.tsx` (ThemeColors.tsx itself is deleted in Task 6)
- [ ] All 36 consumer files use `useUnistyles()` pattern
- [ ] All 4 `colors.isDark` usages replaced with `theme.isDark`
- [ ] No TypeScript errors in migrated files
- [ ] Verify: `grep -r "useThemeColors" --include="*.tsx" | grep -v ThemeColors.tsx | grep -v node_modules` returns 0 results
- [ ] Manual: TimePicker/DatePicker show correct themeVariant
- [ ] Manual: Spot check 5 components render correctly

**Commit**: YES

- Message: `refactor(theme): migrate 36 files from useThemeColors to useUnistyles`
- Files: All 36 consumer files listed above
- Pre-commit: TypeScript compile check

---

- [x] 5. Migrate useTheme consumers and fix magic string patterns (7 files)

  **What to do:**

  **Part A: Migrate useTheme() consumers (5 files)**
  - Replace `import { useTheme } from '@/app/contexts/ThemeContext'` with `import { useUnistyles } from 'react-native-unistyles'`
  - Replace `const { isDark } = useTheme()` with `const { theme } = useUnistyles()` then use `theme.isDark`
  - For `toggleTheme()` usage: Replace with `setThemeMode()` from ThemeSelector

  **File-specific changes:**

  ```typescript
  // app/hooks/useThemedNavigation.tsx
  // BEFORE: const { isDark } = useTheme();
  // AFTER:  const { theme } = useUnistyles(); const isDark = theme.isDark;

  // components/forms/Select.tsx
  // BEFORE: const { isDark } = useTheme();
  // AFTER:  const { theme } = useUnistyles(); const isDark = theme.isDark;

  // components/ui/Toast.tsx
  // BEFORE: const { isDark } = useTheme();
  // AFTER:  const { theme } = useUnistyles(); const isDark = theme.isDark;

  // components/ui/ConfirmationModal.tsx
  // BEFORE: const { isDark } = useTheme();
  // AFTER:  const { theme } = useUnistyles(); const isDark = theme.isDark;

  // components/ui/ThemeToggle.tsx
  // EXCLUDED from migration - this file is DELETED in Task 6, not migrated
  // The ThemeSelector component created in Task 3 replaces it entirely
  // Update CustomDrawerContent and welcome.tsx to use ThemeSelector (done in Task 6)
  ```

  **Part B: Fix magic string patterns in StyleSheet.create (2 files)**
  Files with `theme.colors.primary === '#171717'` in StyleSheet (NOT hook-level):
  1. `components/ui/BotSwitch.tsx:84,120` - In StyleSheet.create
  2. `components/ui/ChatInput.tsx:318` - In StyleSheet.create

  ```typescript
  // components/ui/BotSwitch.tsx:84
  // BEFORE: borderColor: theme.colors.primary === '#171717' ? 'transparent' : palette.neutral300,
  // AFTER:  borderColor: theme.isDark ? 'transparent' : palette.neutral300,

  // components/ui/BotSwitch.tsx:119-122
  // BEFORE: backgroundColor: theme.colors.primary === '#171717' ? theme.colors.primary : withOpacity(theme.colors.primary, 0.1),
  // AFTER:  backgroundColor: theme.isDark ? theme.colors.primary : withOpacity(theme.colors.primary, 0.1),

  // components/ui/ChatInput.tsx:317-320
  // BEFORE: backgroundColor: theme.colors.primary === '#171717' ? withOpacity(palette.black, 0.3) : withOpacity(palette.neutral200, 0.5),
  // AFTER:  backgroundColor: theme.isDark ? withOpacity(palette.black, 0.3) : withOpacity(palette.neutral200, 0.5),
  ```

  **Expected grep outcomes for magic string cleanup:**

  ```bash
  # BEFORE Task 5 (run: grep -rn "=== '#171717'" --include="*.tsx" | grep -v node_modules):
  # Expected matches:
  #   components/ui/BotSwitch.tsx:84
  #   components/ui/BotSwitch.tsx:120
  #   components/ui/ChatInput.tsx:318
  #   app/contexts/ThemeContext.tsx:14  (deleted in Task 6, ignore for Task 5)

  # AFTER Task 5 (run same grep):
  # Expected matches:
  #   app/contexts/ThemeContext.tsx:14  (still exists until Task 6)
  # components/ and lib/ should have ZERO matches

  # AFTER Task 6 (run same grep):
  # Expected matches: NONE (0 results)
  ```

  **Must NOT do:**
  - Do not change unrelated component logic
  - Do not change `lib/unistyles.ts` where `#171717` is a color value (that stays as the dark theme primary color)

  **Parallelizable**: NO (depends on task 4)

  **References:**
  - `app/contexts/ThemeContext.tsx:1-37` - Current useTheme implementation
  - `components/ui/ThemeSelector.tsx` - Provides `setThemeMode()` export (from Task 3)
  - `components/ui/BotSwitch.tsx:84,120` - Magic string patterns
  - `components/ui/ChatInput.tsx:318` - Magic string pattern
  - `lib/unistyles.ts:39,45` - Color value definition (DO NOT CHANGE)
  - Files using useTheme: see Part A above

  **Acceptance Criteria:**
  - [ ] All 4 non-deleted useTheme files no longer import from `ThemeContext.tsx` (excludes ThemeToggle.tsx which is deleted in Task 6, not migrated)
  - [ ] `isDark` checks work correctly using `theme.isDark`
  - [ ] `BotSwitch.tsx` uses `theme.isDark` instead of magic string
  - [ ] `ChatInput.tsx` uses `theme.isDark` instead of magic string
  - [ ] Verify: `grep -r "=== '#171717'" components/ lib/` returns 0 matches (Note: ThemeContext.tsx in app/contexts/ may still have patterns until Task 6 deletes it - that's expected)
  - [ ] No TypeScript errors
  - [ ] Manual: BotSwitch and ChatInput toolbar render correctly in both themes

  **Note:** ThemeToggle.tsx is NOT migrated in this task - it remains using useTheme() until Task 6 deletes it entirely.

  **Commit**: YES
  - Message: `refactor(theme): migrate useTheme consumers and fix magic string patterns`
  - Files: 6 files (4 useTheme consumers migrated + BotSwitch.tsx + ChatInput.tsx)
  - Pre-commit: TypeScript compile check

---

- [ ] 6. Cleanup redundant theme files

  **What to do:**
  - Delete `app/contexts/ThemeColors.tsx` (fully replaced)
  - Delete `app/contexts/ThemeContext.tsx` (fully replaced)
  - Delete `components/ui/ThemeToggle.tsx` (replaced by ThemeSelector)
  - Update `components/ui/CustomDrawerContent.tsx` to use ThemeSelector
  - Update `app/screens/welcome.tsx` to use ThemeSelector
  - Remove ThemeProvider from `app/_layout.tsx` if present
  - Remove any dead code or unused exports

  **Specific changes:**

  ```typescript
  // components/ui/CustomDrawerContent.tsx
  // BEFORE: import ThemeToggle from '@/components/ui/ThemeToggle';
  //         <ThemeToggle />
  // AFTER:  import ThemeSelector from '@/components/ui/ThemeSelector';
  //         <ThemeSelector />

  // app/screens/welcome.tsx
  // BEFORE: import ThemeToggle from '@/components/ui/ThemeToggle';
  //         <ThemeToggle />
  // AFTER:  import ThemeSelector from '@/components/ui/ThemeSelector';
  //         <ThemeSelector />
  ```

  **Must NOT do:**
  - Do not delete files that are still imported somewhere
  - Verify with grep before deleting

  **Parallelizable**: NO (depends on task 5)

  **References:**
  - `app/contexts/ThemeColors.tsx` - To be deleted
  - `app/contexts/ThemeContext.tsx` - To be deleted
  - `components/ui/ThemeToggle.tsx` - To be deleted
  - `components/ui/CustomDrawerContent.tsx:12,39` - Needs ThemeToggle → ThemeSelector
  - `app/screens/welcome.tsx:12,52` - Needs ThemeToggle → ThemeSelector
  - Verify with grep: no remaining imports from deleted files

  **Acceptance Criteria:**
  - [ ] `app/contexts/ThemeColors.tsx` deleted
  - [ ] `app/contexts/ThemeContext.tsx` deleted
  - [ ] `components/ui/ThemeToggle.tsx` deleted
  - [ ] `grep -r "ThemeColors" --include="*.tsx"` returns 0 results
  - [ ] `grep -r "ThemeContext" --include="*.tsx"` returns 0 results
  - [ ] `grep -r "ThemeToggle" --include="*.tsx"` returns 0 results
  - [ ] CustomDrawerContent uses ThemeSelector
  - [ ] welcome.tsx uses ThemeSelector
  - [ ] App still builds and runs

  **Commit**: YES
  - Message: `refactor(theme): remove redundant ThemeColors, ThemeContext, and ThemeToggle`
  - Files: Deleted files + CustomDrawerContent.tsx + welcome.tsx
  - Pre-commit: TypeScript compile check

---

- [ ] 7. Final verification and edge case testing

  **What to do:**
  - Test complete theme flow end-to-end
  - Test edge cases: first launch, corrupted storage, rapid toggling
  - Verify all screens in both light and dark mode
  - Test system preference changes

  **Must NOT do:**
  - Do not add new features during verification
  - Do not fix unrelated bugs found during testing

  **Parallelizable**: NO (final step)

  **References:**
  - iOS Simulator system theme change: **Settings app → Display & Brightness → Appearance** (Light/Dark)
  - Alternative: Control Center → long-press brightness slider → Dark Mode toggle
  - All app screens for visual verification

  **Acceptance Criteria:**
  - [ ] First launch: App starts with system preference
  - [ ] Toggle Light → App uses light theme
  - [ ] Toggle Dark → App uses dark theme
  - [ ] Toggle System → App follows device setting
  - [ ] Force kill app → Reopen → Theme preference persisted
  - [ ] Change device setting while in System mode → App updates immediately
  - [ ] No visual regressions in any screen
  - [ ] Build succeeds: `npx expo run:ios`

  **Commit**: NO (verification only)

---

## Commit Strategy

| After Task | Message                                                                        | Files                                                 | Verification |
| ---------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- | ------------ |
| 1          | `feat(theme): add MMKV storage for theme persistence`                          | lib/storage.ts                                        | tsc --noEmit |
| 2          | `feat(theme): add world-class semantic colors and persistence`                 | lib/unistyles.ts                                      | tsc --noEmit |
| 3          | `feat(theme): add ThemeSelector with 3-way toggle`                             | components/ui/ThemeSelector.tsx                       | tsc --noEmit |
| 4          | `refactor(theme): migrate 36 files from useThemeColors to useUnistyles`        | 36 consumer files                                     | tsc --noEmit |
| 5          | `refactor(theme): migrate useTheme consumers and fix magic string patterns`    | 7 files (5 useTheme + BotSwitch + ChatInput)          | tsc --noEmit |
| 6          | `refactor(theme): remove redundant ThemeColors, ThemeContext, and ThemeToggle` | deleted files + CustomDrawerContent.tsx + welcome.tsx | tsc --noEmit |

---

## Success Criteria

### Verification Commands

```bash
# TypeScript check
npx tsc --noEmit

# Build iOS
npx expo run:ios

# Verify no old imports remain
grep -r "useThemeColors" --include="*.tsx" | grep -v "node_modules"
grep -r "ThemeColors" --include="*.tsx" | grep -v "node_modules"
grep -r "ThemeContext" --include="*.tsx" | grep -v "node_modules"
grep -r "ThemeToggle" --include="*.tsx" | grep -v "node_modules"

# Verify no magic string patterns remain (should only match lib/unistyles.ts color definition)
grep -r "=== '#171717'" --include="*.tsx" --include="*.ts" | grep -v "node_modules"
# Expected: 0 results (color definition uses ':' not '===')
```

### Final Checklist

- [ ] All "Must Have" items present (isDark, semantic colors, persistence, 3-way toggle)
- [ ] All "Must NOT Have" items absent (no animation, no extra themes, no gradient changes)
- [ ] Zero TypeScript errors
- [ ] App builds successfully
- [ ] Theme persists across restart
- [ ] 3-way toggle works correctly
- [ ] All screens render correctly in both modes
