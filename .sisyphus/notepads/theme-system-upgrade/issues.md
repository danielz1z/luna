# Issues

- `npx tsc --noEmit` currently fails due to unrelated type errors in `components/forms/Select.tsx` (`restDisplacementThreshold` not in animation config type). This blocks creating the required commit without adjusting that file or TypeScript configuration.

## Task 4: Migration Issues Encountered

### Issue 1: ast-grep Changes Not Persisting
**Problem:** ast-grep replacements appeared successful but didn't persist to disk
**Impact:** Had to re-run all replacements using sed
**Resolution:** Used sed for all bulk replacements instead
**Lesson:** Verify file changes persist before proceeding with verification

### Issue 2: Double Theme References
**Problem:** Initial sed replacement created `theme.theme.colors` instead of `theme.colors`
**Cause:** Sed replaced `colors.` with `theme.colors.` in code that already had `theme.colors`
**Resolution:** Additional sed pass to fix `theme.theme.` → `theme.`
**Prevention:** More careful pattern matching or use ast-aware tools

### Issue 3: isDark Property Location
**Problem:** `colors.isDark` was replaced with `theme.colors.isDark` but should be `theme.isDark`
**Cause:** Blanket replacement of `colors.` → `theme.colors.`
**Resolution:** Special sed pass to fix `theme.colors.isDark` → `theme.isDark` in 4 files
**Lesson:** Document special cases before bulk operations

### Issue 4: Import Statement Variations
**Problem:** 5 different import patterns across 36 files
**Impact:** Required 5 separate replacement patterns
**Resolution:** Handled all patterns systematically
**Lesson:** Codebase has inconsistent import styles (relative vs absolute, named vs default)
