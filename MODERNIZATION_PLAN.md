# Luna Modernization Plan - Bleeding Edge Upgrade

**Audit Date:** January 20, 2026  
**Current State:** Expo SDK 54 / React Native 0.81.4 / NativeWind v2  
**Target State:** Expo SDK 55 / React Native 0.83 / NativeWind v4 / iOS 26

---

## Executive Summary

This codebase has significant tech debt and is **2 major versions behind** on core dependencies. The upgrade will touch every file but is achievable in phases. Estimated effort: **3-5 days** for a skilled developer.

### Critical Upgrades Required

| Current             | Target         | Breaking Changes |
| ------------------- | -------------- | ---------------- |
| Expo SDK 54         | SDK 55         | Medium           |
| React Native 0.81.4 | 0.83.1         | Low              |
| React 19.1          | 19.2.3         | None             |
| NativeWind 2.0.11   | 4.2.1          | **HIGH**         |
| Tailwind CSS 3.3.2  | 4.1.18         | **HIGH**         |
| iOS Deployment 15.1 | 15.1+ (26 SDK) | Low              |

---

## Part 1: Dependency Audit

### 1.1 CRITICAL - Must Upgrade

| Package                             | Current | Latest         | Status                        | Action                            |
| ----------------------------------- | ------- | -------------- | ----------------------------- | --------------------------------- |
| `nativewind`                        | 2.0.11  | 4.2.1          | **DEPRECATED API**            | Remove `styled()` wrapper pattern |
| `tailwindcss`                       | 3.3.2   | 4.1.18         | Major version                 | New config format in v4           |
| `@react-native-community/viewpager` | 5.0.11  | **DEPRECATED** | Use `react-native-pager-view` |
| `eslint`                            | 8.57.1  | 9.39.2         | Deprecated v8                 | Flat config migration             |
| `react-native-actions-sheet`        | 0.9.7   | 10.1.1         | Major version                 | API changes                       |
| `victory-native`                    | 37.3.6  | 41.20.2        | Major version                 | Breaking changes                  |

### 1.2 HIGH Priority Upgrades

| Package                        | Current | Latest  | Notes                     |
| ------------------------------ | ------- | ------- | ------------------------- |
| `react-native`                 | 0.81.4  | 0.83.1  | Two minor versions behind |
| `react`                        | 19.1.0  | 19.2.3  | Minor upgrade             |
| `react-native-maps`            | 1.20.1  | 1.26.20 | 6 versions behind         |
| `react-native-screens`         | 4.16.0  | 4.20.0  | 4 versions behind         |
| `react-native-gesture-handler` | 2.28.0  | 2.30.0  | Minor                     |
| `react-native-reanimated`      | 4.1.0   | 4.2.1   | Minor                     |
| `react-native-svg`             | 15.12.1 | 15.15.1 | Minor                     |
| `lucide-react-native`          | 0.511.0 | 0.562.0 | 51 versions behind        |
| `rive-react-native`            | 9.2.1   | 9.8.0   | 6 versions behind         |

### 1.3 Medium Priority

| Package                         | Current | Latest |
| ------------------------------- | ------- | ------ |
| `@react-navigation/bottom-tabs` | 7.4.7   | 7.10.1 |
| `@react-navigation/drawer`      | 7.5.8   | 7.7.13 |
| `@react-navigation/native`      | 7.1.17  | 7.1.28 |
| `expo-router`                   | 6.0.6   | 6.0.21 |
| `@typescript-eslint/*`          | 7.18.0  | 8.53.1 |
| `prettier`                      | 3.5.1   | 3.8.0  |

### 1.4 Security Vulnerabilities (6 total)

```
HIGH (3):
- glob 10.2.0-10.4.5: Command injection
- node-forge <=1.3.1: ASN.1 vulnerabilities
- tar <=7.5.2: Arbitrary file overwrite

MODERATE (1):
- js-yaml: Prototype pollution

LOW (2):
- brace-expansion: ReDoS
```

Run `npm audit fix` after upgrades.

---

## Part 2: Code Quality Issues

### 2.1 NativeWind v2 → v4 Migration (7 files)

The `styled()` wrapper pattern is **deprecated**. These files need updating:

