# Auth Simplification: OAuth-Only with Deferred Sign-in

## Context

### Original Request

Remove email sign-ups, set up Google OAuth properly, and change the app so users don't need to sign in to see it - only require sign-in when they try to send a message.

### Interview Summary

**Key Discussions**:

- Sign-in prompt: **Modal overlay** (stays in context when user tries to send)
- Proactive sign-in: **Yes, in drawer menu** (for users who want to auth early)
- OAuth providers: **Google + Apple** (both supported)
- Email/password: **Remove completely** (OAuth only)
- Auto-send after auth: **No** - let user tap Send again
- Old auth screens: **Delete completely** (continue.tsx, login.tsx, signup.tsx)
- Clerk Dashboard: Workspace name is "luna", currently only has email/password enabled - needs OAuth setup

**Research Findings**:

- Current auth gate: `app/(app)/_layout.tsx:24` redirects unauthenticated users
- OAuth component exists: `components/auth/SignInWith.tsx` (uses `useSSO` hook)
- Context pattern: `app/contexts/DrawerContext.tsx` provides good template for AuthModalContext
- Drawer conditional: `components/ui/CustomDrawerContent.tsx:114-123` shows how to conditionally render based on `isSignedIn`
- Message sending: `components/ui/ChatInput.tsx:168-174` - **CRITICAL**: clears input after calling callback, regardless of result

### Metis Review

**Identified Gaps** (addressed):

- Error handling strategy: Check auth client-side BEFORE calling mutation (better UX)
- Message preservation: Don't clear input when modal appears
- OAuth redirect: After OAuth success, close modal instead of navigating away
- Drawer state: Close drawer when opening auth modal to avoid UI conflicts

### OAuth Callback Handling (IMPORTANT)

**How `luna://oauth-callback` works:**

- The redirect URI `luna://oauth-callback` is handled by `expo-auth-session`, NOT by an Expo Router route
- `WebBrowser.maybeCompleteAuthSession()` (called at module load in `SignInWith.tsx:21`) intercepts the deep link
- The OAuth flow returns control to the `startSSOFlow()` promise, which then processes the result
- **No route file is needed** for `oauth-callback` - it's handled entirely by the expo-auth-session library
- This means `app/(auth)/_layout.tsx` can be **deleted entirely** - it's not needed for OAuth

### Momus Review (Round 1)

**Critical Issues Identified**:

1. **Message preservation broken**: `ChatInput.tsx:171` calls `setInputText('')` AFTER invoking callback - even if auth check fails and modal shows
2. **OAuth navigates away**: `SignInWith.tsx:60` does `router.replace('/(app)/(drawer)')` - kicks user out of current chat
3. **Incomplete cleanup**: Missing `app/screens/forgot-password.tsx:81` link to deleted auth screen
4. **Auth layout end state unclear**: What does `_layout.tsx` render after deleting screens? → Answer: DELETE entirely (OAuth callback handled by expo-auth-session)

**Fixes Applied**:

1. Task 2.5: Modify `ChatInput` to return Promise<boolean> and only clear on success
2. Task 2: Modify `SignInWith` to accept `onSuccess` callback prop that overrides navigation
3. Task 7: Expanded cleanup to include forgot-password screen deletion
4. Task 7: Delete entire `app/(auth)/` directory (OAuth callback handled by expo-auth-session, not a route)

---

## Work Objectives

### Core Objective

Allow unauthenticated users to explore the app freely, prompting sign-in via modal only when they attempt to send a message. Use OAuth (Google + Apple) as the only authentication method.

### Concrete Deliverables

- `contexts/AuthModalContext.tsx` - Context for showing/hiding auth modal
- `components/auth/AuthModal.tsx` - Modal with Google + Apple OAuth buttons
- Modified `components/auth/SignInWith.tsx` - Add `onSuccess` callback prop
- Modified `components/ui/ChatInput.tsx` - Support async callback with success/failure return
- Modified `app/(app)/_layout.tsx` - Remove auth gate redirect
- Modified `components/ui/CustomDrawerContent.tsx` - Add "Sign in" option, fix sign-out
- Modified `app/(app)/(drawer)/index.tsx` - Check auth before sending
- Modified `app/(app)/(drawer)/(tabs)/chat/[id].tsx` - Check auth before sending
- Deleted `app/(auth)/continue.tsx`, `app/(auth)/login.tsx`, `app/(auth)/signup.tsx`
- Deleted `app/screens/forgot-password.tsx`
- Deleted unused auth components in `components/auth/`
- Deleted `app/(auth)/` directory entirely (OAuth callback handled by expo-auth-session, not a route)
- Documentation: `CLERK_OAUTH_SETUP.md`

### Definition of Done

- [ ] Unauthenticated user can open app and see chat interface
- [ ] **No Convex "User not authenticated" errors when signed out**
- [ ] Tapping Send without auth shows modal (not navigation)
- [ ] **Message input is NOT cleared when modal appears**
- [ ] OAuth modal has Google + Apple buttons
- [ ] Successful OAuth closes modal and **returns to same screen** (no navigation)
- [ ] Message input is preserved after auth
- [ ] User must tap Send again after auth
- [ ] Drawer shows "Sign in" when not authenticated
- [ ] Drawer shows "Sign out" when authenticated
- [ ] **Drawer profile button hidden when signed out** (not rendered)
- [ ] Sign out stays in app (no redirect to deleted auth screens)
- [ ] **Sign-out transition doesn't strand user on erroring screen**
- [ ] Old auth screens deleted
- [ ] Entire `app/(auth)/` directory deleted
- [ ] Forgot-password screen deleted
- [ ] No TypeScript errors
- [ ] No redbox/crash when signed out
- [ ] Works on iOS simulator

### Must Have

- OAuth-only authentication (Google + Apple)
- Modal-based auth prompt on message send
- **Message input preservation** when auth modal shows
- **No navigation** on OAuth success (just close modal)
- Sign-in option in drawer menu
- Clean removal of email/password auth code

### Must NOT Have (Guardrails)

- **DO NOT** modify `convex/messages.ts` or any backend auth logic
- **DO NOT** auto-send message after successful OAuth
- **DO NOT** clear message input when auth modal appears
- **DO NOT** navigate away from current screen for auth (use modal overlay)
- **DO NOT** navigate away on OAuth success (just close modal)
- **DO NOT** add new OAuth providers beyond Google + Apple
- **DO NOT** create new email/password auth flows

---

## Verification Strategy (MANDATORY)

### Test Decision

- **Infrastructure exists**: NO
- **User wants tests**: Manual-only
- **Framework**: none

### Manual QA Protocol

Each task includes verification using:

- `npx expo start` - Run development server
- iOS Simulator - Visual and interaction testing
- Console logs - Verify no errors

---

## Task Flow

```
Task 0 (Prep) → Task 1 (Context) → Task 2 (SignInWith + Modal) → Task 2.5 (ChatInput)
                                                                        ↓
                                                        Task 4A (Wire Provider ONLY - keep gate)
                                                                        ↓
                                                        Task 3 (Unauth UI State)
                                                                        ↓
                                                        Task 4B (Remove Auth Gate)
                                                                        ↓
                                                        Task 5 (Drawer Sign-in)
                                                                        ↓
                        ┌───────────────────────────────┴───────────────────────────────┐
                        ↓                                                               ↓
              Task 6 (Intercept Home)                                    Task 7 (Intercept Chat)
                        └───────────────────────────────┬───────────────────────────────┘
                                                        ↓
                                        Task 8 (Cleanup) → Task 9 (Docs)
```

