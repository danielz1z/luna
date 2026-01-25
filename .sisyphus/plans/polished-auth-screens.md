# Polished Auth Screens - Modern Unified Flow

## Executive Summary

**Goal:** Replace the unpolished login/signup screens with world-class auth UI featuring Luna branding, OAuth (Google + Apple), and a modern unified "Continue" flow.

**Style:** Modern minimal - theme-adaptive screens (dark/light), gradient branding, social login prominent, smart email detection.

**Approach:** Unified Continue flow (like lu.ma, Linear, Vercel) - single entry point that auto-detects existing users.

**Reference Implementation:** [Zoldytech/react-native-expo-clerk-starter](https://github.com/Zoldytech/react-native-expo-clerk-starter) (Jan 2026, production-ready patterns)

**Raw file URLs for direct reference:**

- SignInWith: `https://raw.githubusercontent.com/Zoldytech/react-native-expo-clerk-starter/main/components/auth/SignInWith.tsx`
- Continue: `https://raw.githubusercontent.com/Zoldytech/react-native-expo-clerk-starter/main/app/(auth)/continue.tsx`

**Effort:** 4-6 hours

---

## Design Reference

### Unified Continue Flow (Modern UX)

```
┌─────────────────────────────────────────┐
│                                         │
│           ◯ (Gradient Circle)           │
│              Luna.                      │
│                                         │
│     Your AI companion awaits            │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  G  Continue with Google        │   │
│   └─────────────────────────────────┘   │
│   ┌─────────────────────────────────┐   │
│   │    Continue with Apple          │   │
│   └─────────────────────────────────┘   │
│                                         │
│              ──── or ────               │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │  Email address                  │   │
│   └─────────────────────────────────┘   │
│   ┌─────────────────────────────────┐   │
│   │         Continue                │   │  ← Checks if user exists
│   └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
         │
         ▼ (User exists?)
         │
    ┌────┴────┐
    │         │
   YES        NO
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│Password │ │Password  │
│  only   │ │+ confirm │
│         │ │+ strength│
└─────────┘ └──────────┘
    │         │
    │         ▼
    │    ┌──────────┐
    │    │ Verify   │
    │    │ Email    │
    │    └──────────┘
    │         │
    └────┬────┘
         ▼
    ┌──────────┐
    │ Success! │ → /(app)/(drawer)
    └──────────┘
```

---

## Repo-Specific Context

### Current State (Verified)

| Item                            | Current Value                                                                 | Source                         |
| ------------------------------- | ----------------------------------------------------------------------------- | ------------------------------ |
| Package manager                 | npm (has `package-lock.json`)                                                 | `package.json`                 |
| Install workaround              | `npm install --legacy-peer-deps`                                              | `README.md:22`                 |
| OAuth deps                      | Already installed (`expo-auth-session`, `expo-web-browser`)                   | `package.json:29,47`           |
| App scheme                      | Already configured (`"scheme": "luna"`)                                       | `app.json:8`                   |
| Theme fonts                     | `regular`, `bold` only (NO `medium`)                                          | `lib/unistyles.ts:58-60`       |
| Theme default                   | `system` (adaptive light/dark)                                                | `lib/storage.ts:16`            |
| Theme constraint                | `"userInterfaceStyle": "light"` in app.json (needs change for dark mode)      | `app.json:23`                  |
| Theme toggle                    | `setThemeMode('dark')` via `lib/storage.ts` + `components/ui/ThemeToggle.tsx` | `lib/storage.ts:25-34`         |
| `components/auth/` directory    | **Does NOT exist** - must be created                                          | (verified via glob)            |
| Auth redirect (signed in)       | `/(app)/(drawer)`                                                             | `app/(auth)/_layout.tsx:8`     |
| Unauth redirect                 | `/(auth)/login` (needs change to `/(auth)/continue`)                          | `app/(app)/_layout.tsx:24`     |
| Auth screens registered         | `login`, `signup` only (needs `continue`)                                     | `app/(auth)/_layout.tsx:12-13` |
| Password policy (signup)        | Confirm password + strength meter (8+ chars, upper, lower, number/special)    | `app/(auth)/signup.tsx:41-76`  |
| **BROKEN: login.tsx redirect**  | `/(drawer)/(tabs)/` (INVALID PATH)                                            | `app/(auth)/login.tsx:65`      |
| **BROKEN: signup.tsx redirect** | `/(drawer)/(tabs)/` (INVALID PATH)                                            | `app/(auth)/signup.tsx:148`    |

### Routing Structure

```
app/
├── (app)/                          # Protected routes
│   └── _layout.tsx                 # Redirects to /(auth)/login if !isSignedIn
│       └── (drawer)/               # Main app content
│           └── (tabs)/             # Tab navigation
├── (auth)/                         # Auth routes
│   └── _layout.tsx                 # Redirects to /(app)/(drawer) if isSignedIn
│       ├── login.tsx               # Current (BROKEN redirect, needs fix)
│       ├── signup.tsx              # Current (BROKEN redirect, needs fix)
│       └── continue.tsx            # NEW: Unified flow (main entry)
```

### Theme Mode Decision

**The app uses adaptive theming** (default: `system`). Auth screens must work correctly in BOTH light and dark modes using `theme.colors.*` tokens - NOT hardcoded colors.

---

## Work Objectives

### Core Objective

Create polished auth screens that:

1. Use modern **unified Continue flow** (single entry point)
2. Feature **prominent Google + Apple OAuth** buttons
3. **Auto-detect** if user exists (routes to sign-in or sign-up)
4. **Preserve existing password policy** (strength requirements from current signup)
5. **Work in both light and dark themes** (use theme tokens)
6. Use modern `useSSO()` hook (not deprecated `useOAuth()`)
7. **Fix broken redirects** in existing login/signup screens

### Definition of Done

- [x] Unified Continue screen with social + email entry
- [x] Smart user detection (existing vs new)
- [ ] Google OAuth works end-to-end
- [ ] Apple OAuth works end-to-end
- [x] Email/password flows preserved with current validation
- [x] Email verification flow works
- [x] Luna branding (gradient circle)
- [x] Theme-adaptive styling (works in light AND dark)
- [x] `npm run lint` passes
- [x] Silent cancellation handling (no annoying alerts)
- [x] Post-auth navigates to `/(app)/(drawer)`
- [x] Existing login/signup redirects fixed

---

## TODOs

### Task 1: Setup - Install Dependencies + Create Directory

**What to do:**

1. Install form validation packages (OAuth deps already exist)
2. Create `components/auth/` directory (does not exist yet)
3. Change `app.json` to support dark mode testing

**Step 1a: Verify OAuth deps already present:**

```bash
npm ls expo-auth-session expo-web-browser
# Expected output format:
# luna@1.0.0 /Users/daniel/Documents/DEV/luna
# ├── expo-auth-session@7.0.10
# └── expo-web-browser@15.0.11-canary-20260121-a63c0dd
```

**Step 1b: Install new deps (per README.md:22 workaround):**

```bash
npm install react-hook-form @hookform/resolvers zod --legacy-peer-deps
```

**Verification:**

```bash
npm ls react-hook-form @hookform/resolvers zod
# Expected output format (versions may differ):
# luna@1.0.0 /Users/daniel/Documents/DEV/luna
# ├── @hookform/resolvers@3.x.x
# ├── react-hook-form@7.x.x
# └── zod@3.x.x
```

**Step 2: Create auth components directory:**

```bash
mkdir -p components/auth
```

**Step 3: Enable dark mode support in app.json:**

Change `app.json:23` from:

```json
"userInterfaceStyle": "light",
```

to:

```json
"userInterfaceStyle": "automatic",
```

**Why:** The current `"light"` setting forces light mode at the native level. Changing to `"automatic"` allows:

- System dark mode to be respected
- `setThemeMode('dark')` from `lib/storage.ts` to work as expected

**VERIFICATION REQUIRED after change:**

1. Run `npx expo run:ios` (rebuild required for app.json changes)
2. Open app, navigate to a screen with `ThemeToggle`
3. Tap toggle → verify theme visually changes (background, text colors)
4. If theme doesn't switch, check console for Unistyles errors

**Acceptance Criteria:**

- [x] `npm ls expo-auth-session` shows version `7.x.x` (no error)
- [x] `npm ls expo-web-browser` shows version `15.x.x` (no error)
- [x] `npm ls react-hook-form @hookform/resolvers zod` shows versions (no error)
- [x] `ls components/auth` shows empty directory (no "No such file" error)
- [x] `grep userInterfaceStyle app.json` shows `"userInterfaceStyle": "automatic"`
- [ ] `npm run ios` still works

---

### Task 2: Create OAuth Component with `useSSO()`

**What to do:**
Create `SignInWith` component using the modern `useSSO()` hook (not deprecated `useOAuth()`).

**File to create:** `components/auth/SignInWith.tsx`

**Reference:** [Zoldytech SignInWith.tsx](https://raw.githubusercontent.com/Zoldytech/react-native-expo-clerk-starter/main/components/auth/SignInWith.tsx)

```typescript
import { useSSO, isClerkAPIResponseError } from '@clerk/clerk-expo';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';
import ThemedText from '@/components/ui/ThemedText';

// Warm up browser for faster OAuth on Android
export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

// Complete any pending auth sessions
WebBrowser.maybeCompleteAuthSession();

type OAuthStrategy = 'oauth_google' | 'oauth_apple';

interface SignInWithProps {
  strategy: OAuthStrategy;
}

const strategyLabels: Record<OAuthStrategy, string> = {
  oauth_google: 'Continue with Google',
  oauth_apple: 'Continue with Apple',
};

export default function SignInWith({ strategy }: SignInWithProps) {
  useWarmUpBrowser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { startSSOFlow } = useSSO();
  const { theme } = useUnistyles();

  const onPress = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // CRITICAL: Use the SAME parameters everywhere for consistent URI
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'luna',
        path: 'oauth-callback',
      });

      const { createdSessionId, setActive, signIn, signUp } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
        // Post-auth destination per app/(auth)/_layout.tsx:8
        router.replace('/(app)/(drawer)');
      } else if (signIn || signUp) {
        Alert.alert(
          'Additional Steps Required',
          'Please complete the additional security steps to continue.',
          [{ text: 'OK' }]
        );
      }
    } catch (err) {
      console.error('OAuth error:', JSON.stringify(err, null, 2));

      // Silent handling of user cancellation
      if (err instanceof Error) {
        if (
          err.message.includes('cancelled') ||
          err.message.includes('dismissed') ||
          err.message.includes('user_cancelled')
        ) {
          console.log('User cancelled OAuth flow');
          setIsLoading(false);
          return;
        }
      }

      // Show error for actual failures
      let errorMessage = 'Something went wrong. Please try again.';
      if (isClerkAPIResponseError(err)) {
        const firstError = err.errors[0];
        if (firstError) {
          errorMessage = firstError.longMessage || firstError.message;
        }
      }

      Alert.alert(`${strategyLabels[strategy]} Failed`, errorMessage, [{ text: 'Try Again' }]);
    } finally {
      setIsLoading(false);
    }
  }, [strategy, startSSOFlow, isLoading, router]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isLoading}
      style={[styles.button, isLoading && styles.buttonDisabled]}
    >
      {isLoading ? (
        <ActivityIndicator color={theme.colors.text} />
      ) : (
        <ThemedText style={styles.buttonText}>{strategyLabels[strategy]}</ThemedText>
      )}
    </TouchableOpacity>
  );
}

// Theme-adaptive styles (works in light AND dark mode)
const styles = StyleSheet.create((theme) => ({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: theme.fonts.regular,
  },
}));
```

**Key patterns:**

- `useSSO()` hook (modern, not deprecated `useOAuth()`)
- `useWarmUpBrowser()` for faster Android OAuth
- Silent cancellation handling (no alert when user backs out)
- `isClerkAPIResponseError()` type guard for Clerk errors
- Post-auth destination: `/(app)/(drawer)` (matches `app/(auth)/_layout.tsx:8`)
- Uses only `theme.fonts.regular` and `theme.fonts.bold` (no `medium`)
- **Theme-adaptive**: uses `theme.colors.*` tokens (works in light AND dark)

---

#### OAuth Redirect URI Configuration (CRITICAL)

**How to generate the redirect URI:**

Use `AuthSession.makeRedirectUri()` with explicit parameters for predictable results:

```typescript
import * as AuthSession from 'expo-auth-session';

// For development builds and standalone apps:
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'luna', // Must match app.json "scheme"
  path: 'oauth-callback', // Optional path segment
});

// Resulting URIs:
// - Development (Expo Go): exp://192.168.x.x:8081/--/oauth-callback
// - Standalone build:      luna://oauth-callback
```

**MANDATORY: Add debug logging during development (then remove):**

In `components/auth/SignInWith.tsx`, add at component top level (SAME parameters as used in `onPress`):

```typescript
// DEBUG ONLY - Remove after capturing URI
useEffect(() => {
  // MUST match the redirectUrl in startSSOFlow()
  const uri = AuthSession.makeRedirectUri({
    scheme: 'luna',
    path: 'oauth-callback',
  });
  console.log('[OAuth] Redirect URI:', uri);
  // Copy this EXACT URI to Clerk Dashboard!
}, []);
```

**After capturing the URI, remove this debug code before commit.**

**VERIFICATION (before final commit):**

```bash
# Confirm ALL debug OAuth logs are removed
grep -r "\[OAuth\] Redirect URI" components/auth/
# Expected: NO matches (empty output)

# Confirm ALL debug Clerk error logs are removed
grep -r "\[Clerk Error\]" app/
# Expected: NO matches (empty output)

# Confirm ALL debug SignIn error logs are removed
grep -r "\[Clerk SignIn Error\]" app/
# Expected: NO matches (empty output)
```

**Acceptance criteria includes:** "grep commands above return no matches"

**Target Runtimes & Expected URIs:**

| Runtime                                 | Expected URI                               | Register in Clerk? |
| --------------------------------------- | ------------------------------------------ | ------------------ |
| `npx expo run:ios` (dev client)         | `luna://oauth-callback`                    | YES (production)   |
| `npx expo start` (Expo Go)              | `exp://192.168.x.x:8081/--/oauth-callback` | YES (development)  |
| Standalone build (TestFlight/App Store) | `luna://oauth-callback`                    | Already covered    |

**Register BOTH URIs in Clerk Dashboard for development + production to work.**

**Clerk Dashboard Setup (REQUIRED - OAuth will fail without this):**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Your app
2. Navigate to **User & Authentication** → **Social Connections**
3. For **Google**:
   - Click "Manage Credentials"
   - Under "Redirect URIs", add BOTH:
     - Production: `luna://oauth-callback`
     - Development: The `exp://...` URI from console log
4. For **Apple** (requires additional setup):

   **VERIFICATION CHECKLIST (executor must confirm BEFORE implementing):**

   | Check                            | How to Verify                                                                                         | Owner if Missing       |
   | -------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------- |
   | Apple Developer Account access   | Can log into developer.apple.com                                                                      | Project owner          |
   | Bundle ID in Clerk matches app   | Clerk Dashboard → Apple → check Bundle ID = `com.blobsid.luna` (from `app.json:ios.bundleIdentifier`) | Executor can verify    |
   | Apple Team ID configured         | Clerk Dashboard → Apple → "Team ID" field is filled                                                   | Project owner provides |
   | Apple Key ID configured          | Clerk Dashboard → Apple → "Key ID" field is filled                                                    | Project owner provides |
   | Apple Private Key (.p8) uploaded | Clerk Dashboard → Apple → shows key is configured                                                     | Project owner provides |
   | Physical iOS device available    | Executor has iPhone/iPad for testing                                                                  | Executor or defer test |

   **If ANY secrets are missing:**
   - STOP Apple OAuth implementation
   - Mark Apple OAuth as "deferred pending secrets"
   - Continue with Google OAuth only
   - Add acceptance criteria: "Apple OAuth deferred - requires project owner to provide Apple Developer credentials"

   **Verification after setup:**
   1. On PHYSICAL iOS device, tap "Continue with Apple"
   2. Apple auth sheet appears with Face ID/Touch ID
   3. After auth, app navigates to `/(app)/(drawer)`

   **References:**
   - General setup: [Clerk Apple OAuth](https://clerk.com/docs/authentication/social-connections/apple)
   - **For native iOS (Expo):** [Clerk Expo OAuth Guide](https://clerk.com/docs/quickstarts/expo) - see "Add OAuth" section
   - Dashboard location: Clerk Dashboard → User & Authentication → Social Connections → Apple → Configure

   **Note:** The general Apple doc is for web flows. For native iOS in Expo, the key is ensuring Bundle ID matches and using `useSSO()` hook (already specified in Task 2).

**Troubleshooting:**

- `redirect_uri_mismatch` error → URI in Clerk Dashboard doesn't match generated URI
- Check console log, copy EXACT URI (including any trailing slashes)

---

#### OAuth Callback Routing (IMPORTANT)

**Q: Do I need to create an `app/oauth-callback.tsx` route file?**

**A: NO.** The Clerk SDK + `expo-auth-session` handle the OAuth callback internally. The `redirectUrl` is used by the browser/WebView to return to the app, but:

1. `WebBrowser.maybeCompleteAuthSession()` (called at module load) intercepts the return
2. The `startSSOFlow()` promise resolves with the session data
3. Your code then calls `router.replace('/(app)/(drawer)')` explicitly

**No route file is needed for `oauth-callback` path.**

**Verification (no 404 flash):**

1. Start OAuth flow (tap Google/Apple button)
2. Complete auth in browser
3. App should return directly to Continue screen momentarily, then navigate to `/(app)/(drawer)`
4. There should be NO blank screen, 404 error, or "route not found" flash
5. If you see routing errors, check that `WebBrowser.maybeCompleteAuthSession()` is called at the top level of `SignInWith.tsx` (outside any component)

---

**Acceptance Criteria:**

- [x] Component created at `components/auth/SignInWith.tsx`
- [x] `npm run lint` passes
- [x] No TypeScript errors (`npx tsc --noEmit`)
- [ ] Google OAuth flow initiates when tapped
- [ ] Cancellation is silent (no error alert)
- [ ] Button styling works in BOTH light and dark themes
- [ ] Redirect URI logged during development for Clerk Dashboard config

---

### Task 3: Create Reusable Auth Components

**What to do:**
Create reusable auth UI components for consistent styling.

**Files to create:**

#### 3a. `components/auth/AuthContainer.tsx`

**Small Screen + Keyboard Behavior (CRITICAL):**

The Continue screen has multiple steps (`signup` + `verify`) with potentially 3+ input fields. On smaller devices (iPhone SE) or with keyboard open, content may overflow.

**Solution:** Wrap content in `ScrollView` inside `KeyboardAvoidingView`:

```typescript
import { memo, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native-unistyles';

interface AuthContainerProps {
  children: ReactNode;
}

const AuthContainer = memo(({ children }: AuthContainerProps) => {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 60, paddingBottom: insets.bottom + 40 }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

AuthContainer.displayName = 'AuthContainer';

// Theme-adaptive (works in light AND dark)
const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
}));

export default AuthContainer;
```

**Key behaviors:**

- `keyboardShouldPersistTaps="handled"` - Tapping outside input dismisses keyboard but button taps still work
- `showsVerticalScrollIndicator={false}` - Cleaner auth UI aesthetic
- `paddingBottom: insets.bottom + 40` - Ensures content isn't hidden behind home indicator
- Content scrolls when keyboard is open on small screens

#### 3b. `components/auth/AuthHeader.tsx`

```typescript
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedText from '@/components/ui/ThemedText';

interface AuthHeaderProps {
  subtitle?: string;
  email?: string;
  emailLabel?: string;
}

export default function AuthHeader({ subtitle, email, emailLabel }: AuthHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Gradient Circle */}
      <View style={styles.circleContainer}>
        <LinearGradient
          colors={['#D883E4', '#016BF0', '#3DE3E0', '#E57DDF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCircle}
        />
      </View>

      {/* Brand - uses theme.fonts.bold per lib/unistyles.ts:60 */}
      <ThemedText style={styles.brand}>
        Luna<ThemedText style={styles.brandDot}>.</ThemedText>
      </ThemedText>

      {/* Subtitle */}
      {subtitle && (
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      )}

      {/* Email display (for sign-in step) */}
      {email && (
        <>
          {emailLabel && (
            <ThemedText style={styles.emailLabel}>{emailLabel}</ThemedText>
          )}
          <ThemedText style={styles.email}>{email}</ThemedText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    alignItems: 'center',
    marginBottom: 32,
  },
  circleContainer: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  gradientCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  brand: {
    fontSize: 36,
    fontFamily: theme.fonts.bold,
    marginBottom: 8,
  },
  brandDot: {
    color: theme.colors.highlight,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.subtext,
    textAlign: 'center',
  },
  emailLabel: {
    fontSize: 14,
    color: theme.colors.subtext,
    marginTop: 8,
  },
  email: {
    fontSize: 16,
    fontFamily: theme.fonts.bold,
    marginTop: 4,
  },
}));
```

#### 3c. `components/auth/AuthDivider.tsx`

```typescript
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import ThemedText from '@/components/ui/ThemedText';

export default function AuthDivider() {
  return (
    <View style={styles.container}>
      <View style={styles.line} />
      <ThemedText style={styles.text}>or</ThemedText>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  text: {
    marginHorizontal: 16,
    fontSize: 14,
    color: theme.colors.subtext,
  },
}));
```

**Acceptance Criteria:**

- [x] All three files created
- [x] `npm run lint` passes
- [x] No TypeScript errors
- [x] Only uses `theme.fonts.regular` and `theme.fonts.bold`
- [x] All components use `theme.colors.*` (theme-adaptive)

---

### Task 4: Create Unified Continue Screen

**What to do:**
Create the unified Continue flow that auto-detects existing users.

**File to create:** `app/(auth)/continue.tsx`

**Reference:** [Zoldytech continue.tsx](<https://raw.githubusercontent.com/Zoldytech/react-native-expo-clerk-starter/main/app/(auth)/continue.tsx>)

**CRITICAL: Clerk Loading Guard**
Must check `isLoaded` before accessing `signIn`/`signUp` objects:

```typescript
const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();

// Guard: render spinner until Clerk is ready
if (!isSignInLoaded || !isSignUpLoaded) {
  return (
    <AuthContainer>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.highlight} />
      </View>
    </AuthContainer>
  );
}

// Now safe to use signIn and signUp (non-null)
```

**User Existence Detection - Error Handling:**

**Error Code Discovery (MUST VERIFY DURING IMPLEMENTATION):**

The expected error code for non-existent users is `form_identifier_not_found`, but this MUST be verified by logging actual Clerk responses in this app.

```typescript
// EXPECTED error code - verify via logging before removing debug code
const ERROR_CODES_USER_NOT_FOUND = ['form_identifier_not_found'] as const;

// MANDATORY during development: Log actual error codes to verify
// In checkUserExists catch block, add:
console.log('[Clerk Error] Code:', error.errors?.[0]?.code);
console.log('[Clerk Error] Full:', JSON.stringify(error.errors, null, 2));

// VERIFICATION STEPS (MUST COMPLETE BEFORE REMOVING DEBUG LOGS):
// 1. Enter a definitely-non-existent email (e.g., test-nonexistent-12345@example.com)
// 2. Check console for the error code
// 3. Document the observed code:
//    - If code IS 'form_identifier_not_found': ✅ No changes needed
//    - If code is DIFFERENT: Update ERROR_CODES_USER_NOT_FOUND array with observed code
// 4. Add a code comment documenting the verified code:
//    // Verified 2026-01-XX: Clerk returns 'form_identifier_not_found' for non-existent emails
// 5. Remove debug logging ONLY after verification is complete
// 6. Commit the verified constant with the verification comment

// SUCCESS CONDITION: ERROR_CODES_USER_NOT_FOUND contains the actual observed code,
// with a dated verification comment. Debug logs are removed.

// Check if user exists
const checkUserExists = async (email: string): Promise<{ exists: boolean; error?: string }> => {
  try {
    await signIn.create({ identifier: email });
    return { exists: true };
  } catch (error: any) {
    if (isClerkAPIResponseError(error)) {
      const firstError = error.errors[0];

      // DEFINITE: user doesn't exist
      if (ERROR_CODES_USER_NOT_FOUND.includes(firstError?.code)) {
        return { exists: false };
      }

      // NETWORK/UNKNOWN error: show error, stay on email step
      return {
        exists: false,
        error: firstError?.longMessage || 'Unable to check email. Please try again.',
      };
    }

    // Unknown error: show error, stay on email step
    return { exists: false, error: 'Something went wrong. Please try again.' };
  }
};

// Usage in handleEmailContinue:
const result = await checkUserExists(data.email);
if (result.error) {
  // Show inline error (NOT Alert) - matches app/(auth)/login.tsx pattern
  setAuthError(result.error);
  return;
}
setAuthError(''); // Clear any previous error
setAuthStep(result.exists ? 'signin' : 'signup');
```

**Password Policy (preserved from `app/(auth)/signup.tsx:41-76`):**

- Minimum 8 characters
- Requires uppercase letter
- Requires lowercase letter
- Requires number or special character
- Confirm password match

---

#### Password Strength Meter with React Hook Form

**Implementation approach:** Use RHF's `watch()` to observe password changes and compute strength reactively.

**Extract from `app/(auth)/signup.tsx:41-76`** (copy this logic):

```typescript
// Copy checkPasswordStrength function from app/(auth)/signup.tsx:41-60
const checkPasswordStrength = (password: string) => {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numberOrSpecial: /[\d\W]/.test(password),
  };
  // ... rest of function
};
```

**Integration with RHF in Continue screen:**

```typescript
// In ContinueScreen component:
const signUpForm = useForm({
  resolver: zodResolver(signUpSchema),
  defaultValues: { password: '', confirmPassword: '' },
});

// Watch password for strength meter (reactive)
const watchedPassword = signUpForm.watch('password');
const passwordStrength = useMemo(
  () => checkPasswordStrength(watchedPassword || ''),
  [watchedPassword]
);

// In JSX - render strength meter based on passwordStrength
{authStep === 'signup' && (
  <>
    <Controller ... />  {/* password field */}
    <PasswordStrengthMeter strength={passwordStrength} />
    <Controller ... />  {/* confirmPassword field */}
  </>
)}
```

**Key:** Use `watch()` not `onChange` callback - this is the idiomatic RHF pattern for derived state.

**Implementation outline:**

```typescript
import { useSignIn, useSignUp, isClerkAPIResponseError } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View, Alert, ActivityIndicator } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import AuthContainer from '@/components/auth/AuthContainer';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthDivider from '@/components/auth/AuthDivider';
import SignInWith from '@/components/auth/SignInWith';
import Input from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';
import ThemedText from '@/components/ui/ThemedText';
import { palette } from '@/lib/unistyles';

// ... schemas and types as shown above ...

export default function ContinueScreen() {
  const [authStep, setAuthStep] = useState<AuthStep>('email');
  const [userEmail, setUserEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useUnistyles();

  const { signIn, setActive: setSignInActive, isLoaded: isSignInLoaded } = useSignIn();
  const { signUp, setActive: setSignUpActive, isLoaded: isSignUpLoaded } = useSignUp();
  const router = useRouter();

  // CRITICAL: Guard until Clerk is loaded
  if (!isSignInLoaded || !isSignUpLoaded) {
    return (
      <AuthContainer>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.highlight} />
        </View>
      </AuthContainer>
    );
  }

  // Now signIn and signUp are guaranteed non-null
  // ... rest of implementation ...

  // Post-auth destination: router.replace('/(app)/(drawer)')
}

const styles = StyleSheet.create((theme) => ({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // ... other styles ...
}));
```

**State machine:**

- `email` → Enter email, check if user exists
- `signin` → User exists, enter password only
- `signup` → New user, enter password + confirm (with strength meter)
- `verify` → Email verification for new signups

---

#### Error UX Pattern (CRITICAL - Follow Existing Pattern)

**Reference:** `app/(auth)/login.tsx:18,86` uses inline `authError` text, NOT Alerts.

**The Continue screen MUST use the same pattern for consistency:**

```typescript
const [authError, setAuthError] = useState('');

// In JSX, above the form fields:
{authError ? <ThemedText style={styles.authError}>{authError}</ThemedText> : null}
```

**Error Handling by Step:**

| Step     | Error Type               | Display Method                                | User Action                |
| -------- | ------------------------ | --------------------------------------------- | -------------------------- |
| `email`  | Network/unknown error    | `authError` text above form                   | Stay on step, retry        |
| `signin` | Wrong password           | `authError` text (e.g., "Incorrect password") | Stay on step, retry        |
| `signin` | Account locked           | `authError` text                              | Stay on step, show message |
| `signup` | Password too weak        | Inline field error via `error` prop           | Fix password               |
| `signup` | Passwords don't match    | Inline field error on confirm                 | Fix confirm                |
| `signup` | Email already registered | `authError` text + offer sign-in link         | User can tap to switch     |
| `verify` | Invalid code             | Inline field error on code input              | Re-enter code              |
| `verify` | Code expired             | `authError` text + "Resend" button            | Tap resend                 |

**NO Alerts for form errors** - Only use Alert for:

- OAuth cancellation handling (silent - no alert at all)
- Critical system errors that require app restart

**Style for `authError` (based on `app/(auth)/login.tsx`, using palette token):**

Note: `app/(auth)/login.tsx` currently hardcodes `#ef4444`. For consistency with the codebase's palette system, use `palette.red500` which equals the same color.

```typescript
import { palette } from '@/lib/unistyles';

// In styles:
authError: {
  color: palette.red500,  // Same as #ef4444, but using palette token
  fontSize: 14,
  textAlign: 'center',
  marginBottom: 16,
},
```

---

**Error Handling Summary (all steps use inline errors, NOT Alerts):**

| Step     | Error Type                  | Action                                        |
| -------- | --------------------------- | --------------------------------------------- |
| `email`  | `form_identifier_not_found` | Route to signup (user doesn't exist)          |
| `email`  | Network/transient error     | Set `authError`, stay on email step           |
| `email`  | Unknown Clerk error         | Set `authError`, stay on email step           |
| `signin` | Wrong password              | Set `authError` ("Incorrect password")        |
| `signin` | **OAuth-only account**      | Set `authError` with OAuth prompt (see below) |
| `signup` | Weak password               | Inline field error via Input `error` prop     |
| `signup` | Passwords don't match       | Inline field error on confirm field           |
| `verify` | Invalid/expired code        | Inline field error OR `authError`             |

---

#### OAuth-Only Accounts (No Password)

**Scenario:** User previously signed up via Google/Apple and never set a password. When they enter their email and we detect they exist, the password sign-in will fail.

**Expected Clerk Error:** `form_password_incorrect` or similar when attempting `signIn.create()` with password on OAuth-only account.

**Required UX:**

```typescript
// In handleSignIn (signin step):
try {
  const result = await signIn.create({
    identifier: userEmail,
    password: data.password,
  });
  // ... success handling
} catch (err) {
  if (isClerkAPIResponseError(err)) {
    const code = err.errors[0]?.code;

    // Check for OAuth-only account indicators
    // Log and verify actual codes during development
    console.log('[Clerk SignIn Error]', code, err.errors[0]?.message);

    if (code === 'form_password_incorrect') {
      // Could be wrong password OR OAuth-only account
      // Show helpful message that includes OAuth option
      setAuthError(
        'Incorrect password. If you signed up with Google or Apple, use those options above.'
      );
    } else {
      setAuthError(err.errors[0]?.longMessage || 'Sign in failed.');
    }
  }
}
```

**Key:** The error message explicitly reminds user about OAuth options, which are always visible at the top of the Continue screen.

---

**RULE: NO Alert.alert() for form/business errors in the Continue screen flow.**

**Exception - OAuth errors in SignInWith.tsx MAY use Alert because:**

- OAuth errors occur after returning from external browser
- There's no "form" context to show inline errors
- The component is self-contained (doesn't have access to Continue screen's `authError` state)
- User cancellation is silent (no alert); only actual failures show alerts

---

#### React Hook Form + Input Integration Pattern

The repo's `Input` component (`components/forms/Input.tsx`) uses controlled props:

- `value: string`
- `onChangeText: (text: string) => void`
- `error?: string` (displays below input)
- `label?: string`
- `variant?: 'animated' | 'classic' | 'underlined'`

**Integration with React Hook Form using Controller:**

```typescript
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/forms/Input';

// Example: Email step form
const emailForm = useForm({
  resolver: zodResolver(emailSchema),
  defaultValues: { email: '' },
});

// In JSX - use Controller to bridge RHF with Input component
<Controller
  control={emailForm.control}
  name="email"
  render={({ field: { onChange, value }, fieldState: { error } }) => (
    <Input
      label="Email"
      variant="underlined"
      value={value}
      onChangeText={onChange}
      error={error?.message}
      keyboardType="email-address"
      autoCapitalize="none"
      autoComplete="email"
    />
  )}
/>

// Submit handler
const onSubmit = emailForm.handleSubmit(async (data) => {
  await handleEmailContinue(data);
});

<Button title="Continue" onPress={onSubmit} loading={isLoading} />
```

**Form reset when changing steps:**

```typescript
// When transitioning from email to signin
const handleEmailContinue = async (data: { email: string }) => {
  setUserEmail(data.email);
  const result = await checkUserExists(data.email);
  if (result.error) {
    // Use inline error (NOT Alert) - consistent with error UX rules
    setAuthError(result.error);
    return;
  }
  setAuthError(''); // Clear any previous error
  if (result.exists) {
    signInForm.reset({ password: '' }); // Reset signin form
    setAuthStep('signin');
  } else {
    signUpForm.reset({ password: '', confirmPassword: '' }); // Reset signup form
    setAuthStep('signup');
  }
};

// When going back to email step
const handleBackToEmail = () => {
  emailForm.reset({ email: userEmail }); // Preserve email
  setAuthStep('email');
};
```

---

#### Email Verification Implementation Reference

**Source:** `app/(auth)/signup.tsx:119-158`

> **Note:** The code below documents the EXISTING signup.tsx pattern for reference.
> The Continue screen implementation should adapt this to use inline `authError` text instead of `Alert.alert()` for consistency with the error UX rules.

**Step 1: Create signup + prepare verification (lines 119-132):**

```typescript
// After password validation passes
await signUp.create({
  emailAddress: userEmail,
  password: data.password,
});

await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
setAuthStep('verify'); // Transition to verify step
```

**Step 2: Attempt verification (lines 135-158):**

```typescript
const handleVerification = async (data: { code: string }) => {
  setIsLoading(true);
  try {
    const result = await signUp.attemptEmailAddressVerification({
      code: data.code,
    });

    if (result.status === 'complete') {
      await setSignUpActive({ session: result.createdSessionId });
      router.replace('/(app)/(drawer)');
    } else {
      Alert.alert('Error', 'Verification could not be completed. Please try again.');
    }
  } catch (err: any) {
    const errorMessage = err.errors?.[0]?.message || 'Verification failed. Please try again.';
    Alert.alert('Error', errorMessage);
  } finally {
    setIsLoading(false);
  }
};
```

**Resend code behavior:**

```typescript
const handleResendCode = async () => {
  try {
    await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    Alert.alert('Success', 'Verification code resent to your email.');
  } catch (err: any) {
    Alert.alert('Error', 'Could not resend code. Please try again.');
  }
};
```

---

**Acceptance Criteria:**

- [x] File created at `app/(auth)/continue.tsx`
- [x] **Clerk loading guard**: Shows spinner until `isSignInLoaded && isSignUpLoaded`
- [x] Shows OAuth buttons (Google, Apple)
- [x] Email entry with validation
- [x] Auto-detects existing vs new users
- [x] **Error handling**: Uses inline `authError` text (NOT Alerts) for form errors
- [x] Sign-in flow for existing users (password only)
- [x] Sign-up flow for new users preserves password policy from `app/(auth)/signup.tsx`
- [x] Password strength meter matches current behavior
- [x] Confirm password required for signup
- [x] Email verification works (per `app/(auth)/signup.tsx:119-158`)
- [x] Resend code functionality works
- [x] Post-auth navigates to `/(app)/(drawer)`
- [x] `npm run lint` passes
- [x] Theme-adaptive (works in light AND dark)
- [x] **Controller pattern**: All inputs use RHF Controller with Input component
- [ ] **Small screen**: Content scrolls when keyboard is open (verify on iPhone SE simulator)
- [ ] **Keyboard dismiss**: Tapping outside inputs dismisses keyboard
- [x] **Debug logs removed**: `grep -r "\[Clerk" app/` returns no matches
- [x] **Error code verified**: `ERROR_CODES_USER_NOT_FOUND` has dated verification comment

---

### Task 5: Update Auth Layout to Include Continue Screen

**What to do:**
Add `continue` screen to the auth Stack and set animation to none.

**File to modify:** `app/(auth)/_layout.tsx`

**Current content:**

```typescript
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/(app)/(drawer)" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
```

**Updated content:**

```typescript
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return null;
  if (isSignedIn) return <Redirect href="/(app)/(drawer)" />;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="continue" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
```

**Changes:**

- Added `animation: 'none'` for smoother step transitions
- Added `continue` screen (first in list = default)
- Preserved existing `login` and `signup` as fallbacks

**Acceptance Criteria:**

- [x] `app/(auth)/_layout.tsx` updated
- [x] `continue` screen is registered first
- [x] `animation: 'none'` applied
- [x] Signed-in redirect still points to `/(app)/(drawer)`
- [x] `npm run lint` passes

---

### Task 6: Update App Layout to Redirect to Continue

**What to do:**
Change the unauthenticated redirect from `/login` to `/continue`.

**File to modify:** `app/(app)/_layout.tsx`

**Current line 24:**

```typescript
if (!isSignedIn) return <Redirect href="/(auth)/login" />;
```

**Updated line 24:**

```typescript
if (!isSignedIn) return <Redirect href="/(auth)/continue" />;
```

**Acceptance Criteria:**

- [x] `app/(app)/_layout.tsx` line 24 updated
- [x] Unauthenticated users redirect to `/(auth)/continue`
- [x] `npm run lint` passes

---

### Task 7: Fix Broken Redirects in Existing Auth Screens

**What to do:**
The existing login and signup screens have BROKEN post-auth redirects pointing to a non-existent path. Fix them.

**Files to modify:**

#### 7a. `app/(auth)/login.tsx`

**Current line 65:**

```typescript
router.replace('/(drawer)/(tabs)/');
```

**Updated line 65:**

```typescript
router.replace('/(app)/(drawer)');
```

#### 7b. `app/(auth)/signup.tsx`

**Current line 148:**

```typescript
router.replace('/(drawer)/(tabs)/');
```

**Updated line 148:**

```typescript
router.replace('/(app)/(drawer)');
```

**Acceptance Criteria:**

- [x] `app/(auth)/login.tsx` line 65 updated to `/(app)/(drawer)`
- [x] `app/(auth)/signup.tsx` line 148 updated to `/(app)/(drawer)`
- [ ] Email/password login via fallback screen works
- [ ] Email/password signup via fallback screen works
- [x] `npm run lint` passes

---

### Task 8: Verify App Scheme (Already Configured)

**What to do:**
Verify that the app scheme is configured for OAuth redirects.

**File to verify:** `app.json`

**Expected content (line 8):**

```json
"scheme": "luna",
```

**Verification command:**

```bash
grep -n '"scheme"' app.json
# Expected output: 8:    "scheme": "luna",
```

**Clerk Dashboard configuration (manual step):**

1. Go to [Clerk Dashboard](https://dashboard.clerk.com) → Your app
2. Navigate to **User & Authentication** → **Social Connections**
3. Ensure Google and Apple are enabled
4. **Google redirect URIs** (add both):
   - Production: `luna://oauth-callback`
   - Development: Check console log from `AuthSession.makeRedirectUri()`
5. **Apple** - verify Bundle ID matches your app

**Verification of OAuth setup:**

```bash
# 1. Verify app scheme exists
grep -n '"scheme"' app.json
# Expected: 8:    "scheme": "luna",

# 2. Start app and check redirect URI in console
npx expo start
# Look for: "Redirect URI: luna://..." or "Redirect URI: exp://..."
```

**Acceptance Criteria:**

- [x] `grep -n '"scheme"' app.json` shows `"scheme": "luna"`
- [ ] Google OAuth configured in Clerk Dashboard with correct redirect URI
- [ ] Apple OAuth configured in Clerk Dashboard with correct Bundle ID
- [ ] Redirect URI verified in console matches Clerk Dashboard config

---

## File Change Summary

| File                                | Action | Description                              |
| ----------------------------------- | ------ | ---------------------------------------- |
| `components/auth/`                  | CREATE | New directory for auth components        |
| `components/auth/SignInWith.tsx`    | CREATE | OAuth component with useSSO()            |
| `components/auth/AuthContainer.tsx` | CREATE | Keyboard-aware container                 |
| `components/auth/AuthHeader.tsx`    | CREATE | Luna branding + gradient circle          |
| `components/auth/AuthDivider.tsx`   | CREATE | "or" divider                             |
| `app/(auth)/continue.tsx`           | CREATE | Unified Continue flow                    |
| `app/(auth)/_layout.tsx`            | MODIFY | Add continue screen, no animations       |
| `app/(app)/_layout.tsx`             | MODIFY | Redirect unauth to /continue             |
| `app/(auth)/login.tsx`              | MODIFY | Fix broken redirect to /(app)/(drawer)   |
| `app/(auth)/signup.tsx`             | MODIFY | Fix broken redirect to /(app)/(drawer)   |
| `app.json`                          | MODIFY | Change userInterfaceStyle to "automatic" |

---

## Verification Strategy

### Automated Checks

```bash
# TypeScript compilation
npx tsc --noEmit

# Linting
npm run lint

# Verify dependencies
npm ls react-hook-form @hookform/resolvers zod expo-auth-session expo-web-browser
```

### Manual Testing Flow

**Test 1: Google OAuth (New User)**

1. Open app → redirects to `/(auth)/continue`
2. Tap "Continue with Google"
3. Google consent screen appears
4. Select account (new to app)
5. Redirects back → `/(app)/(drawer)` (home screen)

**Test 2: Apple OAuth**

> ⚠️ **REQUIRES PHYSICAL iOS DEVICE**: Apple Sign-In does not work in iOS Simulator because it requires Face ID/Touch ID authentication. You must test on a real iPhone/iPad.

1. **On physical iOS device**: Open app → Continue screen
2. Tap "Continue with Apple"
3. Apple auth sheet appears
4. Authenticate with Face ID/Touch ID
5. Redirects back → `/(app)/(drawer)`

**Test 3: Email - Existing User**

1. Enter existing user's email
2. Tap Continue
3. Password field appears (sign-in mode, no confirm)
4. Enter password
5. Success → `/(app)/(drawer)`

**Test 4: Email - New User**

1. Enter new email
2. Tap Continue
3. Password + Confirm fields appear (sign-up mode)
4. Password strength meter shows requirements
5. Enter matching passwords meeting requirements
6. Verification code sent
7. Enter code
8. Success → `/(app)/(drawer)`

**Test 5: OAuth Cancellation**

1. Tap "Continue with Google"
2. Tap back/cancel in Google sheet
3. Should return silently (no error alert)

**Test 6: Password Validation (New User)**

1. Enter new email → Continue
2. Enter weak password ("abc")
3. Strength meter shows: "At least 8 characters • Add uppercase letter • Add number or special character"
4. Password field shows error
5. Enter strong password ("Password1!")
6. Strength meter shows: "Strong password!"
7. Continue enabled

**Test 7: Network Error Handling**

1. Disable network (airplane mode or disable Wi-Fi)
2. Enter email → Continue
3. Inline error text appears above form (NOT an alert popup), stays on email step
4. Enable network
5. Try again → works (error text clears on success)

**Test 8: Fallback Screens Still Work**

1. Navigate directly to `/(auth)/login`
2. Enter email/password
3. Success → `/(app)/(drawer)` (NOT broken `/(drawer)/(tabs)/`)

**Test 9: Theme Switching**

> Note: After Task 1, `app.json` has `userInterfaceStyle: "automatic"` which enables theme switching.

**Method A: Via Device Settings**

1. Set iOS device to light mode (Settings → Display → Light)
2. Open Continue screen → UI is visible and readable
3. Set iOS device to dark mode (Settings → Display → Dark)
4. Open Continue screen → UI is visible and readable

**Method B: Via App's ThemeToggle (faster for testing)**

1. Sign in with any method
2. Navigate to a screen with `ThemeToggle` component
3. Tap toggle → theme switches (uses `setThemeMode()` from `lib/storage.ts`)
4. Sign out, verify Continue screen respects new theme
5. Repeat for both light and dark

**Verification:**

- Text is readable (not same color as background)
- Buttons have visible borders
- Gradient circle is visible in both themes

### Route Assertions

| Scenario                             | Expected Route                |
| ------------------------------------ | ----------------------------- |
| App opens, not signed in             | `/(auth)/continue`            |
| OAuth success                        | `/(app)/(drawer)`             |
| Email sign-in success                | `/(app)/(drawer)`             |
| Email sign-up success (after verify) | `/(app)/(drawer)`             |
| Already signed in, navigate to auth  | Redirect to `/(app)/(drawer)` |
| Fallback login success               | `/(app)/(drawer)`             |
| Fallback signup success              | `/(app)/(drawer)`             |

---

## Design Tokens

**Colors (from `lib/unistyles.ts` - theme-adaptive):**

| Token                    | Light Mode | Dark Mode |
| ------------------------ | ---------- | --------- |
| `theme.colors.primary`   | #f5f5f5    | #171717   |
| `theme.colors.text`      | #000000    | #ffffff   |
| `theme.colors.subtext`   | #64748B    | #A1A1A1   |
| `theme.colors.highlight` | #0EA5E9    | #0EA5E9   |
| `theme.colors.border`    | #E2E8F0    | #404040   |

**Palette (static, from `lib/unistyles.ts`):**

- Error: `palette.red500` (#ef4444)
- Success: `palette.green500` (#22c55e)
- Warning: `palette.yellow500` (#eab308)

**Gradient (Luna branding - static):**

- `['#D883E4', '#016BF0', '#3DE3E0', '#E57DDF']`

**Typography (from `lib/unistyles.ts:58-60`):**

- Regular: `theme.fonts.regular` (Outfit_400Regular)
- Bold: `theme.fonts.bold` (Outfit_700Bold)
- ⚠️ NO `theme.fonts.medium` exists - do not use

**Spacing:**

- Padding: 24px horizontal
- Button height: 56px
- Button radius: 28px (pill)
- Gap between buttons: 12px

---

## Success Criteria

After completing this plan:

- [ ] Unified Continue flow works end-to-end
- [ ] Google OAuth works
- [ ] Apple OAuth works
- [x] Email flow auto-detects existing users
- [x] New user signup preserves password policy (strength, confirm)
- [x] Network errors show inline `authError` text (not alert) and stay on email step
- [x] Silent OAuth cancellation handling
- [x] Luna branding prominent
- [x] **Theme-adaptive**: Works in BOTH light and dark modes
- [x] `npm run lint` passes
- [x] `npx tsc --noEmit` passes (auth files clean)
- [ ] Works on iOS
- [x] Post-auth navigates to `/(app)/(drawer)`
- [x] Fallback login/signup screens have fixed redirects
