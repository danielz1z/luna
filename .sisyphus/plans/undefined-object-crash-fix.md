# Fix "Cannot convert undefined value to object" Crash

## Context

### Original Request

Fix the `TypeError: Cannot convert undefined value to object` crash that occurs when `autoProcessPaths: ['components']` is enabled in the Unistyles babel plugin config.

### Interview Summary

**Key Discussions**:

- Crash occurs on app launch (module initialization)
- Works fine when `autoProcessPaths` is disabled in babel.config.js
- Error happens in `copyComponentProperties` / `createUnistylesElement` (Unistyles runtime)
- User wants surgical fix: find root cause, understand why, fix properly

**Research Findings**:

- Component folder structure: `ui/` (50 files), `forms/` (13 files), `layout/` (9 files)
- `react-native-actions-sheet` used in 6 files (initially suspected)
- High-risk patterns found: `forwardRef` without `displayName`, `memo` wrappers, named-only exports
- `debug: true` is already set in babel.config.js but output not captured

### Metis Review

**Identified Gaps** (addressed):

- Missing debug output capture → Added Phase 0
- Jumping to file-level search → Added folder-level binary search first
- No platform specification → Added iOS as primary test platform
- No exact verification command → Defined: `npx expo start -c`, wait for home screen
- Missed high-risk patterns → Documented forwardRef/memo/export patterns as suspects

---

## Work Objectives

### Core Objective

Identify which component(s) cause the Unistyles babel plugin crash and implement a minimal fix that allows `autoProcessPaths: ['components']` to work.

### Concrete Deliverables

- Working babel.config.js with `autoProcessPaths` enabled
- Documentation of root cause
- Minimal fix (config change or targeted code fix)

### Definition of Done

- [x] App launches without crash when `autoProcessPaths: ['components']` is enabled
- [x] Manual smoke test: ActionSheet components work (Favorite, BotSwitch, Select)
- [x] Fix is minimal (ideally config change only)
- [x] Root cause documented in commit message

### Must Have

- Root cause identified (not just "it works now")
- Verification on iOS simulator
- Cache cleared between all test iterations

### Must NOT Have (Guardrails)

- DO NOT modify component source code during diagnosis (tempting to "fix" exports)
- DO NOT upgrade Unistyles version (3.0.21 is current)
- DO NOT change more than one config option per test iteration
- DO NOT skip cache clearing (`npx expo start -c`)
- DO NOT assume ActionSheet is the culprit without evidence

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: NO (manual verification only)
- **User wants tests**: Manual-only
- **Framework**: N/A

### Manual QA Procedures

**Verification Command**:

```bash
npx expo start -c
```

**Success Criteria**:

1. Metro bundler starts without errors
2. App loads on iOS simulator
3. Home screen renders (no crash, no red error screen)
4. Navigate to a screen using ActionSheet (e.g., BotSwitch) - it works

**Failure Criteria**:

- Red error screen with "Cannot convert undefined value to object"
- App crashes on launch
- Metro shows module initialization error

---

## Task Flow

```
Task 0 (Capture Debug)
    ↓
Task 1 (Folder-Level Test: ui/)
    ↓
Task 2 (Folder-Level Test: forms/)
    ↓
Task 3 (Folder-Level Test: layout/)
    ↓
Task 4 (Analyze Results) → Identify problematic folder(s)
    ↓
Task 5 (File-Level Binary Search) → Within problematic folder
    ↓
Task 6 (Root Cause Analysis) → Why does this file crash?
    ↓
Task 7 (Implement Fix) → Based on root cause
    ↓
Task 8 (Final Verification) → Full autoProcessPaths enabled
```

## Parallelization

| Task | Depends On | Reason                     |
| ---- | ---------- | -------------------------- |
| 0    | None       | Starting point             |
| 1-3  | 0          | Need baseline first        |
| 4    | 1, 2, 3    | Needs all folder tests     |
| 5    | 4          | Needs to know which folder |
| 6    | 5          | Needs culprit file         |
| 7    | 6          | Needs root cause           |
| 8    | 7          | Needs fix applied          |

**Parallelizable**: Tasks 1, 2, 3 could theoretically run in parallel on different terminals, but sequential is safer for this debugging task.

---

## TODOs

- [x] 0. Capture Babel Debug Output

  **What to do**:
  - Create evidence directory: `mkdir -p .sisyphus/evidence`
  - Enable `autoProcessPaths: ['components']` in babel.config.js (uncomment the line)
  - Run `npx expo start -c 2>&1 | tee .sisyphus/evidence/debug-output.txt` to capture ALL terminal output
  - The `debug: true` flag should show which files are being processed
  - Capture the crash stack trace and the last file processed before crash

  **Must NOT do**:
  - Don't fix anything yet, just capture diagnostic info

  **Parallelizable**: NO (starting point)

  **References**:
  - `babel.config.js:7-14` - Current config with debug: true
  - Metro terminal output - Will show babel plugin processing

  **Acceptance Criteria**:
  - [x] Directory created: `mkdir -p .sisyphus/evidence`
  - [x] Command: `npx expo start -c 2>&1 | tee .sisyphus/evidence/debug-output.txt`
  - [x] Capture: Full terminal output saved to `.sisyphus/evidence/debug-output.txt`
  - [x] Capture: Last 3-5 files listed before crash
  - [x] Capture: Full error stack trace

  **Commit**: NO (diagnostic only)

