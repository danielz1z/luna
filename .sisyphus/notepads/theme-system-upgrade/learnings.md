# Learnings

- `react-native-mmkv` v4 in this repo exposes a sync store via `createMMKV()`, not via a `new MMKV()` class.

## [2026-01-22] Task 1: MMKV Storage

- Used `createMMKV()` instead of `new MMKV()` due to TypeScript type-only export
- Fixed pre-existing errors in Select.tsx (restDisplacementThreshold removed)
- All TypeScript errors resolved before commit

## [2026-01-22] Task 3: ThemeSelector Component

- Chip component uses `isSelected` prop (not `selected`)
- Chip component does NOT use `selectable` prop for external selection management
- useEffect dependency array includes `[rt.themeName, rt.hasAdaptiveThemes, preference]` to sync all external changes
- Module-level `setThemeMode()` export enables programmatic theme changes from anywhere
- Critical ordering: `setAdaptiveThemes(false)` MUST be called BEFORE `setTheme()` for manual modes
- System mode only calls `setAdaptiveThemes(true)` - does NOT call `setTheme()`
- Local state + MMKV persistence + Unistyles runtime updates all work together via setThemeMode()

## Task 4: useThemeColors → useUnistyles Migration (Completed)

### Migration Patterns Applied

Successfully migrated 36 consumer files from `useThemeColors()` to `useUnistyles()`.

**Import Replacements:**
- Pattern A (18 files): `import useThemeColors from '@/app/contexts/ThemeColors'` → `import { useUnistyles } from 'react-native-unistyles'`
- Pattern B (6 files): `import { useThemeColors } from '@/app/contexts/ThemeColors'` → `import { useUnistyles } from 'react-native-unistyles'`
- Pattern C (3 files): `import { useThemeColors } from 'app/contexts/ThemeColors'` → `import { useUnistyles } from 'react-native-unistyles'`
- Pattern D (2 files): `import useThemeColors from '../contexts/ThemeColors'` → `import { useUnistyles } from 'react-native-unistyles'`
- Pattern E (1 file): `import { useThemeColors } from '../contexts/ThemeColors'` → `import { useUnistyles } from 'react-native-unistyles'`

**Hook Usage Replacement:**
- `const colors = useThemeColors()` → `const { theme } = useUnistyles()`
- `colors.X` → `theme.colors.X` (all color properties)
- `colors.isDark` → `theme.isDark` (special case - 4 files)

**Special Cases:**
- AnimatedFab.tsx: `colors.isDark` → `theme.isDark` (line 70)
- ProductVariantCreator.tsx: `colors.isDark` → `theme.isDark` (line 32)
- TimePicker.tsx: `colors.isDark` → `theme.isDark` (line 166)
- DatePicker.tsx: `colors.isDark` → `theme.isDark` (line 158)

### Tools Used

1. **ast-grep**: Attempted for pattern-based replacements, but changes didn't persist
2. **sed**: Successfully used for bulk replacements across all 36 files
3. **TypeScript compiler**: Verified no errors after migration

### Successful Approach

Used `sed` with multiple passes:
1. Replace all import statements (5 patterns)
2. Replace hook usage: `const colors = useThemeColors()` → `const { theme } = useUnistyles()`
3. Replace all color references: `colors.` → `theme.colors.`
4. Fix double-theme references: `theme.theme.` → `theme.`
5. Fix isDark special cases: `theme.colors.isDark` → `theme.isDark`

### Verification

- TypeScript compilation: ✅ Clean (0 errors)
- Import verification: ✅ No useThemeColors imports remain (except ThemeColors.tsx)
- Git commit: ✅ All 36 files committed

### Key Learnings

1. **ast-grep limitations**: Changes made by ast-grep didn't persist to disk in this environment
2. **sed reliability**: Multiple sed passes with specific patterns worked reliably
3. **Theme structure**: `useUnistyles()` returns `{ theme }` where theme has `isDark`, `colors`, `spacing`, `fonts`
4. **Special property handling**: `isDark` is at theme root, not in `theme.colors`

## Task 5: useTheme Migration & Magic String Cleanup

### Migration Pattern Applied
Successfully migrated 4 files from useTheme() to useUnistyles():
- `app/hooks/useThemedNavigation.tsx`
- `components/forms/Select.tsx`
- `components/ui/Toast.tsx`
- `components/ui/ConfirmationModal.tsx`