**CRITICAL SEQUENCING** (prevents redbox/Convex errors):

1. **Task 4A** wires `AuthModalProvider` but KEEPS the auth gate → app still redirects signed-out users, but `useAuthModal()` is now available
2. **Task 3** adds all unauth UI hardening (skip queries, handle nulls) → signed-out users won't crash the app
3. **Task 4B** removes the auth gate → signed-out users can now enter the app safely

**NO REDBOXES ALLOWED**: Each task must leave the app in a working state. The above sequencing ensures this.

## Parallelization

| Group | Tasks | Reason                                |
| ----- | ----- | ------------------------------------- |
| A     | 6, 7  | Independent screens with same pattern |

| Task | Depends On | Reason                                                             |
| ---- | ---------- | ------------------------------------------------------------------ |
| 2    | 1          | Modal uses AuthModalContext                                        |
| 2.5  | 2          | ChatInput changes depend on modal being ready                      |
| 4A   | 2          | Provider wiring uses AuthModal component                           |
| 3    | 2.5, 4A    | Unauth UI needs ChatInput fix AND AuthModalProvider (for 3.5, 3.6) |
| 4B   | 3          | Safe to remove gate ONLY after unauth UI is hardened               |
| 5    | 4A         | Drawer sign-in uses `useAuthModal()` which needs provider          |
| 6, 7 | 2.5, 4A    | Need ChatInput fix and `useAuthModal()` access                     |
| 8    | 4B, 6, 7   | Delete after new flow works and gate is removed                    |
| 9    | 8          | Document after cleanup                                             |

---

## TODOs

**⚠️ EXECUTION ORDER (tasks are NOT in document order):**

```
0 → 1 → 2 → 2.5 → 4A → 3 → 4B → 5 → 6 → 7 → 8 → 9
```

Task 4A must complete BEFORE Task 3 (provider wiring enables `useAuthModal()`).
Task 3 must complete BEFORE Task 4B (unauth UI hardening before removing gate).

---

- [ ] 0. Verify OAuth Dependencies and Environment

  **What to do**:
  - Verify `expo-auth-session` and `expo-web-browser` are installed
  - Verify `app.json` has `"scheme": "luna"`
  - Verify Clerk publishable key is set in environment

  **Must NOT do**:
  - Install new dependencies
  - Change app scheme

  **Parallelizable**: NO (foundation check)

  **References**:
  - `package.json` - Check for expo-auth-session, expo-web-browser
  - `app.json:8` - Verify `"scheme": "luna"` exists
  - `.env.local` - Verify EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY is set

  **Acceptance Criteria**:

  **Manual Verification:**
  - [ ] Run: `grep -qE "expo-auth-session|expo-web-browser" package.json && echo "OAuth deps present" || echo "MISSING"`
  - [ ] Expected: "OAuth deps present"
  - [ ] Run: `grep -q '"scheme": "luna"' app.json && echo "Scheme OK" || echo "Scheme MISSING"`
  - [ ] Expected: "Scheme OK"
  - [ ] Run: `grep -q "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=." .env.local && echo "Clerk key is set" || echo "Clerk key MISSING"`
  - [ ] Expected: "Clerk key is set"
  - [ ] (All commands use -q flag to avoid printing sensitive config to terminal)

  **Commit**: NO (verification only)

---

