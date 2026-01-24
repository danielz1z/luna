# Luna Frontend Wiring - ACTUAL Work Needed

## Context

### The Problem

The previous plan claimed the frontend was "wired up and ready for testing." This was FALSE.

**Reality:**

- Backend Convex functions exist and are deployed ✅
- vLLM endpoint is deployed and working ✅
- Frontend SCREENS exist but are NOT CONNECTED to the backend ❌

### What's Actually Broken

1. **No Auth Gate** - App doesn't redirect to login when not signed in
2. **Navigation Broken** - Default route goes to mockup, not conversations
3. **ChatInput Not Wired** - Home screen input does nothing
4. **Drawer Links Wrong** - "New chat" goes to mockup, not creating real conversation
5. **Model Selector Missing** - No way to select a model when creating conversation

---

## Work Objectives

### Core Objective

Wire the frontend to the backend so users can actually:

1. Sign up / Log in
2. See their conversations
3. Create new conversations with model selection
4. Chat with streaming responses
5. See their credits

### Definition of Done

- [ ] Unauthenticated users are redirected to login screen
- [ ] After login, users land on conversations list
- [ ] Users can create new conversation with model picker
- [ ] Users can send messages and see streaming responses
- [ ] Credits display updates in real-time

---

## TODOs

### Task 1: Add Auth Gate

**What to do:**

- Modify `app/_layout.tsx` to check authentication status
- Redirect to `/screens/login` if not signed in
- Redirect to `/(drawer)/(tabs)` if signed in and on auth screen
- Show loading spinner while checking auth

**Files to modify:**

- `app/_layout.tsx`

**Code Changes:**

```tsx
// Add to imports
import { useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

// Add AuthGate component
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { theme } = useUnistyles();

  useEffect(() => {
    if (!isLoaded) return;

    const isAuthScreen =
      segments[0] === 'screens' && (segments[1] === 'login' || segments[1] === 'signup');

    if (!isSignedIn && !isAuthScreen) {
      router.replace('/screens/login');
    } else if (isSignedIn && isAuthScreen) {
      router.replace('/(drawer)/(tabs)');
    }
  }, [isSignedIn, isLoaded, segments, router]);

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.colors.primary,
        }}>
        <ActivityIndicator size="large" color={theme.colors.highlight} />
      </View>
    );
  }

  return <>{children}</>;
}

// Wrap Stack with AuthGate in ThemedLayout
function ThemedLayout() {
  const { ThemedStatusBar, screenOptions } = useThemedNavigation();

  return (
    <>
      <ThemedStatusBar />
      <AuthGate>
        <Stack screenOptions={screenOptions}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="screens/login" options={{ headerShown: false }} />
          <Stack.Screen name="screens/signup" options={{ headerShown: false }} />
        </Stack>
      </AuthGate>
    </>
  );
}
```

**Acceptance Criteria:**

- [ ] Opening app when logged out → shows login screen
- [ ] Opening app when logged in → shows conversations list
- [ ] Login success → redirects to conversations
- [ ] Logout → redirects to login

---

### Task 2: Fix Default Navigation

**What to do:**

- Change drawer to show `(tabs)` as the default screen instead of `index`
- Remove or repurpose the AI circle mockup home screen

**Files to modify:**

- `app/(drawer)/_layout.tsx`

**Code Changes:**

```tsx
// In DrawerLayout, change the screen order or set initialRouteName
<Drawer
  initialRouteName="(tabs)"
  screenOptions={{...}}
  drawerContent={(props) => <CustomDrawerContent />}>
  <Drawer.Screen
    name="(tabs)"
    options={{
      title: 'Chats',
      drawerLabel: 'Chats',
    }}
  />
  {/* Keep index for backward compatibility but don't show in drawer */}
  <Drawer.Screen
    name="index"
    options={{
      drawerItemStyle: { display: 'none' },
    }}
  />
</Drawer>
```

**Acceptance Criteria:**

- [ ] App opens to conversations list (not AI circle)
- [ ] Drawer shows "Chats" as primary option

---

### Task 3: Fix Drawer Navigation Links

**What to do:**

- Update "New chat" in drawer to go to conversations and trigger model picker
- Add link to conversations list in drawer
- Fix navigation paths

**Files to modify:**

- `components/ui/CustomDrawerContent.tsx`

**Code Changes:**

```tsx
// Change the navigation section
<View style={styles.navSection}>
  <NavItem href="/(drawer)/(tabs)" icon="MessageCircle" label="Conversations" />
  <NavItem href="/(drawer)/(tabs)?newChat=true" icon="Plus" label="New chat" />
  {isSignedIn && (
    <TouchableOpacity onPress={handleSignOut} style={styles.navItem}>
      <View style={styles.navIconContainer}>
        <Icon name="LogOut" size={18} />
      </View>
      <View style={styles.navContent}>
        <ThemedText style={styles.navLabel}>Sign out</ThemedText>
      </View>
    </TouchableOpacity>
  )}
</View>

// Remove the mockup History links
```

**Acceptance Criteria:**

- [ ] "New chat" in drawer opens model picker on conversations screen
- [ ] "Conversations" link goes to conversations list
- [ ] Mockup screen links removed