**Pattern:**
```typescript
// BEFORE:
import { useTheme } from '@/app/contexts/ThemeContext';
const { isDark } = useTheme();

// AFTER:
import { useUnistyles } from 'react-native-unistyles';
const { theme } = useUnistyles();
const isDark = theme.isDark;
```

### Magic String Anti-Pattern Fixed
Replaced `theme.colors.primary === '#171717'` with `theme.isDark` in:
- `components/ui/BotSwitch.tsx` (2 occurrences: lines 84, 120)
- `components/ui/ChatInput.tsx` (1 occurrence: line 318)

**Rationale:** The magic string check was effectively a dark theme detector since:
- `darkTheme.colors.primary = '#171717'`
- `lightTheme.colors.primary = '#f5f5f5'`

Using `theme.isDark` is explicit, maintainable, and doesn't couple to color values.

### Verification Results
- ✅ `grep -r "=== '#171717'" components/ lib/` → 0 matches
- ✅ `npx tsc --noEmit` → Clean compilation
- ✅ Git commit: `2db88b8` - 6 files changed, 19 insertions(+), 36 deletions(-)

### Files Modified
1. `app/hooks/useThemedNavigation.tsx` - Removed useTheme import, use theme.isDark
2. `components/forms/Select.tsx` - Removed useTheme import, use theme.isDark
3. `components/ui/Toast.tsx` - Removed useTheme import, use theme.isDark
4. `components/ui/ConfirmationModal.tsx` - Removed useTheme import, use theme.isDark
5. `components/ui/BotSwitch.tsx` - Replaced magic string checks with theme.isDark
6. `components/ui/ChatInput.tsx` - Replaced magic string check with theme.isDark

### Next Steps
Task 6 will delete `ThemeContext.tsx` and `ThemeToggle.tsx` (the old theme system).

## Task 6: Cleanup Redundant Theme Files (Completed)

### Files Deleted
Successfully removed 3 redundant theme abstraction files:
1. `app/contexts/ThemeColors.tsx` - Wrapper around useUnistyles, now redundant
2. `app/contexts/ThemeContext.tsx` - Provided isDark and toggleTheme, now redundant
3. `components/ui/ThemeToggle.tsx` - Replaced by ThemeSelector

### Integration Points Updated
Updated 2 files to use ThemeSelector instead of ThemeToggle:
1. `components/ui/CustomDrawerContent.tsx` (line 12, 39)
   - Import: `ThemeToggle` → `ThemeSelector`
   - JSX: `<ThemeToggle />` → `<ThemeSelector />`

2. `app/screens/welcome.tsx` (line 12, 52)
   - Import: `ThemeToggle` → `ThemeSelector`
   - JSX: `<ThemeToggle />` → `<ThemeSelector />`

### Root Layout Cleanup
Updated `app/_layout.tsx`:
- Removed `ThemeProvider` import from `./contexts/ThemeContext`
- Removed `<ThemeProvider>` wrapper from component tree
- App now relies solely on Unistyles runtime for theme management

**Rationale:** `useThemedNavigation` uses `useUnistyles()` directly, so ThemeProvider was unnecessary.

### Verification Results
- ✅ `grep -r "ThemeColors" --include="*.tsx"` → 0 matches (excluding node_modules)
- ✅ `grep -r "ThemeContext" --include="*.tsx"` → 0 matches (excluding node_modules, React Navigation's ThemeContext is OK)
- ✅ `grep -r "ThemeToggle" --include="*.tsx"` → 0 matches
- ✅ `npx tsc --noEmit` → Clean compilation
- ✅ Git commit: `863ef8c` - 12 files changed, 1163 insertions(+), 183 deletions(-)

### Files Modified
1. `components/ui/CustomDrawerContent.tsx` - Use ThemeSelector
2. `app/screens/welcome.tsx` - Use ThemeSelector
3. `app/_layout.tsx` - Remove ThemeProvider wrapper

### Architecture After Cleanup
The theme system now has a clean, single-source-of-truth architecture:
- **Storage:** MMKV persists theme preference
- **Runtime:** Unistyles runtime manages active theme
- **UI:** ThemeSelector component for user selection
- **Consumers:** All components use `useUnistyles()` directly
- **No abstractions:** Removed all intermediate wrapper contexts

### Key Learnings
1. **Pre-deletion verification critical:** Checked for imports before deleting files
2. **ThemeProvider removal safe:** useThemedNavigation already used useUnistyles directly
3. **React Navigation ThemeContext:** Expected to see in node_modules, not our code
4. **Clean migration path:** Tasks 1-5 prepared the codebase perfectly for this cleanup
