# World-Class Stack Upgrade

## Context

### Original Request

Upgrade Luna's dependency stack to world-class level by removing dead weight and adding missing essential libraries for performance and developer experience.

### Current State

- **Strong foundation**: Expo SDK 55, React 19, RN 0.83, Reanimated 4, Unistyles 3
- **Dead weight**: `react-native-chart-kit` (unused), `react-native-navigation-bar-color` (unused)
- **Missing**: State management, data fetching, fast image loading, performant lists, offline storage

### UI Impact

**None visually** - all changes are performance/infrastructure improvements. Same UI, faster app.

---

## Work Objectives

### Core Objective

Transform Luna from a good stack to a world-class stack by adding essential data/performance layers.

### Concrete Deliverables

1. Remove unused dependencies
2. Add 5 world-class libraries
3. Migrate Image components to expo-image
4. Migrate FlatList components to FlashList
5. App runs without errors or warnings

### Definition of Done

- [ ] `npm ls` shows no unused packages
- [ ] `npx expo start` runs without errors
- [ ] App launches and functions correctly on iOS simulator
- [ ] No TypeScript errors
- [ ] Images load with blur placeholder effect (expo-image working)
- [ ] Lists scroll at 60fps (FlashList working)

### Must NOT Have

- No downgrading any package versions
- No visual UI changes (same look, better performance)
- No breaking existing functionality

---

## TODOs

### Phase 1: Remove Dead Weight

- [x] 1. Remove unused dependencies

  **What to do**:
  - Run `npm uninstall react-native-chart-kit react-native-navigation-bar-color --legacy-peer-deps`
  - Verify no import errors

  **Acceptance Criteria**:
  - [ ] Both packages removed from package.json
  - [ ] `npx expo start` still works
  - [ ] No import errors in codebase

  **Commit**: YES
  - Message: `chore: remove unused dependencies (chart-kit, navigation-bar-color)`

---

### Phase 2: Add World-Class Libraries

- [x] 2. Install new dependencies

  **What to do**:

  ```bash
  npm install @tanstack/react-query zustand expo-image @shopify/flash-list react-native-mmkv --legacy-peer-deps
  ```

  **Acceptance Criteria**:
  - [ ] All 5 packages in package.json at latest versions
  - [ ] `npm ls @tanstack/react-query zustand expo-image @shopify/flash-list react-native-mmkv` shows installed
  - [ ] No peer dependency errors

  **Commit**: YES
  - Message: `feat: add world-class data layer (react-query, zustand, mmkv, expo-image, flash-list)`

---

### Phase 3: Migrate Image Components

- [x] 3. Replace React Native Image with expo-image

  **Files to update** (10 files):
  - `app/(drawer)/index.tsx`
  - `app/(drawer)/lottie.tsx`
  - `app/screens/search-form.tsx`
  - `app/screens/edit-profile.tsx`
  - `app/screens/provider.tsx`
  - `components/ui/SliderCard.tsx`
  - `components/ui/Chip.tsx`
  - `components/ui/ImageCarousel.tsx`
  - `components/ui/Avatar.tsx`
  - `components/ui/ChatInput.tsx`

  **What to do**:
  - Change `import { Image } from 'react-native'` to `import { Image } from 'expo-image'`
  - Add `placeholder={blurhash}` prop where appropriate for loading states
  - Add `contentFit="cover"` (replaces `resizeMode="cover"`)

  **API differences**:
  | React Native Image | expo-image |
  |--------------------|------------|
  | `resizeMode="cover"` | `contentFit="cover"` |
  | `resizeMode="contain"` | `contentFit="contain"` |
  | No placeholder | `placeholder={blurhash}` |
  | `source={{ uri }}` | `source={{ uri }}` (same) |
  | `source={require()}` | `source={require()}` (same) |

  **Acceptance Criteria**:
  - [ ] All 10 files updated
  - [ ] No TypeScript errors
  - [ ] Images still display correctly
  - [ ] No `import { Image } from 'react-native'` remaining (except where intentionally needed)

  **Commit**: YES
  - Message: `refactor: migrate Image components to expo-image for better performance`

---

### Phase 4: Migrate FlatList Components

- [x] 4. Replace FlatList with FlashList

  **Files to update** (3 files):
  - `app/screens/welcome.tsx`
  - `components/ui/ProductVariantCreator.tsx`
  - `components/ui/ThemeFlatList.tsx`

  **What to do**:
  - Change `import { FlatList } from 'react-native'` to `import { FlashList } from '@shopify/flash-list'`
  - Add required `estimatedItemSize` prop (FlashList requires this)
  - Update component name from `FlatList` to `FlashList`

  **API differences**:
  | FlatList | FlashList |
  |----------|-----------|
  | No estimatedItemSize | `estimatedItemSize={50}` (required) |
  | `renderItem` | `renderItem` (same) |
  | `data` | `data` (same) |
  | `keyExtractor` | `keyExtractor` (same) |

  **Acceptance Criteria**:
  - [ ] All 3 files updated
  - [ ] `estimatedItemSize` prop added to each FlashList
  - [ ] No TypeScript errors
  - [ ] Lists still scroll and render correctly

  **Commit**: YES
  - Message: `refactor: migrate FlatList to FlashList for 60fps scrolling`

---

### Phase 5: Native Rebuild & Verification

- [ ] 5. Rebuild native app and verify

  **What to do**:
  - Run `npx expo prebuild --clean`
  - Run `npx expo run:ios`
  - Test all screens with images
  - Test all screens with lists
  - Verify no runtime warnings

  **Acceptance Criteria**:
  - [ ] Native build succeeds
  - [ ] App launches on simulator
  - [ ] No yellow box warnings about missing native modules
  - [ ] Images load correctly (test Avatar, ImageCarousel, etc.)
  - [ ] Lists scroll smoothly (test welcome screen, ProductVariantCreator)

  **Commit**: YES
  - Message: `chore: rebuild native app with new dependencies`

---

## Commit Strategy

| After Task | Message                                                                                 |
| ---------- | --------------------------------------------------------------------------------------- |
| 1          | `chore: remove unused dependencies (chart-kit, navigation-bar-color)`                   |
| 2          | `feat: add world-class data layer (react-query, zustand, mmkv, expo-image, flash-list)` |
| 3          | `refactor: migrate Image components to expo-image for better performance`               |
| 4          | `refactor: migrate FlatList to FlashList for 60fps scrolling`                           |
| 5          | `chore: rebuild native app with new dependencies`                                       |

---

## Success Criteria

### Verification Commands

```bash
# Check all packages installed
npm ls @tanstack/react-query zustand expo-image @shopify/flash-list react-native-mmkv

# Check dead weight removed
npm ls react-native-chart-kit  # Should fail (not found)
npm ls react-native-navigation-bar-color  # Should fail (not found)

# Run app
npx expo start
```

### Final Checklist

- [ ] Dead weight removed (2 packages)
- [ ] New libraries added (5 packages)
- [ ] All Image components migrated to expo-image
- [ ] All FlatList components migrated to FlashList
- [ ] Native app rebuilt
- [ ] App runs without errors
- [ ] No visual regressions
