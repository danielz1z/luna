# Luna Cutting-Edge Stack Migration

## Context

### Original Request

Migrate Luna app to absolute bleeding-edge stack. User explicitly stated "no playing safe" and "no cutting corners". Forward-thinking only - no rollbacks, no safety nets.

### Interview Summary

**Key Discussions**:

- NativeWind v4 migration completed but has bugs (LinearGradient `className` not working due to missing `cssInterop`)
- User wants Expo SDK 55 canary, not stable SDK 54
- Unistyles 3.0 chosen over NativeWind due to third-party component styling issues
- ~782 `className` JSX usages across 66 component files + app screens need migration
- Theme colors in `tailwind.config.js` must be preserved exactly

**User Directives**:

- iOS priority (skip Android verification)
- No rollback branches - forward-thinking only
- No proof-of-concept - trust the research
- Remove NativeWind immediately after Unistyles ready (no incremental)
- No manual QA checkpoints - verify visuals at the end (but technical validation steps like `tsc`, `expo run:ios`, and grep checks ARE allowed during execution to catch build/type errors early)
- No bottlenecks - move fast

### Research Findings

- Unistyles 3.0 uses `StyleSheet.configure()` API (NOT `UnistylesRegistry`)
- Theme switching via `UnistylesRuntime.setTheme('dark')` and `UnistylesRuntime.setAdaptiveThemes(true/false)`
- Access theme name via `UnistylesRuntime.themeName` (not `rt.themeName` - use the runtime directly)
- Expo SDK 55 = React Native 0.83, React 19.2, New Architecture mandatory
- Migration pattern: `className="..."` → `style={styles.xxx}`

---

## Work Objectives

### Core Objective

Migrate Luna from Expo SDK 54 + NativeWind v4 to Expo SDK 55 canary + Unistyles 3.0, preserving exact visual appearance.

### Concrete Deliverables