---

### Task 4: Handle New Chat from Drawer

**What to do:**

- Update conversations screen to check for `newChat` query param
- Auto-open model picker when `newChat=true`

**Files to modify:**

- `app/(drawer)/(tabs)/index.tsx`

**Code Changes:**

```tsx
// Add to imports
import { useLocalSearchParams } from 'expo-router';

// Inside ConversationsScreen component
const { newChat } = useLocalSearchParams<{ newChat?: string }>();

// Add useEffect to auto-open picker
useEffect(() => {
  if (newChat === 'true' && models && models.length > 0) {
    setSelectedModel(models[0]);
    setShowModelPicker(true);
  }
}, [newChat, models]);
```

**Acceptance Criteria:**

- [ ] Clicking "New chat" in drawer opens model picker
- [ ] Can select model and create conversation
- [ ] Navigates to chat screen after creation

---

### Task 5: Add Credits Display to Header

**What to do:**

- Verify credits are displayed in conversations list header
- Add credits to drawer if not present

**Files to verify:**

- `app/(drawer)/(tabs)/index.tsx` - already has credits display ✅

**Current code shows credits:**

```tsx
const rightComponents = [
  <View key="credits" style={styles.creditsContainer}>
    <Icon name="Coins" size={16} color={theme.colors.highlight} />
    <ThemedText style={styles.creditsText}>
      {credits !== undefined ? formatCredits(credits) : '...'}
    </ThemedText>
  </View>,
];
```

**Acceptance Criteria:**

- [ ] Credits visible in header on conversations screen
- [ ] Credits update after sending messages

---

### Task 6: Verify Chat Screen Works

**What to do:**

- Verify chat screen is properly wired to Convex
- Test message sending and streaming

**Files to verify:**

- `app/(drawer)/(tabs)/chat/[id].tsx`

**Current code analysis:**

```tsx
// These are correct:
const conversation = useQuery(api.queries.getConversation, { conversationId });
const streamingMessage = useQuery(api.queries.getStreamingMessage, { conversationId });
const sendMessage = useMutation(api.messages.send);

// handleSendMessage calls the mutation - looks correct
const handleSendMessage = useCallback(
  async (text: string) => {
    if (!text.trim()) return;
    try {
      await sendMessage({ conversationId, content: text });
      scrollToEnd();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  },
  [conversationId, sendMessage, scrollToEnd]
);
```

This looks correctly wired. The issue is getting TO this screen.

**Acceptance Criteria:**

- [ ] Can navigate to chat screen from conversation list
- [ ] Messages send successfully
- [ ] Streaming responses appear
- [ ] Credits deducted after response

---

### Task 7: Clean Up Mockup Screens (Optional)

**What to do:**

- Remove or repurpose unused mockup screens
- Clean up drawer history links

**Files to consider:**

- `app/(drawer)/index.tsx` - AI circle mockup
- `app/(drawer)/suggestions.tsx` - mockup
- `app/(drawer)/results.tsx` - mockup
- `app/(drawer)/lottie.tsx` - mockup

**Acceptance Criteria:**

- [ ] No broken links in drawer
- [ ] No unused screens accessible

---

## Verification Strategy

### Manual Testing Flow

After implementing all tasks, test this flow:

1. **Fresh App Start (logged out)**
   - Open app → should see login screen
   - No way to access main app without logging in

2. **Sign Up Flow**
   - Tap "Sign up" → signup screen
   - Enter email, password
   - Verify email with code
   - Should redirect to conversations list
   - Should have 1000 credits

3. **Create Conversation**
   - Tap "+" FAB or "New chat" in drawer
   - Model picker opens
   - Select "Llama 3 8B Abliterated"
   - Tap "Start Conversation"
   - Should navigate to chat screen

4. **Send Message**
   - Type message in chat input
   - Tap send
   - Should see user message appear
   - Should see typing indicator
   - Should see streaming assistant response
   - Credits should decrease

5. **Return to Conversations**
   - Tap back or open drawer
   - Should see conversation in list
   - Tap conversation to return to chat

---

## Commit Strategy

| After Task | Message                                   | Files                                   |
| ---------- | ----------------------------------------- | --------------------------------------- |
| 1          | `feat(auth): add auth gate with redirect` | `app/_layout.tsx`                       |
| 2          | `fix(nav): set tabs as default route`     | `app/(drawer)/_layout.tsx`              |
| 3          | `fix(drawer): update navigation links`    | `components/ui/CustomDrawerContent.tsx` |
| 4          | `feat(chat): handle new chat from drawer` | `app/(drawer)/(tabs)/index.tsx`         |
| 7          | `chore: remove unused mockup screens`     | Multiple files                          |

---

## Summary

**Total Tasks:** 7 (6 required, 1 optional cleanup)

**Estimated Time:** 1-2 hours

**Critical Path:**

1. Auth gate (Task 1) - MUST be done first
2. Navigation fix (Task 2) - Required for usable app
3. Drawer links (Task 3) - Required for navigation
4. New chat handling (Task 4) - Required for creating conversations

**The app will be testable after Tasks 1-4 are complete.**
