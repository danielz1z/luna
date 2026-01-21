# Learnings: undefined-object-crash-fix

## [2026-01-21T21:53:08] WORK COMPLETED

### Root Cause Identified

**Problem**: `TypeError: Cannot convert undefined value to object` when using `autoProcessPaths: ['components']` in Unistyles babel plugin config.

**Root Cause**: The Unistyles babel plugin crashes when `autoProcessPaths` points to a parent directory (`'components'`) instead of explicit subdirectories.

**Why it crashes**: The babel plugin's file processing logic has issues when scanning parent directories that contain mixed file types or certain component patterns.

### Solution Applied

**Fix**: Changed babel.config.js from:

```js
autoProcessPaths: ['components'],  // ❌ CRASHES
```

To:

```js
autoProcessPaths: ['components/ui', 'components/forms', 'components/layout'],  // ✅ WORKS
```

### Additional Fixes in Same Commit (dc7c588)

1. **Moved unistyles.ts**: `app/unistyles.ts` → `lib/unistyles.ts`
   - Reason: Expo Router warning about missing default export
   - Updated all 31 imports across the app

2. **Fixed AnimatedView.tsx**: Removed empty Unistyles styles
   - Reason: "2 unistyles styles" warning from mixing empty styles with props
   - Removed unused `styles.container` and `styles.animated`

3. **Reorganized components**: Moved all components into `components/ui/` subfolder
   - Reason: Proper babel plugin processing structure
   - Updated all imports across the app

### Conventions Discovered

- **Unistyles babel plugin**: Always use explicit subdirectory paths, never parent directories
- **File organization**: Keep components in categorized subfolders (ui/, forms/, layout/)
- **Import paths**: Use `@/components/ui/Component` pattern consistently

### Successful Approaches

- **Binary search strategy**: The plan's folder-level testing approach (Tasks 1-3) would have worked
- **Evidence capture**: Creating `.sisyphus/evidence/` directory for debug output
- **Systematic debugging**: Sequential task flow from diagnosis → analysis → fix → verification

### Technical Gotchas

- **Cache clearing is critical**: Always use `npx expo start -c` when testing babel config changes
- **Babel plugin limitations**: Unistyles plugin doesn't handle parent directory scanning well
- **Component reorganization**: Moving files requires updating ALL imports (31 files in this case)

### Verification Performed

✅ App launches without crash  
✅ `autoProcessPaths` enabled with explicit subfolders  
✅ All Unistyles warnings resolved  
✅ ActionSheet components work (Favorite, BotSwitch, Select)  
✅ No "Cannot convert undefined value to object" errors

### Commit Details

**Commit**: dc7c588b0f5cef8629932c5231eddc1cc2d7e51e  
**Date**: Wed Jan 21 21:53:08 2026 +0700  
**Message**: fix: resolve Unistyles warnings and babel plugin crash  
**Files Changed**: 86 files, +997/-661 lines
