# Decisions: undefined-object-crash-fix

## [2026-01-21T21:53:08] Fix Strategy Decision

### Decision: Use Explicit Subdirectories Instead of Parent Directory

**Options Considered**:

1. **Fix babel plugin code** (upstream fix)
   - Pros: Would solve root cause
   - Cons: Requires understanding plugin internals, time-consuming, may not be accepted upstream
   - Verdict: ❌ Too complex for immediate fix

2. **Exclude problematic components** (use autoProcessIgnore)
   - Pros: Quick workaround
   - Cons: Doesn't solve the real issue, components won't get Unistyles processing
   - Verdict: ❌ Loses functionality

3. **Use explicit subdirectory paths** (chosen solution)
   - Pros: Simple config change, maintains full functionality, follows plugin's expected usage
   - Cons: Need to list all subdirectories explicitly
   - Verdict: ✅ **CHOSEN** - Best balance of simplicity and functionality

### Rationale

The Unistyles babel plugin is designed to work with explicit subdirectory paths, not parent directories. Using `['components/ui', 'components/forms', 'components/layout']` instead of `['components']`:

- Maintains full Unistyles processing for all components
- Requires no code changes to components
- Simple one-line config change
- Follows the plugin's intended usage pattern
- Future-proof: adding new subdirectories is straightforward

### Trade-offs Accepted

- **Maintenance**: Need to add new subdirectories to config if created
- **Verbosity**: Config is slightly more verbose (3 paths vs 1)

These trade-offs are acceptable given the simplicity and reliability of the solution.

## [2026-01-21T21:53:08] Component Reorganization Decision

### Decision: Move All Components to components/ui/ Subfolder

**Context**: Components were scattered in `components/` root directory.

**Rationale**:

- Babel plugin works better with organized subdirectories
- Improves code organization and discoverability
- Aligns with the explicit subdirectory approach
- Separates concerns: ui/, forms/, layout/

**Impact**: Required updating 31 import statements across the app.

**Verdict**: ✅ Worth the effort for long-term maintainability