---

- [x] 1. Folder-Level Test: components/ui

  **What to do**:
  - Modify babel.config.js to only process `ui` folder:
    ```js
    autoProcessPaths: ['components/ui'],
    ```
  - Run `npx expo start -c`
  - Record: Does it crash or succeed?

  **Must NOT do**:
  - Don't change any component files

  **Parallelizable**: YES (with 2, 3) - but recommend sequential for clearer results

  **References**:
  - `babel.config.js` - Modify autoProcessPaths
  - `components/ui/` - 50 files, includes ActionSheet-related components

  **Acceptance Criteria**:
  - [x] Config changed to `autoProcessPaths: ['components/ui']`
  - [x] Run: `npx expo start -c`
  - [x] Record result: CRASH or SUCCESS
  - [x] If crash, note the error message

  **Commit**: NO (diagnostic iteration)

---

- [x] 2. Folder-Level Test: components/forms

  **What to do**:
  - Modify babel.config.js to only process `forms` folder:
    ```js
    autoProcessPaths: ['components/forms'],
    ```
  - Run `npx expo start -c`
  - Record: Does it crash or succeed?

  **Must NOT do**:
  - Don't change any component files

  **Parallelizable**: YES (with 1, 3)

  **References**:
  - `babel.config.js` - Modify autoProcessPaths
  - `components/forms/` - 13 files, includes Select.tsx (uses ActionSheet)

  **Acceptance Criteria**:
  - [x] Config changed to `autoProcessPaths: ['components/forms']`
  - [x] Run: `npx expo start -c`
  - [x] Record result: CRASH or SUCCESS
  - [x] If crash, note the error message

  **Commit**: NO (diagnostic iteration)

---

- [x] 3. Folder-Level Test: components/layout

  **What to do**:
  - Modify babel.config.js to only process `layout` folder:
    ```js
    autoProcessPaths: ['components/layout'],
    ```
  - Run `npx expo start -c`
  - Record: Does it crash or succeed?

  **Must NOT do**:
  - Don't change any component files

  **Parallelizable**: YES (with 1, 2)

  **References**:
  - `babel.config.js` - Modify autoProcessPaths
  - `components/layout/` - 9 files, likely simpler components

  **Acceptance Criteria**:
  - [x] Config changed to `autoProcessPaths: ['components/layout']`
  - [x] Run: `npx expo start -c`
  - [x] Record result: CRASH or SUCCESS
  - [x] If crash, note the error message

  **Commit**: NO (diagnostic iteration)

---

- [x] 4. Analyze Folder Test Results

  **What to do**:
  - Review results from Tasks 1-3
  - Identify which folder(s) cause the crash
  - Document findings:
    - `ui/`: [CRASH/SUCCESS]
    - `forms/`: [CRASH/SUCCESS]
    - `layout/`: [CRASH/SUCCESS]

  **Decision tree**:
  - If ONLY ONE folder crashes → Proceed to Task 5 with that folder
  - If MULTIPLE folders crash → May have multiple culprits, start with largest (ui/)
  - If NO folders crash individually → Interaction bug, test combinations
  - If ALL folders crash → Something fundamental, check babel config itself

  **Must NOT do**:
  - Don't jump to conclusions without data

  **Parallelizable**: NO (depends on 1, 2, 3)

  **References**:
  - Results from Tasks 1-3
  - `.sisyphus/evidence/debug-output.txt` from Task 0

  **Acceptance Criteria**:
  - [x] All three folder tests completed and documented
  - [x] Problematic folder(s) identified
  - [x] Decision made on which folder to drill into

  **Commit**: NO (analysis only)

---

- [x] 5. File-Level Binary Search

  **What to do**:
  - In the problematic folder, list all files
  - Use `autoProcessIgnore` to exclude half the files
  - Test: Does it still crash?
  - Binary search to narrow down to specific file(s)

  **Example** (if `ui/` is problematic with 50 files):

  ```js
  // Iteration 1: Exclude first 25 files
  autoProcessPaths: ['components/ui'],
  autoProcessIgnore: ['components/ui/ActionSheetThemed.tsx', 'components/ui/AiCircle.tsx', ...first 25 files],
  ```

  - If SUCCESS → Culprit is in excluded files
  - If CRASH → Culprit is in remaining files
  - Repeat with halves until specific file(s) found

  **Must NOT do**:
  - Don't modify component source files
  - Don't skip cache clear between iterations

  **Parallelizable**: NO (sequential narrowing)

  **References**:
  - `babel.config.js` - autoProcessIgnore option
  - Problematic folder from Task 4

  **Acceptance Criteria**:
  - [x] Specific file(s) identified that cause the crash
  - [x] Document: `[filename]` causes crash when processed
  - [x] Verify by: exclude ONLY that file → SUCCESS

  **Commit**: NO (diagnostic iteration)