- [x] 1. Create AuthModalContext

  **What to do**:
  - Create `contexts/AuthModalContext.tsx`
  - Follow pattern from `app/contexts/DrawerContext.tsx`
  - Expose `showAuthModal()`, `hideAuthModal()`, `isAuthModalVisible`
  - Include `useAuthModal()` hook with error if used outside provider
  - **Idempotency rule**: `showAuthModal()` must be a no-op if `isAuthModalVisible` is already true (prevents multiple modals from rapid taps)

  **Must NOT do**:
  - Add navigation logic (modal handles that)
  - Include any OAuth logic (that's in the modal component)

  **Parallelizable**: NO (other tasks depend on this)

  **References**:

  **Pattern References**:
  - `app/contexts/DrawerContext.tsx:1-46` - Context provider pattern with createContext, Provider, and hook
  - `contexts/ChatContext.tsx:1-40` - Alternative context pattern with useState

  **WHY Each Reference Matters**:
  - `DrawerContext.tsx` shows the exact pattern: interface → createContext → Provider component → useHook
  - Uses `useCallback` for memoization which we should follow
  - Error handling pattern in hook: `if (!context) throw new Error(...)`

  **Exact Implementation**:

  ```typescript
  import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

  interface AuthModalContextValue {
    isAuthModalVisible: boolean;
    showAuthModal: () => void;
    hideAuthModal: () => void;
  }

  const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

  export function AuthModalProvider({ children }: { children: ReactNode }) {
    const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);

    // Idempotent: calling when already visible is a no-op
    const showAuthModal = useCallback(() => {
      setIsAuthModalVisible(true);
    }, []);

    const hideAuthModal = useCallback(() => {
      setIsAuthModalVisible(false);
    }, []);

    return (
      <AuthModalContext.Provider value={{ isAuthModalVisible, showAuthModal, hideAuthModal }}>
        {children}
      </AuthModalContext.Provider>
    );
  }

  export function useAuthModal() {
    const context = useContext(AuthModalContext);
    if (!context) {
      throw new Error('useAuthModal must be used within AuthModalProvider');
    }
    return context;
  }
  ```

  **Acceptance Criteria**:

  **Manual Verification:**
  - [ ] File created at `contexts/AuthModalContext.tsx`
  - [ ] Exports: `AuthModalProvider`, `useAuthModal`
  - [ ] `showAuthModal` is idempotent (safe to call multiple times)
  - [ ] Run: `npx tsc --noEmit` (project-wide, ensures path aliases work)
  - [ ] Expected: No TypeScript errors

  **Commit**: YES
  - Message: `feat(auth): add AuthModalContext for deferred sign-in`
  - Files: `contexts/AuthModalContext.tsx`

---

- [ ] 2. Modify SignInWith and Create AuthModal Component

  **What to do**:

  **Part A: Modify SignInWith.tsx**
  - Add optional `onSuccess?: () => void` prop to `SignInWithProps` interface
  - In success handler (line 57-60): if `onSuccess` is provided, call it instead of `router.replace()`
  - Keep existing behavior as default (backward compatible)

  **Part B: Create AuthModal**
  - Create `components/auth/AuthModal.tsx`
  - Use React Native `Modal` component with:
    - `visible={isAuthModalVisible}` from context
    - `transparent={true}` for overlay effect
    - `animationType="fade"` for smooth appearance
    - `onRequestClose={hideAuthModal}` for Android back button
  - Semi-transparent background overlay (touchable to dismiss)
  - Centered white/themed card with:
    - Header text: "Sign in to continue"
    - Close button (X) in top-right
    - Two `SignInWith` components (Google and Apple)
  - Pass `onSuccess={hideAuthModal}` to each SignInWith
  - Theme-adaptive styling using `useUnistyles`

  **Must NOT do**:
  - Duplicate OAuth logic - reuse SignInWith
  - Navigate anywhere on success - just call hideAuthModal()
  - Clear any external state

  **Parallelizable**: NO (tasks 3-6 depend on this)

  **References**:

  **File to Modify**:
  - `components/auth/SignInWith.tsx:25-27` - Props interface (add `onSuccess?`)
  - `components/auth/SignInWith.tsx:57-60` - Success handler (conditional navigation)

**Current Code (line 57-60)**:

```typescript
if (createdSessionId) {
  setActive!({ session: createdSessionId });
  // Post-auth destination per app/(auth)/_layout.tsx:8
  router.replace('/(app)/(drawer)');
}
```

**Should Become**:

```typescript
if (createdSessionId) {
  setActive!({ session: createdSessionId });
  if (onSuccess) {
    onSuccess();
  } else {
    // Default: navigate to app drawer
    router.replace('/(app)/(drawer)');
  }
}
```

(Also remove the stale comment referencing `app/(auth)/_layout.tsx:8` since that file will be deleted)

**Should Become**:

```typescript
if (createdSessionId) {
  setActive!({ session: createdSessionId });
  if (onSuccess) {
    onSuccess();
  } else {
    // Default: navigate to app (backward compatible)
    router.replace('/(app)/(drawer)');
  }
}
```

**AuthModal ↔ AuthModalContext Wiring (CRITICAL)**:

```typescript
// components/auth/AuthModal.tsx
import { Modal, View, TouchableOpacity, Pressable } from 'react-native';
import { useAuthModal } from '@/contexts/AuthModalContext';
import SignInWith from './SignInWith';
import Icon from '@/components/ui/Icon';
import ThemedText from '@/components/ui/ThemedText';

export default function AuthModal() {
  const { isAuthModalVisible, hideAuthModal } = useAuthModal();

  return (
    <Modal
      visible={isAuthModalVisible}        // Driven by context state
      transparent={true}
      animationType="fade"
      onRequestClose={hideAuthModal}       // Android back button closes modal
    >
      {/* Semi-transparent overlay - tap to dismiss */}
      <Pressable style={styles.overlay} onPress={hideAuthModal}>
        {/* Card - nested View (not Pressable) lets parent handle taps */}
        <View style={styles.card} onStartShouldSetResponder={() => true}>
          {/* Close button */}
          <TouchableOpacity style={styles.closeButton} onPress={hideAuthModal}>
            <Icon name="X" size={24} />
          </TouchableOpacity>

          <ThemedText style={styles.title}>Sign in to continue</ThemedText>

          {/* OAuth buttons - onSuccess closes modal instead of navigating */}
          <SignInWith strategy="oauth_google" onSuccess={hideAuthModal} />
          <SignInWith strategy="oauth_apple" onSuccess={hideAuthModal} />
        </View>
      </Pressable>
    </Modal>
  );
}
```

**Overlay Dismiss Pattern (IMPORTANT)**:
The pattern above uses `onStartShouldSetResponder={() => true}` on the inner `View` to capture touch events and prevent them from bubbling to the overlay `Pressable`. This is the standard React Native approach for "tap outside to dismiss" modals.

Alternative approaches (if above doesn't work as expected):

1. Use `TouchableWithoutFeedback` for the overlay instead of `Pressable`
2. Add `pointerEvents="box-none"` to an outer container

The key behavior: tapping the semi-transparent overlay dismisses the modal; tapping inside the white card does NOT dismiss.

**Component References**:

- `components/ui/ThemedText.tsx` - Text component
- `components/ui/Icon.tsx` - For close (X) button

**Context References**:

- `contexts/AuthModalContext.tsx` (from Task 1) - Import `useAuthModal`

**WHY Each Reference Matters**:

- `visible={isAuthModalVisible}` ensures modal only shows when context says so
- `onRequestClose={hideAuthModal}` handles Android hardware back button
- `onSuccess={hideAuthModal}` passed to SignInWith overrides default navigation
- Overlay `onPress` allows dismissing by tapping outside the card

**Acceptance Criteria**:

**Manual Verification (using Expo):**

- [ ] SignInWith.tsx has new `onSuccess?: () => void` prop
- [ ] AuthModal.tsx uses `isAuthModalVisible` from context for `visible` prop
- [ ] AuthModal.tsx has `onRequestClose={hideAuthModal}`
- [ ] Start app: `npx expo start`
- [ ] Trigger modal via drawer "Sign in" button (from Task 5, test after Task 5 is done)
- [ ] Modal appears with Google + Apple buttons
- [ ] Tap X → Modal closes
- [ ] Tap overlay (outside card) → Modal closes
- [ ] (Android) Press back button → Modal closes
- [ ] (If testing OAuth): Sign in → Modal closes, user stays on same screen

**Commit**: YES

- Message: `feat(auth): add onSuccess prop to SignInWith, create AuthModal component`
- Files: `components/auth/SignInWith.tsx`, `components/auth/AuthModal.tsx`

---

- [ ] 2.5. Modify ChatInput and ALL Call Sites for Async Callback

  **What to do**:

  **CRITICAL**: This task MUST update ChatInput AND all call sites in the same commit to maintain type safety.

  **Part A: Modify ChatInput**
  - Modify `ChatInput` props to accept `onSendMessage` that returns `Promise<boolean>`
  - Change `handleSendMessage` to:
    1. Call `onSendMessage` and await the result
    2. **Wrap in try/catch** - if callback throws, treat as `false` (preserve input)
    3. Only clear `inputText` and `selectedImages` if result is `true`
  - Update type: `onSendMessage?: (text: string, images?: string[]) => Promise<boolean>`

  **Part B: Update ALL Call Sites** (in same commit)
  - `app/(app)/(drawer)/index.tsx:232` - Update `handleSendMessage` to return `Promise<boolean>`
  - `app/(app)/(drawer)/(tabs)/chat/[id].tsx:104-115` - Update `handleSendMessage` to return `Promise<boolean>`

  **Must NOT do**:
  - Leave call sites with old signature (will break TypeScript)
  - Change any other ChatInput behavior

  **Parallelizable**: NO (critical for message preservation)

  **References**:

  **Files to Modify**:
  - `components/ui/ChatInput.tsx:23-27` - Props type definition
  - `components/ui/ChatInput.tsx:167-174` - `handleSendMessage` function
  - `app/(app)/(drawer)/index.tsx:142-170` - Home screen `handleSendMessage`
  - `app/(app)/(drawer)/(tabs)/chat/[id].tsx:104-115` - Chat screen `handleSendMessage`

  **ChatInput - Current Code (line 167-174)**:

  ```typescript
  const handleSendMessage = () => {
    if (props.onSendMessage && (inputText.trim() || selectedImages.length > 0)) {
      props.onSendMessage(inputText, selectedImages.length > 0 ? selectedImages : undefined);
      setInputText('');
      setSelectedImages([]);
    }
  };
  ```

  **ChatInput - Should Become**:

  ```typescript
  const handleSendMessage = async () => {
    if (props.onSendMessage && (inputText.trim() || selectedImages.length > 0)) {
      try {
        const success = await props.onSendMessage(
          inputText,
          selectedImages.length > 0 ? selectedImages : undefined
        );
        // Only clear input if send was successful
        if (success) {
          setInputText('');
          setSelectedImages([]);
        }
      } catch (error) {
        // If callback throws, treat as failure - preserve input
        console.error('Send failed:', error);
        // Input preserved automatically (no clearing)
      }
    }
  };
  ```

  **Type Change (line 26)**:

  ```typescript
  // FROM:
  onSendMessage?: (text: string, images?: string[]) => void;
  // TO:
  onSendMessage?: (text: string, images?: string[]) => Promise<boolean>;
  ```

  **Call Site Update Pattern** (for both home and chat screens):

  ```typescript
  // Add return type and return statements
  const handleSendMessage = useCallback(
    async (text: string, _images?: string[]): Promise<boolean> => {
      // ... existing validation ...
      try {
        // ... existing send logic ...
        return true; // Success
      } catch (error) {
        console.error('Failed to send message:', error);
        return false; // Failure - input preserved
      }
    },
    [
      /* deps */
    ]
  );
  ```

  **WHY This Matters**:
  - When auth check fails and modal shows, callback returns `false`
  - When send throws an error, try/catch returns `false`
  - Input is preserved in all failure cases
  - When send succeeds, callback returns `true` and input clears normally
  - **TypeScript will break if call sites aren't updated in same commit**

  **NOTE: These handlers will be modified again**:
  - `app/(app)/(drawer)/index.tsx:handleSendMessage` - Task 6 adds auth check + session expiry handling
  - `app/(app)/(drawer)/(tabs)/chat/[id].tsx:handleSendMessage` - Task 7 adds auth check + session expiry handling
  - This task establishes the `Promise<boolean>` foundation; Tasks 6/7 add the auth-specific logic

  **Acceptance Criteria**:

  **Manual Verification:**
  - [ ] ChatInput type changed to `Promise<boolean>`
  - [ ] ChatInput `handleSendMessage` is `async` with try/catch
  - [ ] Home screen `handleSendMessage` returns `Promise<boolean>`
  - [ ] Chat screen `handleSendMessage` returns `Promise<boolean>`
  - [ ] Run: `npx tsc --noEmit` (PROJECT-WIDE, not single file)
  - [ ] Expected: No TypeScript errors across entire project
  - [ ] Input only clears when callback returns `true`

  **Commit**: YES
  - Message: `refactor(chat): make ChatInput.onSendMessage async with success/failure`
  - Files: `components/ui/ChatInput.tsx`, `app/(app)/(drawer)/index.tsx`, `app/(app)/(drawer)/(tabs)/chat/[id].tsx`

---

- [ ] 3. Handle Unauthenticated UI State (CRITICAL)

  **DEPENDENCY**: Task 4A (AuthModalProvider wiring) MUST complete BEFORE this task, because Parts A.5 and A.6 use `useAuthModal()`.

  **SAFE INTERMEDIATE STATE**: During this task, the auth gate is STILL active (from Task 4A). This means signed-out users can't actually reach these screens yet. We're preparing the code so that when we remove the gate (Task 4B), everything works safely.

  **What to do**:

  This task addresses the runtime behavior when signed out. Without these changes, removing the auth gate would cause Convex errors and broken UI.

  **Part A: Home Screen (`app/(app)/(drawer)/index.tsx`)**
  - Import `useAuth` from Clerk
  - Skip `getUserCredits` query when not signed in: `useQuery(api.queries.getUserCredits, isSignedIn ? {} : 'skip')`
  - Show placeholder in credits display when not signed in (e.g., "---" or hide entirely)
  - Conversation queries (`getConversation`, `getStreamingMessage`) already use `conversationId ? {...} : 'skip'`, so they're safe

  **Part A.5: Conversations Screen (`app/(app)/(drawer)/(tabs)/index.tsx`)**
  - Import `useAuth` from Clerk and `useAuthModal` from context
  - Skip `getUserCredits` query when not signed in: `useQuery(api.queries.getUserCredits, isSignedIn ? {} : 'skip')`
  - Handle "New Conversation" FAB when signed out:
    - Check `isSignedIn` at start of FAB onPress handler
    - If not signed in: call `showAuthModal()` and return early
    - If signed in: proceed with existing navigation to new conversation
    - **NOTE**: This prevents signed-out users from navigating to a "new conversation" screen where they'd immediately hit send auth blocks anyway
  - Conversations list is safe (`api.conversations.list` returns `[]` for unauth users)

  **Part A.6: Images Screen (`app/(app)/(drawer)/(tabs)/images/index.tsx`)**
  - Import `useAuth` from Clerk and `useAuthModal` from context
  - Skip `getUserCredits` query when not signed in: `useQuery(api.queries.getUserCredits, isSignedIn ? {} : 'skip')`
  - Handle "Generate" button when signed out:
    - Check `isSignedIn` at start of `handleGenerate`
    - If not signed in: call `showAuthModal()` and return (preserve prompt text)
    - If signed in: proceed with existing logic
  - User images query is safe (`listUserImages` returns `[]` for unauth users per ownership check)

  **Part B: Chat Screen (`app/(app)/(drawer)/(tabs)/chat/[id].tsx`)**
  - Import `useAuth` from Clerk
  - Skip `getConversation` and `getStreamingMessage` queries when not signed in
  - When signed out and on a chat screen: show "Sign in to view conversations" message instead of "Loading..."
  - **Design decision**: Signed-out users cannot view existing chat history (requires auth to access conversation data)
  - **ChatInput is NOT rendered** when signed out (no composer on this screen for unauth users)

  **Part C: Drawer Profile Button (`components/ui/CustomDrawerContent.tsx`)**
  - Handle `user` being `undefined`/`null` when signed out
  - **Decision: HIDE the profile button when not signed in** (cleaner UX - profile page has nothing to show for unauthenticated users)
  - Current code at lines 79-82, 160-173 assumes user exists
  - Wrap profile button in `{isSignedIn && (...)}`

  **Must NOT do**:
  - Modify any Convex backend code
  - Change the auth logic in queries (they correctly return null/throw for unauth users)

  **Parallelizable**: NO (must complete before removing auth gate)

  **References**:

  **Files to Modify**:
  - `app/(app)/(drawer)/index.tsx:114` - `useQuery(api.queries.getUserCredits)` (needs skip when signed out)
  - `app/(app)/(drawer)/index.tsx:184-190` - Credits display in header
  - `app/(app)/(drawer)/(tabs)/index.tsx:50` - `useQuery(api.queries.getUserCredits)` (needs skip when signed out)
  - `app/(app)/(drawer)/(tabs)/index.tsx:53-58` - `handleNewConversation` (show auth modal when signed out)
  - `app/(app)/(drawer)/(tabs)/images/index.tsx:53` - `useQuery(api.queries.getUserCredits)` (needs skip when signed out)
  - `app/(app)/(drawer)/(tabs)/images/index.tsx:60-87` - `handleGenerate` (show auth modal when signed out)
  - `app/(app)/(drawer)/(tabs)/chat/[id].tsx:86-87` - Conversation queries (need skip when signed out)
  - `app/(app)/(drawer)/(tabs)/chat/[id].tsx:134-143` - Loading state (show auth message instead)
  - `components/ui/CustomDrawerContent.tsx:79-82` - User info derivation (handle null user)
  - `components/ui/CustomDrawerContent.tsx:160-173` - Profile button (hide or show guest state)

  **Skip Query Pattern**:

  ```typescript
  const { isSignedIn } = useAuth();
  // Skip query when not signed in - returns undefined instead of throwing
  const credits = useQuery(api.queries.getUserCredits, isSignedIn ? {} : 'skip');
  ```

  **Chat Screen Signed-Out State (COMPLETE END STATE)**:

  ```typescript
  // At top of component
  const { isSignedIn } = useAuth();

  // Skip ALL queries when not signed in
  const conversation = useQuery(
    api.queries.getConversation,
    isSignedIn ? { conversationId } : 'skip'
  );
  const streamingMessage = useQuery(
    api.queries.getStreamingMessage,
    isSignedIn && conversationId ? { conversationId } : 'skip'
  );

  // Early return for signed-out users - BEFORE any other conditional renders
  // This prevents "Loading..." state and hides ChatInput entirely
  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <Header title="Chat" leftComponent={leftComponent} />
        <View style={styles.loadingContainer}>
          <ThemedText>Sign in to view your conversations</ThemedText>
        </View>
        {/* NO ChatInput rendered - signed-out users can't compose on existing chats */}
      </View>
    );
  }

  // Rest of component continues for signed-in users only...
  ```

  **Drawer Profile Handling**:

  ```typescript
  // Only render profile button when signed in
  {isSignedIn && (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push('/screens/profile')}
      style={styles.profileButton}>
      {/* ... profile content ... */}
    </TouchableOpacity>
  )}
  ```

  **WHY This Is Critical**:
  - `getUserCredits` throws `ConvexError('User not authenticated')` when signed out
  - Without skipping, the app will crash/redbox immediately after removing auth gate
  - Conversation queries return `null` for unauth users, causing infinite "Loading..."
  - Profile button accesses `user?.emailAddresses` which is undefined when signed out

  **Acceptance Criteria**:

  **Manual Verification (using Expo):**
  - [ ] Sign out completely
  - [ ] Navigate to home screen → No Convex errors in console
  - [ ] Credits display shows "---" or is hidden (no error)
  - [ ] Navigate to conversations tab (`(tabs)/index.tsx`) → No Convex errors
  - [ ] Tap "New Conversation" FAB when signed out → Shows auth modal
  - [ ] Navigate to images tab (`(tabs)/images/index.tsx`) → No Convex errors
  - [ ] Enter prompt and tap "Generate" when signed out → Shows auth modal, prompt preserved
  - [ ] Try to navigate to chat/[id] → Shows "Sign in to view" message (not infinite loading)
  - [ ] Open drawer → Profile button is HIDDEN (not rendered when signed out)
  - [ ] No redbox errors anywhere in the app when signed out
  - [ ] Run: `npx expo start` and check Metro console for errors
  - [ ] Expected: No "User not authenticated" Convex errors

  **Commit**: YES
  - Message: `feat(auth): handle unauthenticated UI state for queries and profile`
  - Files: `app/(app)/(drawer)/index.tsx`, `app/(app)/(drawer)/(tabs)/index.tsx`, `app/(app)/(drawer)/(tabs)/images/index.tsx`, `app/(app)/(drawer)/(tabs)/chat/[id].tsx`, `components/ui/CustomDrawerContent.tsx`

---

- [ ] 4A. Wire AuthModalProvider (Keep Auth Gate)

  **What to do**:
  - Modify `app/(app)/_layout.tsx`
  - Import `AuthModalProvider` from `@/contexts/AuthModalContext`
  - Import `AuthModal` from `@/components/auth/AuthModal`
  - Wrap `<Slot />` with `<AuthModalProvider>`
  - Render `<AuthModal />` inside the provider
  - **KEEP the auth gate** (signed-out users still redirect to auth - this is intentional for safe sequencing)

  **WHY keep the gate**: Task 3 will add unauth UI hardening. Until that's done, letting signed-out users into the app would cause Convex errors. This task ONLY enables `useAuthModal()` to be used.

  **Must NOT do**:
  - Remove the auth gate (that's Task 4B)
  - Remove the `isLoaded` loading state

  **Parallelizable**: NO (critical path - must complete before Task 3)

  **References**:

  **File to Modify**:
  - `app/(app)/_layout.tsx:1-28` - Full file (only 28 lines)

  **Context to Add**:
  - `contexts/AuthModalContext.tsx` (from Task 1) - Import `AuthModalProvider`
  - `components/auth/AuthModal.tsx` (from Task 2) - Import `AuthModal`

  **End State Structure (AFTER 4A, auth gate STILL present)**:

  ```typescript
  export default function AppLayout() {
    const { isLoaded, isSignedIn } = useAuth();
    const { theme } = useUnistyles();

    if (!isLoaded) {
      return (/* loading spinner */);
    }

    // Auth gate STILL HERE - will be removed in Task 4B after Task 3 completes
    if (!isSignedIn) return <Redirect href="/(auth)/continue" />;

    return (
      <AuthModalProvider>
        <Slot />
        <AuthModal />
      </AuthModalProvider>
    );
  }
  ```

  **Integration Point (IMPORTANT)**:
  After completing this task, `useAuthModal()` is safe to import and use anywhere under `app/(app)/`.
  This includes: `app/(app)/(drawer)/index.tsx`, `app/(app)/(drawer)/(tabs)/*`, `components/ui/CustomDrawerContent.tsx`, etc.

  **Acceptance Criteria**:

  **Manual Verification (using Expo):**
  - [ ] Start app: `npx expo start` while signed in
  - [ ] No "useAuthModal must be used within AuthModalProvider" errors
  - [ ] Run: `npx tsc --noEmit` - No TypeScript errors
  - [ ] Signed-out users STILL redirect to auth (gate is still active)

  **Commit**: YES
  - Message: `feat(auth): wire AuthModalProvider (keep auth gate for safe sequencing)`
  - Files: `app/(app)/_layout.tsx`

  **Provider Placement Sanity Check (IMPORTANT)**:
  After completing Task 4A, `AuthModalProvider` is mounted in `app/(app)/_layout.tsx`.
  This means `useAuthModal()` is available to ALL components rendered under `app/(app)/`:
  - ✅ `app/(app)/(drawer)/index.tsx` - home screen
  - ✅ `app/(app)/(drawer)/(tabs)/index.tsx` - conversations tab
  - ✅ `app/(app)/(drawer)/(tabs)/images/index.tsx` - images tab
  - ✅ `app/(app)/(drawer)/(tabs)/chat/[id].tsx` - chat screen
  - ✅ `components/ui/CustomDrawerContent.tsx` - drawer (rendered inside `app/(app)/(drawer)/_layout.tsx`)
    All files modified in Tasks 3, 5, 6, 7 are under this tree. No "must be used within AuthModalProvider" errors will occur.

---

- [ ] 4B. Remove Auth Gate (After Task 3 Unauth UI Hardening)

  **What to do**:
  - Modify `app/(app)/_layout.tsx`
  - Remove line 24: `if (!isSignedIn) return <Redirect href="/(auth)/continue" />;`
  - Keep the `isLoaded` check (prevents rendering before Clerk initializes)
  - Remove `isSignedIn` from the `useAuth()` destructure (no longer needed)

  **WHY this is safe NOW**: Task 3 has hardened the unauth UI state (skip queries, handle nulls). Signed-out users can now enter without causing Convex errors.

  **Must NOT do**:
  - Remove the `isLoaded` loading state (still needed)
  - Change the loading indicator styling

  **Parallelizable**: NO (must wait for Task 3 to complete)

  **References**:

  **File to Modify**:
  - `app/(app)/_layout.tsx:24` - The auth gate redirect line

  **End State Structure (AFTER 4B, gate removed)**:

  ```typescript
  export default function AppLayout() {
    const { isLoaded } = useAuth();  // isSignedIn no longer needed
    const { theme } = useUnistyles();

    if (!isLoaded) {
      return (/* loading spinner */);
    }

    // NO auth gate - unauthenticated users can enter (safe because Task 3 hardened UI)
    return (
      <AuthModalProvider>
        <Slot />
        <AuthModal />
      </AuthModalProvider>
    );
  }
  ```

  **Acceptance Criteria**:

  **Manual Verification (using Expo):**
  - [ ] Start app: `npx expo start`
  - [ ] Kill app completely and restart (clear any cached auth state)
  - [ ] Expected: App opens directly to chat interface (no redirect to auth)
  - [ ] Verify: User can see chat UI without signing in
  - [ ] Verify: NO Convex "User not authenticated" errors (Task 3 handles this)
  - [ ] Screenshot evidence: Chat interface visible without signing in

  **Commit**: YES
  - Message: `feat(auth): remove auth gate, allow unauthenticated access`
  - Files: `app/(app)/_layout.tsx`

---

- [ ] 5. Add Sign-in Button to Drawer

  **What to do**:

  **DrawerProvider Already Wired**: `DrawerProvider` is already mounted in `app/_layout.tsx:36-38`, which wraps the entire app. This means `useDrawer()` is already available in `CustomDrawerContent`. **NO additional provider wiring needed.**

  **Modify CustomDrawerContent**
  - Modify `components/ui/CustomDrawerContent.tsx`
  - Add "Sign in" button that appears when `!isSignedIn`
  - Position it where "Sign out" currently is (inverse condition)
  - On press: call `showAuthModal()` from AuthModalContext
  - Close drawer when opening modal using `useDrawer().closeDrawer()`
  - Use `LogIn` icon (opposite of LogOut)

  **Must NOT do**:
  - Navigate to auth screen
  - Change the Sign out button behavior (except redirect - see Task 8)
  - Modify other drawer items

  **Parallelizable**: NO (depends on Task 2)

  **References**:

  **File to Modify**:
  - `components/ui/CustomDrawerContent.tsx:114-123` - Add Sign in button

  **Pattern References**:
  - `components/ui/CustomDrawerContent.tsx:114-123` - Existing "Sign out" conditional block
  - `components/ui/CustomDrawerContent.tsx:24` - `isSignedIn` from `useUser()`
  - `components/ui/CustomDrawerContent.tsx:104-111` - NavItem structure for "New chat"

  **Context References**:
  - `contexts/AuthModalContext.tsx` (from Task 1) - Import `useAuthModal`
  - `app/contexts/DrawerContext.tsx:35-43` - Import `useDrawer` to close drawer (already available - `DrawerProvider` mounted in `app/_layout.tsx:36-38`)

  **Icon Reference**:
  - `components/ui/Icon.tsx` - Uses lucide-react-native, "LogIn" is available

  **Code to Add to CustomDrawerContent (after line 111, before the Sign out block)**:

  ```typescript
  {!isSignedIn && (
    <TouchableOpacity
      onPress={() => {
        closeDrawer();
        showAuthModal();
      }}
      style={styles.navItem}
    >
      <View style={styles.navIconContainer}>
        <Icon name="LogIn" size={18} />
      </View>
      <View style={styles.navContent}>
        <ThemedText style={styles.navLabel}>Sign in</ThemedText>
      </View>
    </TouchableOpacity>
  )}
  ```

  **WHY Each Reference Matters**:
  - Line 114-123 shows exact pattern: `{isSignedIn && (...)}`
  - We add inverse: `{!isSignedIn && (...)}`
  - Use same TouchableOpacity + Icon + ThemedText structure
  - Close drawer before showing modal to avoid overlapping UI
  - `useDrawer()` works because `DrawerProvider` is already in `app/_layout.tsx:36-38`

  **Acceptance Criteria**:

  **Manual Verification (using Expo):**
  - [ ] Start app: `npx expo start` (ensure signed out - gate removed in Task 4B)
  - [ ] Open drawer
  - [ ] Verify: "Sign in" button visible (with LogIn icon)
  - [ ] Verify: "Sign out" button NOT visible
  - [ ] Tap "Sign in" → Drawer closes → Auth modal appears
  - [ ] **Verify drawer actually closed** (not just overlapped by modal)
  - [ ] Sign in via OAuth → Modal closes → Drawer now shows "Sign out"

  **Commit**: YES
  - Message: `feat(auth): add sign-in button to drawer menu`
  - Files: `components/ui/CustomDrawerContent.tsx`

---

- [ ] 6. Intercept Send on Home Screen

  **What to do**:
  - Modify `app/(app)/(drawer)/index.tsx`
  - Import `useAuth` from Clerk and `useAuthModal` from context
  - Modify `handleSendMessage` to:
    1. Check `isSignedIn` at the START of the function
    2. If not signed in: call `showAuthModal()` and return `false`
    3. If signed in: proceed with existing logic and return `true`
  - Update return type to `Promise<boolean>`

  **Must NOT do**:
  - Auto-send after successful auth
  - Modify the mutation call itself
  - Change anything else about message sending logic

  **Parallelizable**: YES (with Task 7)

  **References**:

  **File to Modify**:
  - `app/(app)/(drawer)/index.tsx:96` - `const sendMessage = useMutation(api.messages.send);`
  - `app/(app)/(drawer)/index.tsx:142-170` - `handleSendMessage` function

  **Current Code (line 142-170)**:

  ```typescript
  const handleSendMessage = useCallback(
    async (text: string, _images?: string[]) => {
      if (!text.trim() || !selectedModelId) return;
      // ... rest of function
    },
    [conversationId, selectedModelId, createConversation, sendMessage, scrollToEnd]
  );
  ```

  **Should Become**:

  ```typescript
  const handleSendMessage = useCallback(
    async (text: string, _images?: string[]): Promise<boolean> => {
      // Auth check FIRST - before any other validation
      if (!isSignedIn) {
        showAuthModal();
        return false; // Signal to ChatInput: don't clear input
      }

      if (!text.trim() || !selectedModelId) return false;

      try {
        // ... existing conversation/send logic ...
        return true; // Signal to ChatInput: clear input
      } catch (error) {
        // Handle session expiry: if mutation fails due to auth, show modal
        // This covers the edge case where isSignedIn is stale (session expired mid-conversation)
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Exact match for Convex auth errors (verified from convex/*.ts):
        // - convex/messages.ts:84 throws Error('User not authenticated')
        // - convex/conversations.ts:49,213 throws Error('User not authenticated')
        // - convex/queries.ts:111 throws ConvexError('User not authenticated')
        if (errorMessage.includes('User not authenticated')) {
          console.warn('Session expired, showing auth modal');
          showAuthModal();
        } else {
          console.error('Failed to send message:', error);
        }
        return false; // Input preserved in all error cases
      }
    },
    [
      isSignedIn,
      showAuthModal,
      conversationId,
      selectedModelId,
      createConversation,
      sendMessage,
      scrollToEnd,
    ]
  );
  ```

  **Session Expiry Handling (IMPORTANT)**:
  - The `isSignedIn` check at the start handles the common case (user not logged in)
  - The catch block handles the edge case: session expired AFTER the `isSignedIn` check passed
  - Error detection: Convex throws errors containing "not authenticated" or "Unauthenticated"
  - When detected: show auth modal, return false (preserves input)
  - User re-authenticates, taps Send again, message goes through

  **Context References**:
  - `contexts/AuthModalContext.tsx` (from Task 1) - Import `useAuthModal`
  - `@clerk/clerk-expo` - Import `useAuth` for `isSignedIn`

  **WHY Each Reference Matters**:
  - Line 142-170 is where message sending happens
  - Auth check at START means modal shows before any other processing
  - Returning `false` tells ChatInput to preserve the input
  - Returning `true` tells ChatInput to clear the input

  **Acceptance Criteria**:

  **Manual Verification (using Expo):**
  - [ ] Start app: `npx expo start` (ensure signed out)
  - [ ] Type message: "Hello world"
  - [ ] Tap Send button
  - [ ] Expected: Auth modal appears
  - [ ] Verify: Message input STILL shows "Hello world" (NOT cleared)
  - [ ] Tap X to close modal
  - [ ] Verify: Message input STILL shows "Hello world"
  - [ ] Sign in via modal
  - [ ] Verify: Modal closes, message still in input, user still on home screen
  - [ ] Tap Send again
  - [ ] Expected: Message sends successfully, input clears

  **Commit**: YES
  - Message: `feat(auth): require sign-in to send messages on home screen`
  - Files: `app/(app)/(drawer)/index.tsx`

---

- [ ] 7. Intercept Send on Chat Screen (Session Expiry Handling)

  **What to do**:
  - Modify `app/(app)/(drawer)/(tabs)/chat/[id].tsx`
  - Same pattern as Task 6
  - Import `useAuth` and `useAuthModal`
  - Modify `handleSendMessage` to check `isSignedIn` first
  - Return `Promise<boolean>` - false if auth needed, true if sent
  - **Include session expiry handling in catch block** (same as Task 6)

  **IMPORTANT CONTEXT**:
  Task 3 Part B already handles the "completely signed out" case on this screen by showing "Sign in to view your conversations" and NOT rendering `ChatInput`. So a fully signed-out user will never reach the send handler.

  This task's auth interception serves TWO purposes:
  1. **Session expiry**: User is signed in, viewing conversation, session expires mid-typing. The `isSignedIn` check or catch block will show the auth modal.
  2. **Consistency**: Same code pattern as Task 6, so both screens handle auth uniformly.

  **Must NOT do**:
  - Auto-send after auth
  - Modify mutation logic

  **Parallelizable**: YES (with Task 6)

  **References**:

  **File to Modify**:
  - `app/(app)/(drawer)/(tabs)/chat/[id].tsx:88` - `const sendMessage = useMutation(api.messages.send);`
  - `app/(app)/(drawer)/(tabs)/chat/[id].tsx:104-115` - `handleSendMessage` function

  **Pattern to Follow** (identical to Task 6):
  - Auth check at start → showAuthModal() → return false
  - Success → return true
  - **Catch block**: detect auth errors ("not authenticated", "Unauthenticated", "session") → showAuthModal() → return false

  **Session Expiry Handling** (same pattern as Task 6):

  ```typescript
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    // Exact match for Convex auth errors (verified from convex/*.ts):
    // - convex/messages.ts:84 throws Error('User not authenticated')
    // - convex/conversations.ts:49,213 throws Error('User not authenticated')
    if (errorMessage.includes('User not authenticated')) {
      console.warn('Session expired, showing auth modal');
      showAuthModal();
    } else {
      console.error('Failed to send message:', error);
    }
    return false; // Input preserved
  }
  ```

  **WHY Each Reference Matters**:
  - Line 104-115 is the chat screen's send handler
  - Same auth check pattern ensures consistent UX across screens
  - Session expiry handling covers edge case where token expires mid-conversation

  **Acceptance Criteria**:

  **Manual Verification (using Expo):**

  _Scenario 1: Direct signed-out access (handled by Task 3)_
  - [ ] Start app signed out
  - [ ] Try to navigate to `/chat/[id]` directly (e.g., deep link or manual URL)
  - [ ] Expected: "Sign in to view your conversations" message (NO ChatInput, NO send button)

  _Scenario 2: Session expiry during active conversation_
  - [ ] Start app: `npx expo start`
  - [ ] Sign in and navigate to an existing conversation
  - [ ] Type message: "Test message" (do NOT send yet)
  - [ ] **Simulate session expiry**: Sign out via drawer, then navigate BACK to the conversation
  - [ ] Screen now shows "Sign in to view" (from Task 3) - this is expected
  - [ ] Verify: Code path exists for session expiry (review code - auth check + catch block are in place)

  _Scenario 3: Verify code changes_
  - [ ] Run: `npx tsc --noEmit` - No TypeScript errors
  - [ ] Review: `handleSendMessage` returns `Promise<boolean>` with auth check + catch block

  **Commit**: YES
  - Message: `feat(auth): add auth interception to chat screen send handler`
  - Files: `app/(app)/(drawer)/(tabs)/chat/[id].tsx`

---

- [ ] 8. Delete Old Auth Screens, Components, and Entire Auth Directory

  **What to do**:

  **Part A: Delete Entire app/(auth) Directory**
  - Delete `app/(auth)/` directory entirely (including `_layout.tsx`)
  - OAuth callback (`luna://oauth-callback`) is handled by `expo-auth-session` via `WebBrowser.maybeCompleteAuthSession()` - NO route needed
  - Files deleted:
    - `app/(auth)/_layout.tsx`
    - `app/(auth)/continue.tsx`
    - `app/(auth)/login.tsx`
    - `app/(auth)/signup.tsx`

  **Part B: Delete Other Files**
  - Delete `app/screens/forgot-password.tsx` (email/password only, not needed)
  - Delete unused auth components from `components/auth/`:
    - `AuthContainer.tsx`
    - `AuthHeader.tsx`
    - `AuthDivider.tsx`

  **Part C: Update CustomDrawerContent.tsx Sign-out**
  - Modify `handleSignOut` (line 70-77)
  - Remove `router.replace('/(auth)/login')` - that screen no longer exists
  - Just call `signOut()` - user stays in app as unauthenticated
  - Updated code:
    ```typescript
    const handleSignOut = async () => {
      try {
        await signOut();
        // Stay in app - unauthenticated access is now allowed
        // No navigation needed
      } catch (err) {
        Alert.alert('Error', 'Failed to sign out. Please try again.');
      }
    };
    ```

  **Must NOT do**:
  - Delete `SignInWith.tsx` (used by AuthModal)
  - Delete `AuthModal.tsx` (just created)

  **Parallelizable**: NO (cleanup after features work)

  **References**:

  **Files/Directories to Delete**:
  - `app/(auth)/` - Entire directory (OAuth callback handled by expo-auth-session, not a route)
  - `app/screens/forgot-password.tsx` - Password reset (email-only feature)
  - `components/auth/AuthContainer.tsx` - Email auth container
  - `components/auth/AuthDivider.tsx` - "or" divider
  - `components/auth/AuthHeader.tsx` - Email auth header (if exists)

  **Files to Modify**:
  - `components/ui/CustomDrawerContent.tsx:70-77` - Remove redirect from sign-out

  **Files to KEEP**:
  - `components/auth/SignInWith.tsx` - Used by AuthModal
  - `components/auth/AuthModal.tsx` - The new auth UI

  **PRE-CLEANUP CHECKLIST (verify these exist BEFORE starting)**:
  Run `grep -rn "/(auth)/" --include="*.tsx" . | grep -v node_modules` to find all current references:
  - [ ] `app/(app)/_layout.tsx:24` - Auth gate redirect → **Removed in Task 4B**
  - [ ] `app/screens/forgot-password.tsx:81` - Link to login → **Delete entire file**
  - [ ] `components/ui/CustomDrawerContent.tsx:73` - Sign-out redirect → **Remove in Part C**
  - [ ] `components/auth/SignInWith.tsx:59` - Stale comment → **Update comment**
  - [ ] `app/(auth)/*.tsx` - Auth screens → **Delete entire directory**

  **POST-CLEANUP VERIFICATION**:
  After completing this task, run `grep -rn "/(auth)/" --include="*.tsx" . | grep -v node_modules | grep -v ".sisyphus"`.
  Expected: **Zero results**. All references removed.

  **Why Delete app/(auth)/ Entirely**:
  - OAuth callback (`luna://oauth-callback`) is NOT handled by Expo Router
  - It's handled by `WebBrowser.maybeCompleteAuthSession()` at `SignInWith.tsx:21`
  - This intercepts the deep link and resolves the `startSSOFlow()` promise
  - No route file is needed - the directory serves no purpose after removing email/password auth

  **WHY Each Reference Matters**:
  - Old screens are no longer used - modal is the only auth path
  - Forgot-password is email-only feature - not needed for OAuth
  - Sign-out must not redirect to deleted screens

  **Acceptance Criteria**:

  **Manual Verification:**
  - [ ] Run: `ls app/(auth)/ 2>/dev/null || echo "Directory deleted"`
  - [ ] Expected: "Directory deleted"
  - [ ] Run: `ls components/auth/`
  - [ ] Expected: Only `SignInWith.tsx` and `AuthModal.tsx` remain
  - [ ] Run: `ls app/screens/`
  - [ ] Expected: `forgot-password.tsx` is gone (only `help.tsx` and `profile.tsx` remain)
  - [ ] Run: `npx tsc --noEmit`
  - [ ] Expected: No TypeScript errors
  - [ ] Run: `grep -rn "/(auth)/" --include="*.tsx" . | grep -v node_modules | grep -v ".sisyphus"`
  - [ ] Expected: No results (all references removed)
  - [ ] Test: Sign out → User stays in app (no redirect, no error)
  - [ ] Test: OAuth flow completes successfully (callback handled by expo-auth-session, no 404)

  **Commit**: YES
  - Message: `refactor(auth): remove email/password auth and entire (auth) directory`
  - Files: Multiple deletions and modifications

---

- [ ] 9. Document Clerk Dashboard OAuth Setup

  **What to do**:
  - Create `CLERK_OAUTH_SETUP.md` in project root
  - Document step-by-step Clerk Dashboard configuration for workspace "luna":
    1. Enable Google OAuth in Social Connections
    2. Enable Apple OAuth in Social Connections
    3. Add redirect URIs for development and production
    4. Google Cloud Console setup (Client ID/Secret)
    5. Apple Developer setup (Team ID, Key ID, Private Key)
  - Include redirect URI format: `luna://oauth-callback`
  - Include Expo dev redirect format
  - Add troubleshooting section

  **Must NOT do**:
  - Include actual credentials
  - Make this overly complex

  **Parallelizable**: NO (final task)

  **References**:

  **Documentation Sources**:
  - `app.json:8` - App scheme configuration (`"scheme": "luna"`)
  - `components/auth/SignInWith.tsx:47-50` - Redirect URI generation code

  **Redirect URI Generation (from SignInWith.tsx)**:

  ```typescript
  const redirectUrl = AuthSession.makeRedirectUri({
    scheme: 'luna',
    path: 'oauth-callback',
  });
  ```

  **WHY Each Reference Matters**:
  - Redirect URI must match what's in SignInWith.tsx
  - Clerk workspace is "luna" (not "cloudy.zip")

  **Acceptance Criteria**:

  **Manual Verification:**
  - [ ] File created: `CLERK_OAUTH_SETUP.md`
  - [ ] Contains: Clerk workspace name "luna"
  - [ ] Contains: Google OAuth setup steps
  - [ ] Contains: Apple OAuth setup steps
  - [ ] Contains: Redirect URI `luna://oauth-callback`
  - [ ] Contains: Troubleshooting section
  - [ ] No actual credentials included

  **Commit**: YES
  - Message: `docs: add Clerk OAuth setup guide`
  - Files: `CLERK_OAUTH_SETUP.md`

---

## Commit Strategy

| After Task | Message                                                                   | Files                                                                                 | Verification                            |
| ---------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------- |
| 1          | `feat(auth): add AuthModalContext for deferred sign-in`                   | contexts/AuthModalContext.tsx                                                         | tsc --noEmit                            |
| 2          | `feat(auth): add onSuccess prop to SignInWith, create AuthModal`          | SignInWith.tsx, AuthModal.tsx                                                         | Manual: modal renders                   |
| 2.5        | `refactor(chat): make ChatInput.onSendMessage async with success/failure` | ChatInput.tsx, index.tsx, chat/[id].tsx                                               | npx tsc --noEmit (project-wide)         |
| 4A         | `feat(auth): wire AuthModalProvider (keep auth gate)`                     | app/(app)/\_layout.tsx                                                                | No redbox, signed out still redirects   |
| 3          | `feat(auth): handle unauthenticated UI state`                             | index.tsx, (tabs)/index.tsx, images/index.tsx, chat/[id].tsx, CustomDrawerContent.tsx | Manual: code review (gate still active) |
| 4B         | `feat(auth): remove auth gate, allow unauthenticated access`              | app/(app)/\_layout.tsx                                                                | Manual: app opens without auth          |
| 5          | `feat(auth): add sign-in button to drawer menu`                           | CustomDrawerContent.tsx                                                               | Manual: drawer button works             |
| 6          | `feat(auth): require sign-in to send messages on home screen`             | index.tsx                                                                             | Manual: modal on send, input preserved  |
| 7          | `feat(auth): add auth interception to chat screen send handler`           | chat/[id].tsx                                                                         | Code review: auth check + catch block   |
| 8          | `refactor(auth): remove email/password auth and (auth) directory`         | Multiple                                                                              | tsc --noEmit, grep check                |
| 9          | `docs: add Clerk OAuth setup guide`                                       | CLERK_OAUTH_SETUP.md                                                                  | File exists                             |

---

## Success Criteria

### Verification Commands

```bash
npx tsc --noEmit          # Expected: No errors
npx expo start            # Expected: App launches
npm run lint              # Expected: No new errors
grep -rn "/(auth)/login\|/(auth)/signup" --include="*.tsx" . | grep -v node_modules  # Expected: No results
```

### Final Checklist

- [ ] Unauthenticated user can see app (no redirect)
- [ ] Unauthenticated user can type message
- [ ] Tapping Send shows auth modal (not navigation)
- [ ] **Message input preserved when modal appears**
- [ ] Auth modal has Google + Apple buttons
- [ ] Successful OAuth closes modal (no navigation away)
- [ ] **User stays on same screen after OAuth** (not redirected to drawer root)
- [ ] **OAuth callback completes successfully** (no 404/blank screen - handled by expo-auth-session)
- [ ] Message input preserved after auth
- [ ] User taps Send again to send message
- [ ] Drawer shows "Sign in" when logged out
- [ ] Drawer shows "Sign out" when logged in
- [ ] Sign out stays in app (doesn't redirect to deleted screen)
- [ ] Entire `app/(auth)/` directory deleted
- [ ] Forgot-password screen deleted
- [ ] No TypeScript errors
- [ ] No broken route references

### Edge Cases Verified

- [ ] OAuth cancellation returns to chat (no error), input preserved
- [ ] Rapid Send taps don't show multiple modals (idempotent `showAuthModal`)
- [ ] Session expiry mid-conversation shows modal, input preserved
  - **Implementation**: Tasks 6 & 7 catch blocks detect `'User not authenticated'` (exact error string from Convex) and call `showAuthModal()`
  - **Verification**: Hard to test manually (requires waiting for session timeout), but code path exists
- [ ] OAuth callback deep link (`luna://oauth-callback`) works correctly after deleting `app/(auth)/` directory

---

## Clerk Dashboard Setup (Required Before Testing OAuth)

**Before testing OAuth flows, you must configure Clerk Dashboard:**

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com) → **luna** workspace
2. **Social Connections** → Enable Google OAuth
3. **Social Connections** → Enable Apple OAuth
4. Add redirect URIs:
   - Production: `luna://oauth-callback`
   - Development: Check console when running `npx expo start` for the exp:// URL
5. Add Google OAuth credentials (from Google Cloud Console)
6. Add Apple OAuth credentials (from Apple Developer Console)

**See `CLERK_OAUTH_SETUP.md` (created in Task 9) for detailed instructions.**