```
components/ThemeFlatList.tsx    - styled(FlatList)
components/ThemeScroller.tsx    - styled(ScrollView)
components/ThemeFooter.tsx      - styled(View)
components/forms/Input.tsx      - styled(RNTextInput)
components/forms/TextInput.tsx  - styled(RNTextInput)
components/ThemedText.tsx       - styled(Text)
components/AnimatedFab.tsx      - styled(Animated.View), styled(View), styled(TouchableWithoutFeedback)
```

**Migration:** Remove `styled()` imports. NativeWind v4 works directly with `className` prop via babel plugin.

### 2.2 TypeScript `any` Usage (31 instances in 20 files)

| File                     | Issue                                               |
| ------------------------ | --------------------------------------------------- |
| `BackHandlerManager.tsx` | `backHandlerSubscription: any`                      |
| `provider.tsx`           | `RatingProgress = (props: any)`                     |
| `subscription.tsx`       | Multiple `any` in SelectPlan/RowItem props          |
| `DrawerButton.tsx`       | `NavigationProp<any>`                               |
| `search-form.tsx`        | `filterData = (data: any[])`                        |
| `MultiStep.tsx`          | `isStepComponent = (child: any)`                    |
| `ThemeFlatList.tsx`      | Cast to `any` for generics                          |
| `suggestions.tsx`        | `SuggestionCard = (props: any)`                     |
| `ChatInput.tsx`          | `handleContentSizeChange = (event: any)`            |
| `ThemeTabs.tsx`          | `handleScrollEnd = (event: any)`                    |
| `DatePicker.tsx`         | `handleDateChange = (event: any)`                   |
| `FormTabs.tsx`           | `props?: any`                                       |
| `SliderCard.tsx`         | `distance?: any`                                    |
| `Card.tsx`               | `width?: any`                                       |
| `AnimatedView.tsx`       | `getAnimationStyle = (): any`                       |
| `Header.tsx`             | `onPress?: any`                                     |
| `TimePicker.tsx`         | `handleTimeChange = (event: any)`                   |
| `ThemeScroller.tsx`      | `onScroll?: ... any`, `contentContainerStyle?: any` |

### 2.3 Console Statements (13 instances - remove for production)

```
components/DrawerButton.tsx:34     - console.warn
components/MultiStep.tsx:124,154,167 - console.log (3x)
utils/BackHandlerManager.tsx       - console.log (7x)
app/screens/signup.tsx:118         - console.log
app/screens/login.tsx:59           - console.log
```

### 2.4 StyleSheet.create Usage (5 files - migrate to className)

```
components/FloatingButton.tsx:96
components/Toast.tsx:81
components/ImageCarousel.tsx:140
app/screens/signup.tsx:209        - UNUSED (googleIcon style)
app/screens/login.tsx:127         - UNUSED (googleIcon style)
```

### 2.5 Accessibility - ZERO Implementation

**Critical:** No accessibility attributes found in entire codebase.

Missing in ALL interactive components:

- `accessibilityLabel`
- `accessibilityRole`
- `accessibilityHint`
- `accessible`

**Files needing accessibility (priority):**

- `components/Button.tsx`
- `components/forms/Input.tsx`
- `components/ChatInput.tsx`
- `components/Chip.tsx`
- `components/Card.tsx`
- All pressable/touchable elements

### 2.6 Missing Error Boundaries

**Zero error boundaries** in the codebase. App will crash completely on unhandled errors.

**Recommendation:** Add error boundaries at:

- `app/_layout.tsx` (root level)
- Each screen group
- Critical interactive components

### 2.7 Performance Optimizations Missing

**Memoization usage:** Only 12 instances across 5 files (very low)

Components that should use `React.memo`:

- `Card.tsx` - renders in lists
- `Chip.tsx` - renders in lists
- `ListItem.tsx` - renders in lists
- `VoiceSelectCard.tsx` - renders in lists
- `SliderCard.tsx` - renders in lists

Callbacks that should use `useCallback`:

- All `onPress` handlers passed to children
- All event handlers in forms

Values that should use `useMemo`:

- Computed styles
- Filtered/transformed data
- Animation configurations

