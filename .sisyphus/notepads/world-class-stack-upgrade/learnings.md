# Learnings: world-class-stack-upgrade

## [2026-01-22T10:45:00] World-Class Stack Upgrade Complete

### Packages Removed (Dead Weight)

1. **react-native-chart-kit** - Unused charting library
2. **react-native-navigation-bar-color** - Unused, redundant with Expo APIs

**Verification**: Searched entire codebase, zero imports found for both packages.

### Packages Added (World-Class Libraries)

1. **@tanstack/react-query@5.90.19** - Industry-standard data fetching and caching
2. **zustand@5.0.10** - Lightweight state management (3kb)
3. **expo-image@3.1.0** - Optimized image loading with blur placeholders
4. **@shopify/flash-list@2.2.0** - 60fps scrolling for large lists
5. **react-native-mmkv@4.1.1** - Fast offline storage (10x faster than AsyncStorage)

### Migration Work Completed

#### Image Migration (10 files)

- ✅ All `Image` imports changed from `react-native` to `expo-image`
- ✅ All `resizeMode` props changed to `contentFit`
- ✅ Files: Avatar, Chip, SliderCard, ImageCarousel, ChatInput, MultipleImagePicker, provider, search-form, edit-profile, lottie, index

**API Changes Applied**:
| Old (react-native) | New (expo-image) |
|--------------------|------------------|
| `resizeMode="cover"` | `contentFit="cover"` |
| `import { Image } from 'react-native'` | `import { Image } from 'expo-image'` |

#### FlatList Migration (2 files)

- ✅ `components/ui/ThemeFlatList.tsx` - Wrapper component migrated to FlashList
- ✅ `components/ui/ProductVariantCreator.tsx` - Values list migrated to FlashList
- ❌ `app/screens/welcome.tsx` - **Intentionally skipped** (horizontal paging carousel, FlashList limitation)

**FlashList Learnings**:

- FlashList doesn't support horizontal lists well (documented limitation)
- Best for vertical scrolling lists with many items
- Keep FlatList for horizontal/paging use cases
- FlashList auto-calculates item sizes, no `estimatedItemSize` prop needed in this version

### Build & Verification

**Native Rebuild**: ✅ Success

- `npx expo prebuild --clean` - Completed without errors
- `npx expo run:ios` - Build succeeded (11 warnings, 0 errors)
- App launched on iPhone 16 Pro Max simulator

**Warnings** (non-blocking):

- Expo import consistency warnings (cosmetic)
- CocoaPods script phase warnings (build system optimization suggestions)

### Conventions Discovered

- **expo-image**: Drop-in replacement for react-native Image, better performance
- **FlashList**: Use for vertical lists, keep FlatList for horizontal/paging
- **Package cleanup**: Always search codebase before removing dependencies
- **Native rebuild**: Required after adding native modules (expo-image, flash-list, mmkv)

### Successful Approaches

- **Systematic migration**: One phase at a time (remove → add → migrate images → migrate lists → rebuild)
- **Verification at each step**: Commit after each phase to ensure clean rollback points
- **Documentation**: Record decisions (why we skipped welcome.tsx) for future reference

### Technical Gotchas

- **FlashList horizontal limitation**: Not suitable for horizontal paging carousels
- **FlashList API**: No `estimatedItemSize` prop in current version (auto-calculated)
- **expo-image types**: `ImageSourcePropType` still imported from react-native (type only)
- **Native rebuild required**: New native modules need `npx expo prebuild --clean`

### Performance Improvements Expected

1. **Images**: Faster loading, blur placeholders, better memory management (expo-image)
2. **Lists**: 60fps scrolling even with large datasets (FlashList)
3. **Storage**: 10x faster than AsyncStorage (MMKV ready for use)
4. **Data fetching**: React Query ready for API integration
5. **State**: Zustand ready for global state management

### Next Steps (Not in This Plan)

- Integrate React Query for API calls
- Set up Zustand stores for global state
- Use MMKV for offline data persistence
- Add blur placeholders to expo-image components
- Optimize FlashList with proper item sizing

### Commit History

1. `7329f51` - chore: remove unused dependencies (chart-kit, navigation-bar-color)
2. `32029ca` - feat: add world-class data layer (react-query, zustand, mmkv, expo-image, flash-list)
3. `d7bf0f2` - refactor: migrate Image components to expo-image for better performance
4. `d7610fa` - refactor: migrate FlatList to FlashList for 60fps scrolling (vertical lists only)
5. (pending) - chore: rebuild native app with new dependencies
