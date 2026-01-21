# Issues: world-class-stack-upgrade

## [2026-01-22T10:40:00] FlashList Horizontal Limitation

**File**: `app/screens/welcome.tsx`

**Issue**: This file uses a horizontal FlatList with paging for the onboarding carousel:

```tsx
<FlatList
  horizontal
  pagingEnabled
  snapToInterval={windowWidth}
  // ... onboarding slides
/>
```

**Decision**: **NOT migrating** this file to FlashList because:

1. FlashList doesn't support horizontal lists well (documented limitation)
2. This is a paging carousel with only 3 items - performance is not a concern
3. The current FlatList implementation works perfectly for this use case

**Files Migrated**:

- ✅ `components/ui/ThemeFlatList.tsx` - Vertical list wrapper
- ✅ `components/ui/ProductVariantCreator.tsx` - Vertical values list

**Files Skipped**:

- ❌ `app/screens/welcome.tsx` - Horizontal paging carousel (FlashList limitation)

**Recommendation**: Keep FlatList for horizontal/paging use cases, use FlashList for vertical scrolling lists.