### 2.8 Large Components (should be split)

| File                        | Lines | Recommendation                        |
| --------------------------- | ----- | ------------------------------------- |
| `AnimatedView.tsx`          | 444   | Extract animation logic to hooks      |
| `ChatInput.tsx`             | 303   | Extract image picker, animation logic |
| `MultiStep.tsx`             | 294   | Extract step management to hook       |
| `Header.tsx`                | 282   | Extract HeaderIcon, subcomponents     |
| `ProductVariantCreator.tsx` | 280   | Extract variant management logic      |
| `AnimatedFab.tsx`           | 259   | Extract animation logic               |

### 2.9 Unused Imports (ESLint warnings)

```
app/(drawer)/index.tsx:
- HeaderIcon (unused)
- ThemeScroller (unused)
- useState, useEffect, useRef (unused)
- Pressable, Image (unused)
- Icon (unused)
```

### 2.10 Code Formatting Issues

**140+ ESLint/Prettier warnings** - mostly:

- Import order issues
- Inconsistent indentation (mixed tabs/spaces)
- Missing trailing commas
- Quote style inconsistencies

Run `npm run format` to fix most automatically.

---

## Part 3: iOS/Xcode Modernization

### Current State

- iOS Deployment Target: **15.1**
- Xcode: Building with warnings

### Target State (iOS 26 SDK)

- Latest iOS: **26.2** (stable), 26.3 beta 2
- Latest Xcode: **26.2** (build 17C52)
- Swift: **6.2.3**

### Xcode Warnings to Fix

1. **Deployment Target Warning:**
   ```
   'IPHONEOS_DEPLOYMENT_TARGET' is set to 11.0, but range is 12.0 to 26.2.99
   (in target 'react-native-maps-ReactNativeMapsPrivacy')
   ```
2. **Script Phase Warnings:**
   - `[Hermes] Replace Hermes` - missing outputs
   - `[CP-User] Generate updates resources for expo-updates` - missing outputs

### Privacy Manifest Requirements

**Already present:** `ios/Luna/PrivacyInfo.xcprivacy`

Verify it declares all Required Reason APIs:

- `NSPrivacyAccessedAPICategoryFileTimestamp`
- `NSPrivacyAccessedAPICategorySystemBootTime`
- `NSPrivacyAccessedAPICategoryDiskSpace`

---

## Part 4: Modernization Roadmap

### Phase 1: Foundation (Day 1)

**Goal:** Fix build warnings, update tooling

```bash
# 1. Fix formatting
npm run format

# 2. Update ESLint to v9 (flat config)
npm uninstall eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-config-universe
npm install -D eslint@^9 @typescript-eslint/eslint-plugin@^8 @typescript-eslint/parser@^8 eslint-config-universe@^15

# 3. Update Prettier
npm install -D prettier@^3.8 prettier-plugin-tailwindcss@^0.7

# 4. Remove deprecated viewpager
npm uninstall @react-native-community/viewpager
npm install react-native-pager-view

# 5. Remove console statements
# (manual or use eslint rule)
```

### Phase 2: NativeWind v4 Migration (Day 1-2)

**This is the biggest breaking change.**

```bash
# 1. Update packages
npm uninstall nativewind tailwindcss
npm install nativewind@^4 tailwindcss@^4

# 2. Update babel.config.js
# Add: plugins: ['nativewind/babel']

# 3. Update metro.config.js
# Add NativeWind transformer

# 4. Update tailwind.config.js
# New v4 format

# 5. Remove ALL styled() wrappers (7 files)
# className works directly now
```

**Files to update:**

- `babel.config.js`
- `metro.config.js`
- `tailwind.config.js`
- `global.css`
- All 7 files using `styled()`

### Phase 3: React Native & Expo Upgrade (Day 2-3)

```bash
# 1. Update Expo SDK
npx expo install expo@^55

# 2. Let Expo update compatible packages
npx expo install --fix

# 3. Update React Native
npx expo install react-native@0.83

# 4. Update React
npm install react@^19.2 react-dom@^19.2

# 5. Rebuild native projects
rm -rf ios android
npx expo prebuild --clean
```

### Phase 4: TypeScript Cleanup (Day 3)