---

- [x] 6. Root Cause Analysis

  **What to do**:
  - Open the problematic file(s)
  - Check for known high-risk patterns:
    - [x] Uses `forwardRef`? → Has `displayName`?
    - [x] Uses `memo`? → How is it wrapped?
    - [x] Export pattern? → Named only vs default?
    - [x] Imports from third-party? → Which library?
  - Compare with a working component in same folder
  - Document WHY this component fails

  **Must NOT do**:
  - Don't fix yet - just analyze

  **Parallelizable**: NO (depends on 5)

  **References**:
  - Problematic file(s) from Task 5
  - Working component in same folder for comparison
  - Unistyles babel plugin source (if needed): `node_modules/react-native-unistyles/plugin`

  **Acceptance Criteria**:
  - [x] Root cause identified: [describe why this component fails]
  - [x] Document which pattern causes the issue
  - [x] Determine if fix should be: config exclusion, code change, or upstream report

  **Commit**: NO (analysis only)

---

- [x] 7. Implement Minimal Fix

  **What to do** (based on root cause):

  **If third-party library incompatibility**:

  ```js
  // babel.config.js
  autoProcessPaths: ['components'],
  autoProcessIgnore: ['components/ui/ActionSheetThemed.tsx', ...],
  ```

  **If missing displayName**:

  ```tsx
  // In problematic file
  const Component = forwardRef(...);
  Component.displayName = 'Component';
  export default Component;
  ```

  **If export pattern issue**:

  ```tsx
  // Add default export if missing
  export default ComponentName;
  ```

  **Must NOT do**:
  - Don't over-engineer the fix
  - Don't fix unrelated issues

  **Parallelizable**: NO (depends on 6)

  **References**:
  - Root cause from Task 6
  - `babel.config.js` for config-based fix
  - Problematic file for code-based fix

  **Acceptance Criteria**:
  - [x] Minimal fix implemented
  - [x] Fix is documented (what and why)
  - [x] Single change only (not multiple "improvements")

  **Commit**: YES
  - Message: `fix(unistyles): resolve babel plugin crash with [component]`
  - Files: `babel.config.js` and/or problematic component file
  - Pre-commit: `npx expo start -c` → app loads

---

- [x] 8. Final Verification

  **What to do**:
  - Enable full `autoProcessPaths: ['components']`
  - Remove all `autoProcessIgnore` entries (except intentional exclusions)
  - Run `npx expo start -c`
  - Smoke test all screens that use styled components

  **Must NOT do**:
  - Don't declare victory without full test

  **Parallelizable**: NO (final step)

  **References**:
  - `babel.config.js` - final config
  - All ActionSheet-using screens: Favorite, BotSwitch, Select, subscription

  **Acceptance Criteria**:
  - [x] `autoProcessPaths: ['components']` enabled (not commented)
  - [x] Run: `npx expo start -c` → App loads without crash
  - [x] Navigate to: Settings → BotSwitch works
  - [x] Navigate to: Any form with Select → works
  - [x] Navigate to: Favorites → ActionSheet works
  - [x] No red error screens
  - [x] No "Cannot convert undefined value to object" errors

  **Commit**: YES (if config was finalized differently than Task 7)
  - Message: `chore(unistyles): enable full autoProcessPaths for components`
  - Files: `babel.config.js`
  - Pre-commit: Full verification above

---

## Commit Strategy

| After Task | Message                                                       | Files                            | Verification                |
| ---------- | ------------------------------------------------------------- | -------------------------------- | --------------------------- |
| 7          | `fix(unistyles): resolve babel plugin crash with [component]` | babel.config.js, [component].tsx | `npx expo start -c` → loads |
| 8          | `chore(unistyles): enable full autoProcessPaths`              | babel.config.js                  | Full smoke test             |

---

## Success Criteria

### Verification Commands

```bash
# Primary verification
npx expo start -c
# Wait for: "Metro waiting on..."
# Then: App should load in iOS simulator without crash

# Smoke test navigation (manual)
# - Home screen loads
# - BotSwitch ActionSheet opens
# - Select dropdown works
# - Favorites ActionSheet works
```

### Final Checklist

- [x] `autoProcessPaths: ['components']` is enabled (not commented)
- [x] App boots without "Cannot convert undefined value to object" error
- [x] Root cause is documented in commit message
- [x] Fix is minimal (config or single file, not major refactor)
- [x] All ActionSheet-based components still work