- Expo SDK 55 canary running with New Architecture
- Unistyles 3.0 theme matching ALL current theme tokens exactly
- All `className` usages migrated to Unistyles `StyleSheet`
- LinearGradient, BlurView, Lottie rendering correctly
- NativeWind, Tailwind, and related packages fully removed
- Theme toggle working via Unistyles (replacing NativeWind's `useColorScheme`)
- `useThemeColors()` hook migrated to read from Unistyles theme

### Definition of Done

- [ ] `npx expo run:ios` builds and runs without errors
- [ ] All screens render with identical visual appearance (verified via Visual Verification Protocol below)
- [ ] Dark/light mode toggle works correctly (via Unistyles)
- [ ] LinearGradient circles render as circles (not squares)
- [ ] No NativeWind or Tailwind packages in `package.json`
- [ ] `npx tsc --noEmit` passes (TypeScript check)

### Visual Verification Protocol

To verify "identical visual appearance" at the end, follow this COMPLETE navigation path covering ALL routes in the app:

**A. Drawer Screens (MANDATORY - verify ALL)**

1. **App Launch** → Dark mode should be active by default
2. **Main Screen** (`app/(drawer)/index.tsx`) → Check:
   - Background color matches dark theme (#171717)
   - Text is white and readable
   - Cards/buttons have correct styling
3. **Lottie Screen** (`app/(drawer)/lottie.tsx`) → Verify Lottie animations play
4. **Suggestions Screen** (`app/(drawer)/suggestions.tsx`) → Verify layout
5. **Results Screen** (`app/(drawer)/results.tsx`) → Verify layout

**B. Modal/Stack Screens (MANDATORY - verify ALL)**

6. **Login Screen** (`app/screens/login.tsx`) → Verify form styling, inputs, buttons
7. **Signup Screen** (`app/screens/signup.tsx`) → Verify password strength bar colors (red/yellow/green), form layout
8. **Welcome Screen** (`app/screens/welcome.tsx`) → Verify onboarding carousel dots styling
9. **Forgot Password** (`app/screens/forgot-password.tsx`) → Verify form styling
10. **Profile Screen** (`app/screens/profile.tsx`) → Verify layout
11. **Edit Profile** (`app/screens/edit-profile.tsx`) → Verify form inputs
12. **Help Screen** (`app/screens/help.tsx`) → Verify expandable sections
13. **Provider Screen** (`app/screens/provider.tsx`) → Verify provider card styling
14. **Search Form** (`app/screens/search-form.tsx`) → Verify line-clamp text, form inputs
15. **Subscription Screen** (`app/screens/subscription.tsx`) → Verify selected plan border (sky-500), radio buttons
16. **AI Voice Screen** (`app/screens/ai-voice.tsx`) → Verify teal-300 selected state, voice cards

**C. Error Screen**

17. **404 Screen** (`app/[...404].tsx`) → Navigate to invalid route, verify error styling

**D. Critical Components (MANDATORY - verify ALL)**

18. **AiCircle Component** → Verify:
    - Microphone circle renders as a CIRCLE (not square) - THIS IS THE ORIGINAL BUG
    - Gradient colors visible
    - Lottie animation plays when active

19. **Header Component** → Verify all 3 variants:
    - Default: solid background with blur
    - Transparent: gradient overlay visible
    - Blurred: blur effect working (60%/80% opacity)

20. **Theme Toggle** → Toggle to light mode and verify:
    - Background changes to light theme (#f5f5f5)
    - Text changes to black
    - Toggle back to dark mode works

**E. Third-Party Components (MANDATORY)**

**Note**: Maps, Calendars, and Charts packages are in `package.json` but NOT currently used in any screens (verified via grep). Skip those verifications - they are dependencies but not rendered.

21. **LinearGradient** → Verify in these files:
    - `components/AiCircle.tsx` - Circle gradient (THE ORIGINAL BUG)
    - `components/Header.tsx` - Transparent variant gradient
    - `components/Card.tsx` - Card gradient
    - `components/VoiceSelectCard.tsx` - Voice card gradient

22. **BlurView** → Verify in `components/Header.tsx` (blurred variant)

23. **Lottie** → Verify in:
    - `components/AiCircle.tsx` - Speaking animation
    - `app/(drawer)/lottie.tsx` - Lottie demo screen

**F. Pass Criteria**

- All mandatory screens render without crash
- All colors match theme (dark: #171717 bg, white text; light: #f5f5f5 bg, black text)
- All third-party components visually functional
- No visual regressions (compare to current app if possible)

### Must Have

- Exact color preservation from current theme (ALL tokens from ThemeColors.tsx)
- Dark mode functionality (default to dark on load, toggleable)
- Third-party components working: LinearGradient, BlurView, Lottie (Maps, Calendars, Charts are in package.json but NOT currently rendered in any screen - skip verification)
- Font family support (`font-outfit`, `font-outfit-bold`)

### Must NOT Have (Guardrails)

- NO component logic changes - styling implementation only
- NO new features during migration
- NO responsive breakpoints (not in current app)
- NO theme restructuring - 1:1 color mapping only

---

## Theme System Migration Plan

### Current Theme Architecture

The app uses TWO theme sources that must be consolidated:

**1. Tailwind Config (`tailwind.config.js`)** - Base colors:

```js
colors: {
  highlight: '#0EA5E9',
  light: { primary: '#f5f5f5', secondary: '#ffffff', text: '#000000', subtext: '#64748B' },
  dark: { primary: '#171717', secondary: '#323232', darker: '#000000', text: '#ffffff', subtext: '#A1A1A1' },
}
```

**2. ThemeColors Hook (`app/contexts/ThemeColors.tsx`)** - Extended tokens used across ~40 files:

```ts
{
  icon: isDark ? 'white' : 'black',
  bg: isDark ? '#171717' : '#f5f5f5',
  invert: isDark ? '#000000' : '#ffffff',
  secondary: isDark ? '#323232' : '#ffffff',
  state: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
  sheet: isDark ? '#262626' : '#ffffff',
  highlight: '#0EA5E9',
  lightDark: isDark ? '#262626' : 'white',
  border: isDark ? '#404040' : '#E2E8F0',
  text: isDark ? 'white' : 'black',
  placeholder: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)',
  switch: isDark ? 'rgba(255,255,255,0.4)' : '#ccc',
  chatBg: isDark ? '#262626' : '#efefef',
  isDark,
}
```

### Migration Strategy

**Keep `useThemeColors()` as an adapter** that reads from Unistyles theme:

1. Unistyles theme will contain ALL color tokens (merged from both sources)
2. `ThemeColors.tsx` will be rewritten to use `useUnistyles()` and return the same shape
3. Components using `useThemeColors()` will continue to work without changes
4. Components using `className` with Tailwind colors will be migrated to use theme directly

### Complete Unistyles Theme (to be created in `app/unistyles.ts`):

**Theme Shape Strategy**: Both themes MUST have the same shape for TypeScript safety. `darker` is added to light theme with a semantically appropriate value.

**Usage context**: `darker` is used as `dark:bg-dark-darker` in `app/screens/ai-voice.tsx`. In dark mode it's pure black (#000000). In light mode, components using this pattern fall back to `bg-light-secondary`. For type consistency, light theme gets `darker: '#f5f5f5'` (same as primary - a neutral light background).

```ts
const lightTheme = {
  colors: {
    // From tailwind.config.js (light.*)
    highlight: '#0EA5E9',
    primary: '#f5f5f5',
    secondary: '#ffffff',
    darker: '#f5f5f5', // Added for type consistency (same as primary)
    text: '#000000',
    subtext: '#64748B',
    // From ThemeColors.tsx (light mode values)
    icon: 'black',
    bg: '#f5f5f5',
    invert: '#ffffff',
    state: 'rgba(0, 0, 0, 0.3)',
    sheet: '#ffffff',
    lightDark: 'white',
    border: '#E2E8F0',
    placeholder: 'rgba(0,0,0,0.4)',
    switch: '#ccc',
    chatBg: '#efefef',
  },
  // ... spacing, fonts
};

const darkTheme = {
  colors: {
    // From tailwind.config.js (dark.*)
    highlight: '#0EA5E9',
    primary: '#171717',
    secondary: '#323232',
    darker: '#000000', // Pure black for dark mode
    text: '#ffffff',
    subtext: '#A1A1A1',
    // From ThemeColors.tsx (dark mode values)
    icon: 'white',
    bg: '#171717',
    invert: '#000000',
    state: 'rgba(255, 255, 255, 0.3)',
    sheet: '#262626',
    lightDark: '#262626',
    border: '#404040',
    placeholder: 'rgba(255,255,255,0.4)',
    switch: 'rgba(255,255,255,0.4)',
    chatBg: '#262626',
  },
  // ... spacing, fonts
};
```

---

## Tailwind-to-RN Style Conversion Reference

### Spacing (Tailwind default 4px base)

| Tailwind              | RN Value          |
| --------------------- | ----------------- |
| `p-1`, `m-1`, `gap-1` | 4                 |
| `p-2`, `m-2`, `gap-2` | 8                 |
| `p-3`, `m-3`, `gap-3` | 12                |
| `p-4`, `m-4`, `gap-4` | 16                |
| `p-5`, `m-5`, `gap-5` | 20                |
| `p-6`, `m-6`, `gap-6` | 24                |
| `p-8`, `m-8`, `gap-8` | 32                |
| `p-global`            | 16 (custom token) |

### Font Sizes

| Tailwind    | RN fontSize |
| ----------- | ----------- |
| `text-xs`   | 12          |
| `text-sm`   | 14          |
| `text-base` | 16          |
| `text-lg`   | 18          |
| `text-xl`   | 20          |
| `text-2xl`  | 24          |
| `text-3xl`  | 30          |
| `text-4xl`  | 36          |

### Border Radius

| Tailwind       | RN borderRadius |
| -------------- | --------------- |
| `rounded-sm`   | 2               |
| `rounded`      | 4               |
| `rounded-md`   | 6               |
| `rounded-lg`   | 8               |
| `rounded-xl`   | 12              |
| `rounded-2xl`  | 16              |
| `rounded-3xl`  | 24              |
| `rounded-full` | 9999            |

### Font Weight

| Tailwind        | RN fontWeight |
| --------------- | ------------- |
| `font-normal`   | '400'         |
| `font-medium`   | '500'         |
| `font-semibold` | '600'         |
| `font-bold`     | '700'         |

### Opacity

| Tailwind      | RN opacity |
| ------------- | ---------- |
| `opacity-0`   | 0          |
| `opacity-25`  | 0.25       |
| `opacity-50`  | 0.5        |
| `opacity-75`  | 0.75       |
| `opacity-100` | 1          |

### Layout

| Tailwind          | RN Style                          |
| ----------------- | --------------------------------- |
| `flex-1`          | `flex: 1`                         |
| `flex-row`        | `flexDirection: 'row'`            |
| `flex-col`        | `flexDirection: 'column'`         |
| `items-center`    | `alignItems: 'center'`            |
| `justify-center`  | `justifyContent: 'center'`        |
| `justify-between` | `justifyContent: 'space-between'` |
| `w-full`          | `width: '100%'`                   |
| `h-full`          | `height: '100%'`                  |
| `absolute`        | `position: 'absolute'`            |
| `relative`        | `position: 'relative'`            |

### Arbitrary Values (Tailwind `[value]` syntax)

These patterns are used in `components/AiCircle.tsx`, `components/Header.tsx`, and others:

| Tailwind       | RN Style       |
| -------------- | -------------- |
| `h-[250px]`    | `height: 250`  |
| `w-[250px]`    | `width: 250`   |
| `w-[140px]`    | `width: 140`   |
| `h-[140px]`    | `height: 140`  |
| `w-[120px]`    | `width: 120`   |
| `h-[120px]`    | `height: 120`  |
| `z-[9999]`     | `zIndex: 9999` |
| `z-[500]`      | `zIndex: 500`  |
| `-right-[3px]` | `right: -3`    |
| `mt-[1px]`     | `marginTop: 1` |

**Pattern**: Remove `px`/`%` suffix and brackets. For negative values, keep the negative sign.

### Color Opacity Syntax (Tailwind `color/opacity`)

Used in `components/Header.tsx` line 119:

| Tailwind              | RN Style                                      |
| --------------------- | --------------------------------------------- |
| `bg-light-primary/60` | `backgroundColor: 'rgba(245, 245, 245, 0.6)'` |
| `bg-dark-primary/80`  | `backgroundColor: 'rgba(23, 23, 23, 0.8)'`    |

**Implementation**: Since theme colors are hex, convert to rgba:

```tsx
// Option 1: Hardcode the rgba values
const styles = StyleSheet.create((theme) => ({
  blurredBg: {
    // For light: theme.colors.primary (#f5f5f5) at 60% opacity
    backgroundColor:
      UnistylesRuntime.themeName === 'dark'
        ? 'rgba(23, 23, 23, 0.8)' // dark.primary at 80%
        : 'rgba(245, 245, 245, 0.6)', // light.primary at 60%
  },
}));

// Option 2: Create a helper in unistyles.ts
export const withOpacity = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
```

### Negative Margins and Custom Spacing Tokens

Used in `components/CardScroller.tsx`:

| Tailwind     | RN Style                                     |
| ------------ | -------------------------------------------- |
| `-mx-global` | `marginHorizontal: -16` (negative of global) |
| `-mt-px`     | `marginTop: -1`                              |
| `px-global`  | `paddingHorizontal: theme.spacing.global`    |
| `pt-global`  | `paddingTop: theme.spacing.global`           |
| `mr-global`  | `marginRight: theme.spacing.global`          |
| `pb-10`      | `paddingBottom: 40`                          |

### Z-Index Values

| Tailwind | RN zIndex |
| -------- | --------- |
| `z-30`   | 30        |
| `z-50`   | 50        |
| `z-100`  | 100       |

### Overflow

| Tailwind           | RN Style              |
| ------------------ | --------------------- |
| `overflow-visible` | `overflow: 'visible'` |
| `overflow-hidden`  | `overflow: 'hidden'`  |

### Spacing Between Children (space-x-_, space-y-_)

Used in `components/ConfirmationModal.tsx` and others. In RN, use `gap` on parent instead:

| Tailwind    | RN Style (on parent)               |
| ----------- | ---------------------------------- |
| `space-x-1` | `gap: 4, flexDirection: 'row'`     |
| `space-x-2` | `gap: 8, flexDirection: 'row'`     |
| `space-x-3` | `gap: 12, flexDirection: 'row'`    |
| `space-x-4` | `gap: 16, flexDirection: 'row'`    |
| `space-y-2` | `gap: 8, flexDirection: 'column'`  |
| `space-y-4` | `gap: 16, flexDirection: 'column'` |

**Note**: RN `gap` is supported in New Architecture. Use `columnGap`/`rowGap` for finer control.

### Divide (divide-y, divide-x)

Used in `components/layout/List.tsx`. In RN, use borders on children or a Divider component:

| Tailwind             | RN Approach                                          |
| -------------------- | ---------------------------------------------------- |
| `divide-y`           | Add `borderTopWidth: 1` to all children except first |
| `divide-y-2`         | Add `borderTopWidth: 2` to all children except first |
| `divide-neutral-200` | `borderTopColor: '#e5e5e5'`                          |

**Implementation**: Either add border styles to list items, or render a `<View style={{ height: 1, backgroundColor: theme.colors.border }} />` between items.

### Screen Dimensions

Used in `app/(drawer)/index.tsx`:

| Tailwind   | RN Style                                                           |
| ---------- | ------------------------------------------------------------------ |
| `h-screen` | `height: Dimensions.get('window').height` or `flex: 1` on root     |
| `w-screen` | `width: Dimensions.get('window').width` or `width: '100%'` on root |

**Note**: In most cases, `flex: 1` on parent is sufficient and more reliable than screen dimensions.

### Fractional Positioning

Used in `components/TabButton.tsx`:

| Tailwind    | RN Style                                    |
| ----------- | ------------------------------------------- |
| `-left-1/3` | `left: '-33.33%'` (or calculate from width) |
| `left-1/2`  | `left: '50%'`                               |
| `w-1/2`     | `width: '50%'`                              |
| `w-1/3`     | `width: '33.33%'`                           |

### Additional Border Radius

Used in `components/Button.tsx`. Note: `rounded-xs` is NOT in Tailwind defaults - treat as custom:

| Tailwind       | RN borderRadius                                        |
| -------------- | ------------------------------------------------------ |
| `rounded-xs`   | 2 (custom - same as rounded-sm, or check actual usage) |
| `rounded-none` | 0                                                      |

**Handling unknown classes**: If a class like `rounded-xs` appears, check the component's actual rendered appearance and match it. The codebase may have custom Tailwind config or it renders as `rounded-sm`.

### Gap Direction (gap-x-_, gap-y-_)

Used in `components/ChatInput.tsx`, `components/ShowRating.tsx`:

| Tailwind  | RN Style       |
| --------- | -------------- |
| `gap-x-1` | `columnGap: 4` |
| `gap-x-2` | `columnGap: 8` |
| `gap-y-2` | `rowGap: 8`    |

**Note**: RN supports `columnGap` and `rowGap` in New Architecture.

### Line Clamp (text truncation)

Used in `app/screens/search-form.tsx`:

| Tailwind       | RN Approach                          |
| -------------- | ------------------------------------ |
| `line-clamp-1` | `numberOfLines={1}` prop on `<Text>` |
| `line-clamp-2` | `numberOfLines={2}` prop on `<Text>` |

**Note**: `line-clamp-*` in Tailwind uses `-webkit-line-clamp`. In RN, use the `numberOfLines` prop directly.

### Object Fit (Images)

| Tailwind         | RN Style / Prop               |
| ---------------- | ----------------------------- |
| `object-cover`   | `resizeMode="cover"` on Image |
| `object-contain` | `resizeMode="contain"`        |
| `object-fill`    | `resizeMode="stretch"`        |

### Pseudo-State Styling (active:, pressed states)

Used in `components/MultiStep.tsx`, `components/layout/ListItem.tsx`, `components/forms/Selectable.tsx`:

| Tailwind                    | RN Approach                         |
| --------------------------- | ----------------------------------- |
| `active:bg-light-secondary` | Use `Pressable` with style callback |

**Implementation Pattern**:

```tsx
// Before (NativeWind)
<TouchableOpacity className="active:bg-light-secondary dark:active:bg-dark-secondary">

// After (RN with Pressable)
<Pressable
  style={({ pressed }) => [
    styles.base,
    pressed && styles.pressed
  ]}
>

// In StyleSheet
const styles = StyleSheet.create((theme) => ({
  base: { /* default styles */ },
  pressed: { backgroundColor: theme.colors.secondary },
}))
```

**Note**: `TouchableOpacity` has built-in opacity feedback. For custom pressed styles, use `Pressable` with the style callback pattern.

### expo-router Link Styling (IMPORTANT)

After removing NativeWind, `className` on `<Link>` components will have no effect. Found usages:

- `components/CardScroller.tsx:39`: `<Link href={allUrl} className="dark:text-white">`
- `components/EditScreenInfo.tsx:11`: `<Link href="/screens/home" className="text-4xl font-semibold">`

**Migration Pattern for Link components:**

```tsx
// BEFORE (NativeWind)
<Link href={allUrl} className="dark:text-white">
  View All
</Link>

// AFTER (Option 1: Use asChild with styled Text)
<Link href={allUrl} asChild>
  <Text style={styles.linkText}>View All</Text>
</Link>

// Or with ThemedText component:
<Link href={allUrl} asChild>
  <ThemedText style={styles.linkText}>View All</ThemedText>
</Link>

// In StyleSheet
const styles = StyleSheet.create((theme) => ({
  linkText: {
    color: theme.colors.text, // Replaces dark:text-white
    fontSize: 16,
  },
}))
```

**Why `asChild`**: expo-router's `Link` component renders a `<Text>` by default when wrapping text content. Using `asChild` passes the link behavior to the child component, allowing you to style the child directly.

**Alternative for simple text links:**

```tsx
// If Link wraps only text and needs theme color
<Link href={allUrl}>
  <ThemedText>View All</ThemedText>
</Link>
```

### Non-Theme Color Opacity Patterns (white/xx, black/xx)

Used across many files (Header.tsx, List.tsx, search-form.tsx, etc.):

| Tailwind          | RN Value                                      |
| ----------------- | --------------------------------------------- |
| `bg-white/20`     | `backgroundColor: 'rgba(255, 255, 255, 0.2)'` |
| `bg-white/50`     | `backgroundColor: 'rgba(255, 255, 255, 0.5)'` |
| `bg-black/10`     | `backgroundColor: 'rgba(0, 0, 0, 0.1)'`       |
| `bg-black/20`     | `backgroundColor: 'rgba(0, 0, 0, 0.2)'`       |
| `divide-black/10` | `borderColor: 'rgba(0, 0, 0, 0.1)'`           |
| `divide-white/10` | `borderColor: 'rgba(255, 255, 255, 0.1)'`     |
| `text-white/80`   | `color: 'rgba(255, 255, 255, 0.8)'`           |

**Implementation**: Create a `withOpacity()` helper in `app/unistyles.ts`:

```ts
// Add to app/unistyles.ts
export const withOpacity = (color: string, opacity: number): string => {
  // Handle named colors
  if (color === 'white') return `rgba(255, 255, 255, ${opacity})`;
  if (color === 'black') return `rgba(0, 0, 0, ${opacity})`;

  // Handle hex colors
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Usage in components:
import { withOpacity } from '@/app/unistyles';
// ...
backgroundColor: withOpacity('white', 0.2);
// or with theme color:
backgroundColor: withOpacity(theme.colors.primary, 0.6);
```

**IMPORTANT**: The `withOpacity()` helper MUST be created in Task 2 as part of `app/unistyles.ts`. It is a required deliverable, not optional.

### Non-Theme Tailwind Palette Colors (found in codebase)

These colors appear in the codebase and need explicit hex values. Source: Tailwind CSS v3.4 default palette.

| Tailwind Class       | Hex Value | Usage Locations                                                     |
| -------------------- | --------- | ------------------------------------------------------------------- |
| `bg-red-500`         | `#ef4444` | Header badges, ConfirmationModal delete button, signup strength bar |
| `bg-green-500`       | `#22c55e` | Signup password strength bar (strong)                               |
| `bg-yellow-500`      | `#eab308` | Signup password strength bar (medium)                               |
| `bg-sky-500`         | `#0ea5e9` | Subscription buttons/indicators                                     |
| `bg-teal-300`        | `#5eead4` | ai-voice.tsx selected state                                         |
| `bg-gray-200`        | `#e5e5e5` | ScreenContent divider, ProductVariantCreator tags                   |
| `bg-gray-700`        | `#374151` | ProductVariantCreator tags (dark mode)                              |
| `bg-white`           | `#ffffff` | BotSwitch background                                                |
| `text-gray-500`      | `#6b7280` | TimePicker/DatePicker placeholder text                              |
| `text-gray-600`      | `#4b5563` | Card subtitle text                                                  |
| `text-gray-300`      | `#d1d5db` | Card subtitle text (dark mode)                                      |
| `text-gray-800`      | `#1f2937` | CustomDrawerContent name text                                       |
| `text-gray-200`      | `#e5e5e5` | CustomDrawerContent name text (dark mode)                           |
| `border-neutral-200` | `#e5e5e5` | Provider dividers, CustomDrawerContent borders                      |
| `border-neutral-300` | `#d4d4d4` | BotSwitch border, ProductVariantCreator                             |
| `border-neutral-400` | `#a3a3a3` | ProductVariantCreator borders                                       |
| `border-neutral-500` | `#737373` | ProductVariantCreator borders                                       |

**Implementation**: Hardcode these hex values inline in StyleSheet.create, or add them to the Unistyles theme under a `palette` key:

```tsx
const theme = {
  colors: {
    /* existing */
  },
  palette: {
    red500: '#ef4444',
    green500: '#22c55e',
    // etc.
  },
};
```

---

## className Handling Policy

**End State**: No `className` JSX usage anywhere. `className` props/types in component interfaces are acceptable to keep for backwards compatibility but should not be used.

**Verification Method** (Two-Step Process):

Step 1: Run grep to find candidates

```bash
grep -rn "className=" --include="*.tsx" app/ components/
```

Step 2: For any matches, manually verify they are NOT JSX usage:

- **OK (keep)**: `className?: string` (type definition)
- **OK (keep)**: `// className="..."` (comment)
- **OK (keep)**: `className: string` (type/interface property)
- **NOT OK (migrate)**: `<View className="...">` (JSX prop)
- **NOT OK (migrate)**: `className={...}` (JSX dynamic prop)

**Acceptance Criteria**: After running grep, all matches must be type definitions or comments. Zero matches of JSX `className=` props.

**Alternative Stricter Pattern** (if available):

```bash
# This pattern is more specific but may miss edge cases
grep -rn 'className=["{]' --include="*.tsx" app/ components/
```

The stricter pattern matches `className="` or `className={` which are JSX patterns, reducing false positives from type definitions like `className?: string`.

**Migration Pattern for className Props**:

```tsx
// Before: Component accepts className
interface CardProps {
  className?: string;  // KEEP this for API compatibility
}
const Card = ({ className }: CardProps) => {
  return <View className={className}>  // MIGRATE this to style
}

// After: Component accepts className but uses style internally
interface CardProps {
  className?: string;  // Keep for API (unused, for backwards compat)
  style?: ViewStyle;   // Add style prop as replacement
}
const Card = ({ style }: CardProps) => {
  return <View style={[styles.container, style]}>  // Use style prop
}
```

**"Don't change component props interface" clarification**:

- Adding `style?: ViewStyle` prop is ALLOWED (it's additive, not breaking)
- Keeping `className?: string` prop is ALLOWED (for backwards compatibility)
- Removing `className` prop is ALLOWED if there are no external consumers
- The guardrail "Don't change component props interface" means: don't change the TYPE or BEHAVIOR of existing props, and don't remove props that are actively used by callers

---

## Dynamic Tailwind Class Patterns (CRITICAL)

Some components use **dynamic/interpolated Tailwind class names** that require special handling. These CANNOT be converted 1:1 to static Unistyles because the class name itself is computed at runtime.

### Found Dynamic Patterns

**1. `components/Chip.tsx` (line 119):**

```tsx
// BEFORE (dynamic class interpolation)
className={`text-${textSizeClass} ${isChipSelected ? '...' : '...'}`}

// textSizeClass comes from sizeClasses[size].split(' text-')[1]
// Results in classes like: text-xs, text-sm, text-base, text-lg
```

**Solution**: Replace dynamic class lookup with explicit style mapping:

```tsx
// AFTER (Unistyles with mapping)
const textSizeMap = {
  xs: 12,   // text-xs
  sm: 14,   // text-sm
  base: 16, // text-base
  lg: 18,   // text-lg
} as const;

// In component, derive fontSize from size prop:
style={{ fontSize: textSizeMap[size] || 14 }}
```

**2. `components/Button.tsx` - dynamic style lookups:**

```tsx
// Uses: buttonStyles[variant], buttonSize[size], roundedStyles[rounded]
// These are already object lookups, but values contain className strings
```

**Solution**: Convert the style lookup objects to contain RN style objects instead of className strings:

```tsx
// BEFORE
const buttonStyles = {
  primary: 'bg-dark-primary dark:bg-light-primary',
  secondary: 'bg-light-secondary dark:bg-dark-secondary',
};

// AFTER (in StyleSheet.create)
const styles = StyleSheet.create((theme) => ({
  buttonPrimary: { backgroundColor: theme.colors.primary },
  buttonSecondary: { backgroundColor: theme.colors.secondary },
}));

// Then use: style={styles[`button${variant}`]} or conditional style arrays
```

### General Migration Pattern for Dynamic Classes

1. **Identify** all components using template literals with variables in className: ``className={`${variable}`}``
2. **Extract** the possible values the variable can take
3. **Create** a Unistyles style object with explicit keys for each value
4. **Replace** className interpolation with style lookup: `style={styles[key]}`

### Components Requiring Dynamic Pattern Handling

Based on codebase analysis, these components have complex dynamic patterns:

| Component           | Dynamic Pattern                               | Migration Approach                   |
| ------------------- | --------------------------------------------- | ------------------------------------ |
| `Chip.tsx`          | `text-${textSizeClass}`                       | Map size prop to fontSize directly   |
| `Button.tsx`        | `${buttonStyles[variant]}`                    | Convert style lookup objects         |
| `Card.tsx`          | `${getRoundedClass()}`                        | Convert to style generator function  |
| `CustomCard.tsx`    | `${getRoundedClass()}`, `${getShadowClass()}` | Convert to style generator functions |
| `ImageCarousel.tsx` | `${getRoundedClass()}`                        | Convert to style generator function  |
| `TabButton.tsx`     | Conditional opacity                           | Use style array with condition       |

**IMPORTANT for executor**: When you encounter any `${variable}` inside a className template literal, do NOT simply remove it. Analyze what values the variable can take and create explicit style mappings.

---

## Native Folders Policy

**Current state**: `ios/` directory exists locally but is untracked in git. It contains generated content from `expo prebuild`.

**Policy for this migration**:

- Native folders (`ios/`, `android/`) are **NOT committed** to the repository
- They are generated via `npx expo prebuild` and should be `.gitignore`d
- Before any `prebuild --clean` step, the existing `ios/` folder will be deleted and regenerated
- Add to `.gitignore` (if not already present):
  ```
  # Native
  ios/
  android/
  ```
- Commit file lists in this plan do NOT include native folder contents

**Why**: This is a managed Expo project. Native code is generated from config, not hand-written. Committing native folders causes merge conflicts and bloat.

---

## App Configuration Note

**Current**: `app.json` has `"userInterfaceStyle": "light"`

**Impact**: This sets the iOS/Android system UI style (status bar, etc.) but does NOT affect Unistyles theme.

**Resolution**: Unistyles `initialTheme: 'dark'` controls our app's theme independently. The `userInterfaceStyle` can stay `"light"` OR be changed to `"automatic"` - it won't conflict with our dark theme because:

- Unistyles manages our component colors via its own theme system
- `userInterfaceStyle` only affects system chrome (status bar, keyboard, etc.)

**Recommendation**: Leave `"userInterfaceStyle": "light"` unchanged for now. If user wants system chrome to match, they can change it later (out of scope for this migration).

---

## Task Flow

```
Task 1 (Upgrade Expo SDK 55)
    ↓
Task 2 (Install Unistyles + configure complete theme + migrate ThemeContext + ThemeColors)
    ↓
Task 3 (Remove NativeWind completely + cleanup all config files)
    ↓
Task 4-7 (Migrate all components - parallel batches)
    ↓
Task 8 (Migrate all app screens)
    ↓
Task 9 (Update Cursor rules + Final build and verification)
```

## Parallelization

| Group | Tasks      | Reason                        |
| ----- | ---------- | ----------------------------- |
| A     | 4, 5, 6, 7 | Independent component batches |

| Task | Depends On | Reason                                                    |
| ---- | ---------- | --------------------------------------------------------- |
| 2    | 1          | Need SDK 55 before Unistyles                              |
| 3    | 2          | Need Unistyles + ThemeContext migrated before removing NW |
| 4-7  | 3          | Need NW removed to avoid conflicts                        |
| 8    | 4-7        | Screens depend on migrated components                     |
| 9    | 8          | Final verify after all migration                          |

---

## TODOs

- [x] 1. Upgrade Expo to SDK 55 canary

  **What to do**:
  - Run `npm install expo@canary`
  - Run `npx expo install --fix` to upgrade all Expo packages
  - Update `react` and `react-native` if not auto-updated
  - Update `babel-preset-expo` to match SDK 55
  - Run `npx expo prebuild --clean` to regenerate native projects

  **Must NOT do**:
  - Don't touch any styling code yet

  **Parallelizable**: NO (must be first)

  **References**:
  **Pattern References**:
  - `package.json:22-60` - Current versions: expo ~54.0.31, react-native 0.81.5, react 19.1.0

  **External References**:
  - Expo SDK 55 canary: Run `npm info expo@canary` to see latest canary version
  - After install, run `npx expo install --fix` which auto-resolves compatible versions

  **Acceptance Criteria**:
  - [ ] `npm list expo` shows `expo@55.x.x-canary.x`
  - [ ] `npm list react-native` shows `react-native@0.83.x`
  - [ ] `npx expo prebuild --clean` completes without errors
  - [ ] `npx tsc --noEmit` passes

  **Commit**: YES
  - Message: `feat: upgrade to Expo SDK 55 canary`
  - Files: All tracked changes from SDK 55 upgrade (package.json, package-lock.json, and any other files modified by `expo install --fix`). Do NOT commit generated native folders.

---

- [x] 2. Install Unistyles 3.0, configure complete theme, and migrate theme system

  **What to do**:

  **Part A: Install Unistyles 3.0**
  - Install Unistyles 3.0: `npm install react-native-unistyles@next`
  - Install Nitro Modules: `npm install react-native-nitro-modules@0.33.0` (pinned version for Unistyles 3.0.0 - per https://github.com/jpudysz/react-native-unistyles README "use a fixed version")
  - Install Edge-to-Edge: `npm install react-native-edge-to-edge`
    - **Note**: This is a Unistyles 3.0 dependency. If build errors mention edge-to-edge setup, consult https://github.com/zoontek/react-native-edge-to-edge#readme for initialization steps.
  - Add Unistyles babel plugin to `babel.config.js` (PRESERVE existing plugins):
    ```js
    plugins: [
      'react-native-worklets/plugin', // KEEP existing
      [
        'react-native-unistyles/plugin',
        {
          root: 'app', // REQUIRED: main app source folder
          autoProcessPaths: ['components'], // Process components folder outside root
          debug: true, // Enable logging to verify plugin is working
        },
      ],
    ];
    ```
  - **Plugin Configuration Explained**:
    - `root: 'app'` (REQUIRED): Unistyles processes all files in this folder. This covers `app/**/*.tsx`.
    - `autoProcessPaths: ['components']`: Extends processing to the `components/` folder which is outside `root`. Per Unistyles docs, this option "works independently of root" and can be used for local folders.
    - `debug: true`: Enables logging so you can verify the plugin is processing files correctly.
  - **Plugin Ordering**: Keep `react-native-worklets/plugin` before Unistyles plugin. While worklets docs don't explicitly require "first" position, maintaining the existing order is safer. If build fails with plugin conflicts, try reversing order.
  - **Verification** (CRITICAL - must do before proceeding):
    1. Run `npx expo start --clear` (clears cache to ensure babel processes fresh)
    2. Check Metro bundler logs for Unistyles debug output like:
       ```
       [Unistyles] Processing: app/_layout.tsx
       [Unistyles] Processing: components/Card.tsx
       ```
    3. If NO debug output appears for both folders, the plugin config is wrong - STOP and debug.
    4. Verify files from BOTH `app/` and `components/` appear in logs.
    5. Once verified, you can set `debug: false` to reduce log noise (optional).

  **Part B: Create Unistyles configuration with COMPLETE theme**
  - Create `app/unistyles.ts` with ALL color tokens from both `tailwind.config.js` AND `ThemeColors.tsx`:

    ```ts
    import { StyleSheet } from 'react-native-unistyles';

    const lightTheme = {
      colors: {
        // From tailwind.config.js
        highlight: '#0EA5E9',
        primary: '#f5f5f5',
        secondary: '#ffffff',
        darker: '#f5f5f5', // Added for type consistency (same as primary in light mode)
        text: '#000000',
        subtext: '#64748B',
        // From ThemeColors.tsx (additional tokens)
        icon: 'black',
        bg: '#f5f5f5',
        invert: '#ffffff',
        state: 'rgba(0, 0, 0, 0.3)',
        sheet: '#ffffff',
        lightDark: 'white',
        border: '#E2E8F0',
        placeholder: 'rgba(0,0,0,0.4)',
        switch: '#ccc',
        chatBg: '#efefef',
      },
      spacing: {
        global: 16,
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      fonts: {
        regular: 'Outfit_400Regular',
        bold: 'Outfit_700Bold',
      },
    } as const;

    const darkTheme = {
      colors: {
        // From tailwind.config.js
        highlight: '#0EA5E9',
        primary: '#171717',
        secondary: '#323232',
        darker: '#000000',
        text: '#ffffff',
        subtext: '#A1A1A1',
        // From ThemeColors.tsx (additional tokens)
        icon: 'white',
        bg: '#171717',
        invert: '#000000',
        state: 'rgba(255, 255, 255, 0.3)',
        sheet: '#262626',
        lightDark: '#262626',
        border: '#404040',
        placeholder: 'rgba(255,255,255,0.4)',
        switch: 'rgba(255,255,255,0.4)',
        chatBg: '#262626',
      },
      spacing: {
        global: 16,
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      fonts: {
        regular: 'Outfit_400Regular',
        bold: 'Outfit_700Bold',
      },
    } as const;

    type AppThemes = {
      light: typeof lightTheme;
      dark: typeof darkTheme;
    };

    declare module 'react-native-unistyles' {
      export interface UnistylesThemes extends AppThemes {}
    }

    StyleSheet.configure({
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
      settings: {
        initialTheme: 'dark', // Force dark mode on initial load (matches current behavior)
      },
    });

    // REQUIRED: withOpacity helper for white/xx, black/xx, and theme color/xx patterns
    export const withOpacity = (color: string, opacity: number): string => {
      if (color === 'white') return `rgba(255, 255, 255, ${opacity})`;
      if (color === 'black') return `rgba(0, 0, 0, ${opacity})`;

      // Handle hex colors (e.g., theme.colors.primary)
      const hex = color.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    // REQUIRED: Non-theme palette colors (from Tailwind default palette)
    export const palette = {
      red500: '#ef4444',
      green500: '#22c55e',
      yellow500: '#eab308',
      sky500: '#0ea5e9',
      teal300: '#5eead4',
      gray200: '#e5e5e5',
      gray300: '#d1d5db',
      gray500: '#6b7280',
      gray600: '#4b5563',
      gray700: '#374151',
      gray800: '#1f2937',
      neutral200: '#e5e5e5',
      neutral300: '#d4d4d4',
      neutral400: '#a3a3a3',
      neutral500: '#737373',
      white: '#ffffff',
      black: '#000000',
    } as const;
    ```

  **Part C: Migrate ThemeContext to use Unistyles (with reactivity)**

  **CRITICAL REACTIVITY MODEL**:
  - `useUnistyles()` hook provides reactivity - components using it re-render when theme changes
  - `UnistylesRuntime.*` getters (e.g., `UnistylesRuntime.themeName`) are **NOT reactive by themselves**
  - Re-render is triggered ONLY via `useUnistyles()` subscription
  - The `ThemeProvider` MUST use `useUnistyles()` hook to ensure `isDark` updates reactively
  - Update `app/contexts/ThemeContext.tsx` to replace NativeWind's `useColorScheme`:

    ```tsx
    import React, { createContext, useContext } from 'react';
    import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

    type ThemeContextType = {
      isDark: boolean;
      toggleTheme: () => void;
    };

    const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

    export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
      // useUnistyles() provides reactivity - this component re-renders when theme changes
      // Without this hook, UnistylesRuntime.themeName would NOT trigger re-renders
      const { theme } = useUnistyles();

      // Now we can safely read themeName - the useUnistyles() above ensures reactivity
      const isDark = UnistylesRuntime.themeName === 'dark';

      const toggleTheme = () => {
        // Disable adaptive themes when manually toggling
        if (UnistylesRuntime.hasAdaptiveThemes) {
          UnistylesRuntime.setAdaptiveThemes(false);
        }
        // This changes the theme - useUnistyles() subscribers will re-render
        UnistylesRuntime.setTheme(isDark ? 'light' : 'dark');
      };

      return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>
      );
    };

    export const useTheme = () => {
      const context = useContext(ThemeContext);
      if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
      }
      return context;
    };

    export default ThemeContext;
    ```

  **Why this works**: `useUnistyles()` subscribes to Unistyles' internal state. When `UnistylesRuntime.setTheme()` is called, Unistyles notifies all `useUnistyles()` subscribers, causing components to re-render with the new theme. The `UnistylesRuntime` object itself is NOT reactive - you must use the hook.

  **Justification for `useUnistyles()` at ThemeProvider root**:
  - Unistyles docs caution against broad use of `useUnistyles()` due to re-renders (see: https://unistyl.es/v3/references/use-unistyles "when to avoid")
  - However, ThemeProvider is the ONLY place we need reactivity for `isDark` toggle
  - Expected re-render trigger: theme changes only (via `setTheme()`)
  - All other components get theme values from `StyleSheet.create((theme) => ...)` which is automatically reactive via Babel plugin transformation
  - This is the minimum viable hook usage for theme toggle functionality

  **HARD RULE for useUnistyles() usage** (enforced across all tasks):
  - Destructure ONLY `{ theme }` from `useUnistyles()` - NEVER destructure `rt` or use `useUnistyles().rt.*`
  - `UnistylesRuntime.*` (imported separately) is OK for one-off reads but NOT reactive
  - If you need reactivity in a component, use `StyleSheet.create((theme) => ...)` pattern instead of `useUnistyles()`
  - Exception: ThemeProvider (for `isDark` toggle) and ThemeColors adapter (for hook interface)

  **Part D: Migrate ThemeColors hook to read from Unistyles**
  - Update `app/contexts/ThemeColors.tsx` to use Unistyles theme:

    ```tsx
    import { UnistylesRuntime, useUnistyles } from 'react-native-unistyles';

    export const useThemeColors = () => {
      // useUnistyles() provides reactive access to the current theme
      const { theme } = useUnistyles();

      // Use UnistylesRuntime.themeName for isDark check (reactive in useUnistyles context)
      const isDark = UnistylesRuntime.themeName === 'dark';

      return {
        icon: theme.colors.icon,
        bg: theme.colors.bg,
        invert: theme.colors.invert,
        secondary: theme.colors.secondary,
        state: theme.colors.state,
        sheet: theme.colors.sheet,
        highlight: theme.colors.highlight,
        lightDark: theme.colors.lightDark,
        border: theme.colors.border,
        text: theme.colors.text,
        placeholder: theme.colors.placeholder,
        switch: theme.colors.switch,
        chatBg: theme.colors.chatBg,
        isDark,
      };
    };

    export default useThemeColors;
    ```

  **Note**: This hook returns the same shape as before, so components using `useThemeColors()` don't need to change. The only difference is the data source (Unistyles theme instead of hardcoded values).

  **Part E: Update app/\_layout.tsx**
  - Import `./unistyles` at the VERY TOP (before any component imports):
    ```tsx
    import './unistyles'; // MUST be first import - configures Unistyles before any StyleSheet usage
    import '../global.css'; // Keep for now, removed in Task 3
    import { Stack } from 'expo-router';
    // ... rest of imports
    ```

  **Must NOT do**:
  - Don't add colors that don't exist in current theme
  - Don't remove NativeWind yet (next task)
  - Don't remove `import '../global.css'` yet (Task 3)

  **Parallelizable**: NO (depends on 1)

  **References**:
  **Pattern References**:
  - `tailwind.config.js:14-29` - Base colors (highlight, light._, dark._)
  - `tailwind.config.js:7-10` - Font family names (`Outfit_400Regular`, `Outfit_700Bold`)
  - `app/contexts/ThemeColors.tsx:6-21` - Extended color tokens (icon, bg, invert, state, sheet, etc.)
  - `babel.config.js` - Current config has `react-native-worklets/plugin` - MUST preserve
  - `app/_layout.tsx:1` - Currently imports `'../global.css'` (note: relative path `../` not `./`)
  - `app/contexts/ThemeContext.tsx` - Uses `useColorScheme` from `nativewind` - MUST replace

  **Plugin Ordering Note**: The worklets plugin docs (https://docs.swmansion.com/react-native-worklets) don't explicitly require first position, but maintaining current order is safest. If Babel build fails after adding Unistyles plugin:
  1. Try swapping plugin order
  2. Clear Metro cache: `npx expo start --clear`
  3. Check plugin version compatibility
  4. Consult Unistyles Discord/GitHub issues for known conflicts

  **External References** (Unistyles 3.0 APIs):
  - Configuration: `StyleSheet.configure({ themes: {...}, settings: { initialTheme: 'dark' } })`
    - Docs: https://unistyl.es/v3/start/configuration
  - Theme access hook: `const { theme } = useUnistyles()` - returns current theme object, triggers re-render on change
    - Docs: https://unistyl.es/v3/references/use-unistyles
  - Runtime API (NOT reactive by itself - only reactive when component uses `useUnistyles()`):
    - `UnistylesRuntime.themeName` - current theme name string
    - `UnistylesRuntime.setTheme('dark')` - change theme
    - `UnistylesRuntime.hasAdaptiveThemes` - boolean
    - `UnistylesRuntime.setAdaptiveThemes(false)` - disable system theme following
    - Docs: https://unistyl.es/v3/references/unistyles-runtime
  - Dependency pinning: `react-native-nitro-modules@0.33.0` per https://github.com/jpudysz/react-native-unistyles#compatibility

  **Acceptance Criteria**:
  - [ ] `npm list react-native-unistyles` shows `3.x.x`
  - [ ] `app/unistyles.ts` exists with light and dark themes
  - [ ] Both themes have 16 color tokens with identical shape (highlight, primary, secondary, darker, text, subtext, icon, bg, invert, state, sheet, lightDark, border, placeholder, switch, chatBg)
  - [ ] Font families defined in themes (`Outfit_400Regular`, `Outfit_700Bold`)
  - [ ] `withOpacity()` helper function exported from `app/unistyles.ts` (handles 'white', 'black', and hex colors)
  - [ ] `palette` object exported from `app/unistyles.ts` with non-theme colors: red500, green500, yellow500, sky500, teal300, gray200, gray300, gray500, gray600, gray700, gray800, neutral200, neutral300, neutral400, neutral500
  - [ ] `babel.config.js` has Unistyles plugin with `root: 'app'` and `autoProcessPaths: ['components']` AND preserves `react-native-worklets/plugin`
  - [ ] Babel plugin verification: `npx expo start --clear` shows Unistyles debug output for files in BOTH `app/` AND `components/` folders (with `debug: true`)
  - [ ] `app/_layout.tsx` imports `./unistyles` as FIRST import
  - [ ] `app/contexts/ThemeContext.tsx` uses `UnistylesRuntime` instead of NativeWind's `useColorScheme`
  - [ ] `app/contexts/ThemeColors.tsx` uses `useUnistyles()` to read theme colors
  - [ ] `npx tsc --noEmit` passes

  **Commit**: YES
  - Message: `feat: install Unistyles 3.0 and migrate theme system`
  - Files: `package.json`, `babel.config.js`, `app/unistyles.ts`, `app/_layout.tsx`, `app/contexts/ThemeContext.tsx`, `app/contexts/ThemeColors.tsx`

---

- [ ] 3. Remove NativeWind and Tailwind completely (including all config cleanup)

  **What to do**:

  **Part A: Uninstall packages**
  - Run: `npm uninstall nativewind tailwindcss tailwind-merge clsx prettier-plugin-tailwindcss`

  **Part B: Delete config files**
  - Delete `tailwind.config.js`
  - Delete `global.css`
  - Delete `nativewind-env.d.ts`

  **Part C: Update babel.config.js**
  - Remove `'nativewind/babel'` from presets
  - Keep `'babel-preset-expo'` preset
  - Keep `react-native-worklets/plugin` plugin
  - Keep `react-native-unistyles/plugin` plugin

  **Part D: Update metro.config.js**
  - Remove `withNativeWind` wrapper entirely
  - Remove `input: './global.css'` reference
  - Result should be basic metro config:
    ```js
    const { getDefaultConfig } = require('expo/metro-config');
    const config = getDefaultConfig(__dirname);
    module.exports = config;
    ```

  **Part E: Update TypeScript configuration**
  - Update `app-env.d.ts` - Remove nativewind reference:
    ```ts
    // Empty file or remove entirely
    ```
  - Update `tsconfig.json` - Remove `nativewind-env.d.ts` from include:
    ```json
    {
      "include": ["**/*.ts", "**/*.tsx"]
    }
    ```

  **Part F: Update prettier.config.js**
  - Remove `prettier-plugin-tailwindcss` plugin:
    ```js
    module.exports = {
      printWidth: 100,
      tabWidth: 2,
      singleQuote: true,
      bracketSameLine: true,
      trailingComma: 'es5',
      // Remove plugins array entirely
    };
    ```

  **Part G: Handle lib/utils.ts and cn() usages**

  **IMPORTANT**: This is the ONE exception to "don't touch component files" - we must remove cn() imports to avoid build errors after uninstalling clsx/tailwind-merge.
  - Search for cn() usages: `grep -rn "from.*lib/utils" .` or `grep -rn "cn(" .`
  - For each file that imports cn():
    - Remove the import: `import { cn } from '@/lib/utils'` or similar
    - Replace cn() calls with the first argument only (or just remove if unused)
    - Example: `cn('base-class', condition && 'conditional-class')` → just use the raw className for now (will be migrated in Tasks 4-7)
  - After all cn() usages are removed, delete `lib/utils.ts`

  **Scope**: Only remove cn() imports/usages in this task. Do NOT migrate className to Unistyles yet - that happens in Tasks 4-7.

  **Part H: Update app/\_layout.tsx**
  - Remove `import '../global.css';` line

  **Part I: Update .gitignore for native folders**
  - Add to `.gitignore` (if not already present):
    ```
    # Native (generated by expo prebuild)
    ios/
    android/
    ```
  - Delete existing `ios/` folder if present (it will be regenerated)

  **Part J: Run prebuild**
  - Run `npx expo prebuild --clean`

  **Must NOT do**:
  - Don't remove `react-native-worklets/plugin` from babel
  - Don't migrate className to Unistyles yet (only remove cn() imports/usages)

  **Parallelizable**: NO (depends on 2)

  **References**:
  **Pattern References**:
  - `babel.config.js` - Current: `presets: ['babel-preset-expo', 'nativewind/babel']` → Remove `'nativewind/babel'`
  - `metro.config.js` - Current: uses `withNativeWind(config, { input: './global.css' })` → Remove wrapper
  - `app-env.d.ts` - Has `/// <reference types="nativewind/types" />` → Remove/empty
  - `tsconfig.json:15` - Has `"nativewind-env.d.ts"` in include → Remove
  - `prettier.config.js:8` - Has `plugins: [require.resolve('prettier-plugin-tailwindcss')]` → Remove
  - `lib/utils.ts` - Has `cn()` using clsx + tailwind-merge → Delete file
  - `app/_layout.tsx:1` - Has `import '../global.css';` → Remove line
  - `tailwind.config.js` - DELETE entire file (colors now in `app/unistyles.ts`)
  - `global.css` - DELETE entire file
  - `nativewind-env.d.ts` - DELETE entire file

  **Acceptance Criteria**:
  - [ ] `npm list nativewind` shows "not installed"
  - [ ] `npm list tailwindcss` shows "not installed"
  - [ ] `npm list clsx` shows "not installed"
  - [ ] `npm list tailwind-merge` shows "not installed"
  - [ ] No `tailwind.config.js` in project root
  - [ ] No `global.css` in project root
  - [ ] No `nativewind-env.d.ts` in project root
  - [ ] No `lib/utils.ts` file (or no cn() function usages)
  - [ ] `babel.config.js` has NO `'nativewind/babel'` preset
  - [ ] `babel.config.js` STILL has `react-native-worklets/plugin`
  - [ ] `metro.config.js` has NO `withNativeWind` reference
  - [ ] `app-env.d.ts` has NO nativewind reference
  - [ ] `tsconfig.json` has NO `nativewind-env.d.ts` in include
  - [ ] `prettier.config.js` has NO `prettier-plugin-tailwindcss`
  - [ ] `app/_layout.tsx` has NO `import '../global.css'`
  - [ ] `.gitignore` includes `ios/` and `android/`

  **Commit**: YES
  - Message: `chore: remove NativeWind, Tailwind, and all related configuration`
  - Files: `package.json`, `babel.config.js`, `metro.config.js`, `app-env.d.ts`, `tsconfig.json`, `prettier.config.js`, `app/_layout.tsx`, `.gitignore`, deleted files (`tailwind.config.js`, `global.css`, `nativewind-env.d.ts`, `lib/utils.ts`)

---

- [ ] 4. Migrate core themed components

  **What to do**:
  - Migrate `components/ThemedText.tsx`:
    - Import `{ StyleSheet } from 'react-native-unistyles'`
    - Replace all `className` with `style={styles.xxx}`
    - Create stylesheet using theme colors and fonts for text variants
    - Handle font family: `fontFamily: theme.fonts.bold` for bold text
  - Migrate `components/ThemeScroller.tsx`:
    - Replace className with Unistyles styles
    - Handle contentContainerStyle for ScrollView
  - Migrate `components/ThemeFlatList.tsx`:
    - Replace className with styles
  - Migrate `components/ThemeFooter.tsx`:
    - Replace className with styles
  - Migrate `components/ThemeTabs.tsx`:
    - Replace className with styles
  - Migrate `components/ThemeToggle.tsx`:
    - **Note**: This file has minimal/no `className` usage (mostly inline styles + Icon)
    - Primary check: ensure `useTheme()` hook still works correctly after ThemeContext migration
    - This is a **theme integration verification task**, not primarily className migration

  **Migration Pattern** (use Tailwind-to-RN conversion table above):

  ```tsx
  // Before (NativeWind)
  <Text className="text-light-text dark:text-dark-text text-lg font-outfit-bold">

  // After (Unistyles)
  import { StyleSheet } from 'react-native-unistyles'

  <Text style={styles.title}>

  const styles = StyleSheet.create((theme) => ({
    title: {
      color: theme.colors.text,
      fontSize: 18,  // text-lg = 18
      fontFamily: theme.fonts.bold,
    },
  }))
  ```

  **Must NOT do**:
  - Don't change component BEHAVIOR (logic, interactions, state)
  - Don't remove props that external callers depend on
  - Don't change existing prop TYPES

  **Allowed Props Changes** (per className Handling Policy):
  - Adding `style?: ViewStyle` prop is ALLOWED (additive, non-breaking)
  - Keeping unused `className?: string` prop is ALLOWED (backwards compat)
  - Removing `className` prop is ALLOWED only if no external consumers

  **Parallelizable**: YES (with 5, 6, 7)

  **References**:
  **Pattern References**:
  - `components/ThemedText.tsx` - Minimal wrapper: adds `className="text-black dark:text-white"` to Text. After migration, keep it minimal: apply default text color from theme, accept `style` prop for overrides.
  - `components/ThemeScroller.tsx` - ScrollView styling
  - `components/ThemeFlatList.tsx` - FlatList styling
  - `components/ThemeFooter.tsx` - Footer styling
  - `components/ThemeTabs.tsx` - Tab styling
  - `components/ThemeToggle.tsx` - Toggle button styling
  - `app/unistyles.ts` - Theme with colors and fonts

  **Conversion Reference**:
  - See "Tailwind-to-RN Style Conversion Reference" section above

  **Acceptance Criteria**:
  - [ ] No `className` JSX usage in ThemedText, ThemeScroller, ThemeFlatList, ThemeFooter, ThemeTabs, ThemeToggle
  - [ ] All components use `StyleSheet.create` from `react-native-unistyles`
  - [ ] Font families use `theme.fonts.regular` or `theme.fonts.bold`
  - [ ] (Note: `tsc --noEmit` deferred to Task 8 - className still present in unmigrated files)

  **Commit**: YES
  - Message: `refactor: migrate core themed components to Unistyles`
  - Files: `components/ThemedText.tsx`, `components/ThemeScroller.tsx`, `components/ThemeFlatList.tsx`, `components/ThemeFooter.tsx`, `components/ThemeTabs.tsx`, `components/ThemeToggle.tsx`

---

- [ ] 5. Migrate UI components (Card, Button, Chip, layout components)

  **What to do**:
  - Migrate `components/Card.tsx`:
    - Replace all className with Unistyles styles
    - **IMPORTANT**: Card.tsx has LinearGradient with `className="relative flex h-full w-full flex-col justify-end"` (line 159)
    - Must convert to `style` prop:

      ```tsx
      // Before (Card.tsx line 157-159)
      <LinearGradient
        colors={overlayGradient}
        className="relative flex h-full w-full flex-col justify-end">

      // After
      <LinearGradient
        colors={overlayGradient}
        style={{ position: 'relative', flex: 1, width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'flex-end' }}>
      ```

  - Migrate `components/Button.tsx`
  - Migrate `components/Chip.tsx`
  - Migrate `components/layout/List.tsx`
  - Migrate `components/layout/ListItem.tsx`
  - Migrate `components/layout/Section.tsx`
  - Migrate `components/layout/Stack.tsx`
  - Migrate `components/layout/Grid.tsx`
  - Migrate `components/layout/Divider.tsx`
  - Migrate `components/layout/Spacer.tsx`
  - Migrate `components/CardScroller.tsx`
  - Handle dynamic/conditional styles using style arrays

  **Dynamic Styles Pattern**:

  ```tsx
  // Before
  className={`${selected ? 'bg-highlight' : 'bg-light-secondary dark:bg-dark-secondary'}`}

  // After (style array)
  style={[styles.base, selected && styles.selected]}

  // In StyleSheet
  const styles = StyleSheet.create((theme) => ({
    base: { backgroundColor: theme.colors.secondary },
    selected: { backgroundColor: theme.colors.highlight },
  }))
  ```

  **Must NOT do**:
  - Don't change component BEHAVIOR (logic, interactions, press handlers)
  - Don't remove props that external callers depend on
  - Don't change existing prop TYPES

  **Allowed Props Changes** (per className Handling Policy):
  - Adding `style?: ViewStyle` prop is ALLOWED (additive, non-breaking)
  - Keeping unused `className?: string` prop is ALLOWED (backwards compat)
  - Removing `className` prop is ALLOWED only if no external consumers

  **Parallelizable**: YES (with 4, 6, 7)

  **References**:
  **Pattern References**:
  - `components/Card.tsx` - LinearGradient with className (needs style prop)
  - `components/Chip.tsx` - Has conditional className for selected state
  - `components/layout/List.tsx` - List container styling
  - `components/layout/ListItem.tsx` - List item styling
  - `components/layout/Section.tsx` - Section with title styling
  - `components/layout/Stack.tsx` - Stack layout
  - `components/layout/Grid.tsx` - Grid layout
  - `components/layout/Divider.tsx` - Divider styling
  - `components/layout/Spacer.tsx` - Spacer component

  **Conversion Reference**:
  - See "Tailwind-to-RN Style Conversion Reference" section above

  **Acceptance Criteria**:
  - [ ] No `className` JSX usage in Card, Button, Chip, and all layout/\* components
  - [ ] LinearGradient in Card uses `style` prop instead of `className`
  - [ ] Selected/active states work correctly
  - [ ] (Note: `tsc --noEmit` deferred to Task 8 - NativeWind types removed but className still present in unmigrated files)

  **Commit**: YES
  - Message: `refactor: migrate UI and layout components to Unistyles`
  - Files: Card, Button, Chip, CardScroller, and all layout/\* components

---

- [ ] 6. Migrate AiCircle, Header, and special components (CRITICAL)

  **What to do**:
  - Migrate `components/AiCircle.tsx`:
    - **THIS FIXES THE ORIGINAL BUG**
    - LinearGradient must use `style` prop: `style={{ borderRadius: 9999, width: '100%', height: '100%' }}`
    - This makes circles render as circles (not squares)
  - Migrate `components/Header.tsx`:
    - BlurView uses `style` prop directly (like LinearGradient)
    - LinearGradient also present - use style prop
  - Migrate `components/VoiceSelectCard.tsx`:
    - Another LinearGradient to fix
  - Migrate `components/Icon.tsx`
  - Migrate `components/Avatar.tsx`
  - Migrate `components/SafeWrapper.tsx`
  - Migrate `components/Container.tsx`
  - Migrate `components/TabScreenWrapper.tsx`
  - Migrate `components/CustomDrawerContent.tsx`

  **LinearGradient Fix Pattern**:

  ```tsx
  // Before (broken - NativeWind doesn't support className on third-party)
  <LinearGradient className="rounded-full h-full w-full" colors={[...]}>

  // After (works - direct style prop)
  <LinearGradient
    style={{ borderRadius: 9999, height: '100%', width: '100%' }}
    colors={[...]}
  >
  ```

  **Must NOT do**:
  - Don't change component BEHAVIOR (animation logic, safe area handling)
  - Don't remove props that external callers depend on
  - Don't change existing prop TYPES

  **Allowed Props Changes** (per className Handling Policy):
  - Adding `style?: ViewStyle` prop is ALLOWED (additive, non-breaking)
  - Keeping unused `className?: string` prop is ALLOWED (backwards compat)
  - Removing `className` prop is ALLOWED only if no external consumers

  **Parallelizable**: YES (with 4, 5, 7)

  **References**:
  **Pattern References**:
  - `components/AiCircle.tsx` - LinearGradient with `rounded-full` that's broken (line ~29)
  - `components/VoiceSelectCard.tsx` - Another LinearGradient (line ~82)
  - `components/Header.tsx` - BlurView and LinearGradient usage
  - `components/Icon.tsx` - Icon styling
  - `components/Avatar.tsx` - Avatar image styling
  - `components/SafeWrapper.tsx` - Safe area wrapper
  - `components/Container.tsx` - Container styling
  - `components/TabScreenWrapper.tsx` - Tab screen wrapper
  - `components/CustomDrawerContent.tsx` - Drawer content styling

  **Acceptance Criteria**:
  - [ ] No `className` JSX usage in AiCircle, Header, VoiceSelectCard, Icon, Avatar, SafeWrapper, Container, TabScreenWrapper, CustomDrawerContent
  - [ ] LinearGradient in AiCircle uses `style={{ borderRadius: 9999 }}`
  - [ ] BlurView in Header uses `style` prop
  - [ ] (Note: `tsc --noEmit` deferred to Task 8 - className still present in unmigrated files)

  **Commit**: YES
  - Message: `fix: migrate AiCircle and Header to Unistyles, fix LinearGradient rendering`
  - Files: AiCircle, Header, VoiceSelectCard, Icon, Avatar, SafeWrapper, Container, TabScreenWrapper, CustomDrawerContent

---

- [ ] 7. Migrate all remaining components

  **What to do**:

  **Authoritative Scope Definition**: "Remaining components" = all files in `components/**/*.tsx` that have JSX `className=` usage MINUS files already migrated in Tasks 4, 5, and 6.

  To generate the authoritative list at execution time:

  ```bash
  grep -rln 'className=["{]' --include="*.tsx" components/
  ```

  Then exclude files covered by Tasks 4-6.
  - Migrate each component following established patterns. Expected remaining components include:
    - `components/DrawerButton.tsx`
    - `components/FloatingButton.tsx`
    - `components/MultipleImagePicker.tsx`
    - `components/Favorite.tsx`
    - `components/BotSwitch.tsx`
    - `components/Toast.tsx`
    - `components/PageLoader.tsx`
    - `components/ChatInput.tsx`
    - `components/ConfirmationModal.tsx`
    - `components/Toggle.tsx`
    - `components/CustomCard.tsx`
    - `components/AnimatedView.tsx`
    - `components/Placeholder.tsx`
    - `components/ShowRating.tsx`
    - `components/TabButton.tsx`
    - `components/AnimatedFab.tsx`
    - `components/ChipExamples.tsx`
    - `components/MultiStep.tsx`
    - `components/ImageCarousel.tsx`
    - `components/Expandable.tsx`
    - `components/Review.tsx`
    - `components/ListLink.tsx`
    - `components/SkeletonLoader.tsx`
    - `components/Sphere.tsx`
    - `components/SliderCard.tsx`
    - `components/ProductVariantCreator.tsx`
    - `components/ScreenContent.tsx`
    - `components/ActionSheetThemed.tsx`
    - `components/EditScreenInfo.tsx`
    - `components/forms/Input.tsx`
    - `components/forms/Select.tsx`
    - `components/forms/Checkbox.tsx`
    - `components/forms/FormTabs.tsx`
    - `components/forms/Selectable.tsx`
    - `components/forms/Switch.tsx`
    - `components/forms/Counter.tsx`
    - `components/forms/TimePicker.tsx`
    - `components/forms/TextInput.tsx`
    - `components/forms/Slider.tsx`
    - `components/forms/DatePicker.tsx`
  - For third-party components (Modal, ActionSheet, etc.), use `style` prop
  - **IMPORTANT**: Migrate `Link` components with className (see "expo-router Link Styling" section):
    - `components/CardScroller.tsx` - `<Link className="dark:text-white">`
    - `components/EditScreenInfo.tsx` - `<Link className="text-4xl font-semibold">`

  **Must NOT do**:
  - Don't skip any component
  - Don't leave partial migrations
  - Don't change component BEHAVIOR (logic, interactions)
  - Don't remove props that external callers depend on

  **Allowed Props Changes** (per className Handling Policy):
  - Adding `style?: ViewStyle` prop is ALLOWED (additive, non-breaking)
  - Keeping unused `className?: string` prop is ALLOWED (backwards compat)
  - Removing `className` prop is ALLOWED only if no external consumers

  **Parallelizable**: YES (with 4, 5, 6)

  **References**:
  **Pattern References**:
  - All previously migrated components for patterns
  - `components/` directory - all 66 component files total

  **Conversion Reference**:
  - See "Tailwind-to-RN Style Conversion Reference" section above

  **Acceptance Criteria**:
  - [ ] `grep -rn 'className=["{]' --include="*.tsx" components/` returns empty (this pattern targets JSX usage, not type definitions)
  - [ ] All components use Unistyles StyleSheet
  - [ ] (Note: `tsc --noEmit` deferred to Task 8 - className still present in app/ screens)

  **Commit**: YES
  - Message: `refactor: migrate remaining components to Unistyles`
  - Files: All remaining component files (~40 files)

---

- [ ] 8. Migrate all app screens

  **What to do**:
  - Find all screens with className: `grep -rn "className=" app/`
  - Migrate root layout: `app/_layout.tsx`
    - Replace `className` on `GestureHandlerRootView` with `style`
  - Migrate drawer layout: `app/(drawer)/_layout.tsx`
  - Migrate all screen files:
    - `app/(drawer)/index.tsx`
    - `app/(drawer)/lottie.tsx`
    - `app/(drawer)/suggestions.tsx`
    - `app/(drawer)/results.tsx`
  - Find and migrate any other screens in `app/` directory

  **Root Layout Fix**:

  ```tsx
  // Before (app/_layout.tsx)
  <GestureHandlerRootView
    className={`bg-light-primary dark:bg-dark-primary ${Platform.OS === 'ios' ? 'pb-0 ' : ''}`}
    style={{ flex: 1 }}>

  // After
  <GestureHandlerRootView style={styles.root}>

  // In StyleSheet
  const styles = StyleSheet.create((theme) => ({
    root: {
      flex: 1,
      backgroundColor: theme.colors.primary,
    },
  }))
  ```

  **Must NOT do**:
  - Don't change routing logic
  - Don't modify navigation structure

  **Parallelizable**: NO (depends on components being done)

  **References**:
  **Pattern References**:
  - `app/_layout.tsx` - Root layout with GestureHandlerRootView className
  - `app/(drawer)/_layout.tsx` - Drawer layout
  - `app/(drawer)/index.tsx` - Main screen
  - `app/(drawer)/lottie.tsx` - Lottie demo screen
  - `app/(drawer)/suggestions.tsx` - Suggestions screen
  - `app/(drawer)/results.tsx` - Results screen

  **Acceptance Criteria**:
  - [ ] `grep -rn 'className=["{]' --include="*.tsx" app/` returns empty (JSX usage pattern)
  - [ ] All layouts and screens use Unistyles StyleSheet
  - [ ] `npx tsc --noEmit` passes

  **Commit**: YES
  - Message: `refactor: migrate all app screens to Unistyles`
  - Files: All files in `app/` directory

---

- [ ] 9. Update Cursor rules and final verification

  **What to do**:

  **Part A: Update Cursor rules**
  - Update `.cursor/rules/general-rules.mdc` to reflect new styling approach:
    - Replace all `className` references with `style` / Unistyles
    - Update "Styling Conventions" section to describe Unistyles patterns
    - Remove Tailwind class examples (`bg-light-primary dark:bg-dark-primary`)
    - Add Unistyles examples (`theme.colors.primary`, `StyleSheet.create`)

  **Part B: Clean rebuild**
  - Run: `rm -rf node_modules && npm install && npx expo prebuild --clean`

  **Part C: TypeScript check**
  - Run: `npx tsc --noEmit`

  **Part D: Lint check**
  - Run: `npm run lint`

  **Part E: Build and run iOS**
  - Run: `npx expo run:ios`
  - Navigate through all screens to verify:
    - All text renders correctly with proper fonts
    - All backgrounds correct
    - Dark/light mode toggle works (via ThemeToggle component)
    - LinearGradient circles are circles (AiCircle component)
    - BlurView blur effect visible (Header component)
    - Lottie animations play

  **Part F: Final className audit**
  - Run: `grep -rn 'className=["{]' --include="*.tsx" app/ components/`
  - Should return empty (no className usage)

  **Must NOT do**:
  - Don't skip the clean rebuild
  - Don't skip the TypeScript check

  **Parallelizable**: NO (final step)

  **References**:
  **Pattern References**:
  - `.cursor/rules/general-rules.mdc` - Current rules reference className and Tailwind
  - All screens in `app/` directory
  - `components/AiCircle.tsx` - Verify circle renders correctly
  - `components/ThemeToggle.tsx` - Verify theme toggle works
  - `components/Header.tsx` - Verify blur effect

  **Acceptance Criteria**:
  - [ ] `.cursor/rules/general-rules.mdc` updated with Unistyles patterns
  - [ ] `npm install` succeeds with no errors
  - [ ] `npx expo prebuild --clean` succeeds
  - [ ] `npx tsc --noEmit` passes with no errors
  - [ ] `npm run lint` passes
  - [ ] `npx expo run:ios` builds and app launches
  - [ ] All screens render correctly
  - [ ] Dark/light mode toggle works
  - [ ] LinearGradient circles render as circles
  - [ ] `grep -rn 'className=["{]' --include="*.tsx" app/ components/` returns empty (zero JSX className usage)

  **Commit**: YES
  - Message: `chore: complete Luna cutting-edge migration to Expo SDK 55 + Unistyles 3.0`
  - Files: `.cursor/rules/general-rules.mdc`, any final fixes

---

## Commit Strategy

| After Task | Message                                                             | Key Files                                                                          |
| ---------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 1          | `feat: upgrade to Expo SDK 55 canary`                               | package.json                                                                       |
| 2          | `feat: install Unistyles 3.0 and migrate theme system`              | package.json, babel.config.js, app/unistyles.ts, ThemeContext.tsx, ThemeColors.tsx |
| 3          | `chore: remove NativeWind, Tailwind, and all related configuration` | package.json, babel/metro/ts configs, deleted files                                |
| 4          | `refactor: migrate core themed components`                          | ThemedText, ThemeScroller, etc.                                                    |
| 5          | `refactor: migrate UI and layout components`                        | Card, Button, Chip, layout/\*                                                      |
| 6          | `fix: migrate AiCircle and Header, fix LinearGradient`              | AiCircle, Header, VoiceSelectCard                                                  |
| 7          | `refactor: migrate remaining components`                            | ~40 remaining components                                                           |
| 8          | `refactor: migrate all app screens`                                 | app/ files                                                                         |
| 9          | `chore: complete Luna cutting-edge migration`                       | .cursor/rules, final fixes                                                         |

---

## Success Criteria

### Verification Commands

```bash
# Check Expo version
npm list expo
# Expected: expo@55.x.x-canary.x

# Check no NativeWind
npm list nativewind
# Expected: (empty)

# Check no Tailwind utilities
npm list clsx tailwind-merge
# Expected: (empty)

# TypeScript check
npx tsc --noEmit
# Expected: No errors

# Check no className usage
grep -rn 'className=["{]' --include="*.tsx" app/ components/
# Expected: (empty)

# Build iOS
npx expo run:ios
# Expected: Success, app launches

# Lint
npm run lint
# Expected: No errors
```

### Final Checklist

- [ ] Expo SDK 55 canary installed and working
- [ ] New Architecture enabled (default in SDK 55)
- [ ] Unistyles 3.0 configured with all 16 color tokens (consistent shape) AND fonts
- [ ] ThemeContext migrated from NativeWind to Unistyles
- [ ] ThemeColors hook migrated to read from Unistyles theme
- [ ] All `className` usages migrated
- [ ] LinearGradient bug fixed (circles render as circles)
- [ ] Dark/light mode toggle working via Unistyles
- [ ] All third-party components functional
- [ ] NativeWind, Tailwind, clsx, tailwind-merge completely removed
- [ ] TypeScript config cleaned up (no nativewind references)
- [ ] Prettier config cleaned up (no tailwindcss plugin)
- [ ] lib/utils.ts deleted (cn function removed)
- [ ] Cursor rules updated for Unistyles
- [ ] Clean iOS build
- [ ] TypeScript check passes
- [ ] Lint passes