1. Replace all `any` with proper types (31 instances)
2. Add missing type definitions
3. Enable stricter TypeScript options:
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true
     }
   }
   ```

### Phase 5: Accessibility (Day 4)

Add to ALL interactive components:

```tsx
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Submit form"
  accessibilityHint="Double tap to submit"
>
```

Priority order:

1. Button.tsx
2. forms/Input.tsx
3. ChatInput.tsx
4. Card.tsx
5. Chip.tsx
6. All other pressables

### Phase 6: Performance & Architecture (Day 4-5)

1. **Add Error Boundaries:**

   ```tsx
   // components/ErrorBoundary.tsx
   // Wrap in app/_layout.tsx
   ```

2. **Add React.memo to list items:**

   - Card, Chip, ListItem, SliderCard, VoiceSelectCard

3. **Extract hooks from large components:**

   - `useAnimatedView` from AnimatedView.tsx
   - `useChatInput` from ChatInput.tsx
   - `useMultiStep` from MultiStep.tsx

4. **Add loading skeletons:**
   - Font loading in `_layout.tsx`
   - Data loading in screens

### Phase 7: Final Cleanup (Day 5)

1. Run full test on device
2. Fix any regressions
3. Update documentation
4. Run `npm audit fix`
5. Final `npm run lint && npm run format`

---

## Part 5: Package.json Target State

```json
{
  "dependencies": {
    "expo": "^55.0.0",
    "react": "^19.2.3",
    "react-native": "0.83.1",
    "nativewind": "^4.2.1",
    "react-native-pager-view": "^7.0.0",
    "react-native-reanimated": "^4.2.1",
    "react-native-gesture-handler": "^2.30.0",
    "react-native-screens": "^4.20.0",
    "react-native-svg": "^15.15.1",
    "react-native-maps": "^1.26.20",
    "lucide-react-native": "^0.562.0"
  },
  "devDependencies": {
    "tailwindcss": "^4.1.18",
    "eslint": "^9.39.2",
    "@typescript-eslint/eslint-plugin": "^8.53.1",
    "@typescript-eslint/parser": "^8.53.1",
    "prettier": "^3.8.0"
  }
}
```

---

## Part 6: Risk Assessment

| Change               | Risk     | Mitigation                                   |
| -------------------- | -------- | -------------------------------------------- |
| NativeWind v2→v4     | **HIGH** | Test every screen, styles may break          |
| Tailwind v3→v4       | **HIGH** | New config format, test all styles           |
| ESLint v8→v9         | Medium   | Flat config migration, may need rule updates |
| React Native upgrade | Low      | Expo handles compatibility                   |
| TypeScript cleanup   | Low      | Incremental, won't break functionality       |

---

## Estimated Effort

| Phase                  | Hours      | Complexity |
| ---------------------- | ---------- | ---------- |
| Phase 1: Foundation    | 2-3h       | Low        |
| Phase 2: NativeWind    | 6-8h       | **High**   |
| Phase 3: RN/Expo       | 2-3h       | Medium     |
| Phase 4: TypeScript    | 3-4h       | Medium     |
| Phase 5: Accessibility | 4-6h       | Medium     |
| Phase 6: Performance   | 4-6h       | Medium     |
| Phase 7: Cleanup       | 2-3h       | Low        |
| **Total**              | **23-33h** | -          |

---

## Quick Wins (Do First)

1. `npm run format` - fixes 140+ warnings instantly
2. `npm audit fix` - fixes security vulnerabilities
3. Remove unused imports - 10 minutes
4. Remove console.log statements - 20 minutes
5. Delete unused StyleSheet.create - 5 minutes

---

## Future Considerations (iOS 26 Features)

Once on latest stack, consider:

1. **Apple Intelligence / Foundation Models**

   - On-device AI via `@react-native-ai/apple`
   - Requires iOS 26+, iPhone 15 Pro+

2. **Liquid Glass UI**

   - New translucent design system
   - Via `@callstack/liquid-glass`
   - Requires iOS 26+

3. **React Native 0.83 Features**
   - Intersection Observers
   - Web Performance APIs
   - Enhanced DevTools

---

_Generated by modernization audit - January 20, 2026_
