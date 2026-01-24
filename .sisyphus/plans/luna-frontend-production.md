# Luna Frontend Production - Wire Up Mock Home

## Executive Summary

**Goal:** Take the existing mock-home.tsx and make it fully functional. The main screen stays exactly as designed - AiCircle + ChatInput. When user sends first message, AiCircle fades out and messages appear. Sidebar shows conversation history like ChatGPT/Claude/Gemini.

**Effort:** 1-2 days (estimated 8-16 hours)

---

## Context

### What We're Building

```
FRESH STATE (no messages):              ACTIVE CHAT (after first message):
┌─────────────────────────────┐         ┌─────────────────────────────┐
│  ≡  Luna.        [Llama 3] │         │  ≡  Luna.        [Llama 3] │
├─────────────────────────────┤         ├─────────────────────────────┤
│                             │         │                             │
│            ◯                │         │  ┌─────────────────────┐   │
│           Luna              │         │  │ How do I make pasta │   │ ← user
│        (AiCircle)           │         │  └─────────────────────┘   │
│                             │         │  ┌─────────────────────┐   │
│                             │         │  │ Here's a simple...  │   │ ← assistant
│                             │         │  │ ● ● ●               │   │ ← typing
│                             │         │  └─────────────────────┘   │
├─────────────────────────────┤         ├─────────────────────────────┤
│  [ Ask me anything...  ➤ ]  │         │  [ Ask me anything...  ➤ ]  │
└─────────────────────────────┘         └─────────────────────────────┘

SIDEBAR (swipe or tap ≡):
┌─────────────────────────────┐
│  🔍 Search                  │
├─────────────────────────────┤
│  + New chat                 │
│  ⊞ Explore (future)        │
│  ⎋ Sign out                 │
├─────────────────────────────┤
│  Today                      │
│  · How to make pasta        │  ← from Convex
│  · JavaScript help          │
│  Yesterday                  │
│  · Travel planning          │
├─────────────────────────────┤
│  👤 User Name               │
│     user@email.com          │
└─────────────────────────────┘
```

### Current State (Mock)

**File:** `app/(drawer)/index.tsx`

| Component         | Status          | What It Does Now                         |
| ----------------- | --------------- | ---------------------------------------- |
| Header            | ✅ Layout ready | DrawerButton + "Luna." + BotSwitch       |
| BotSwitch         | ❌ Hardcoded    | Shows GPT-4o, Claude 3, Llama 3, Gemini  |
| AiCircle          | ✅ Visual ready | Mic/Pause toggle with Lottie             |
| ChatInput         | ❌ Not wired    | Has onSendMessage prop but not connected |
| Toolbar + button  | ✅ Works        | Opens image picker                       |
| Toolbar Globe     | ❌ No action    | Web search (future)                      |
| Toolbar Telescope | ❌ No action    | Deep research (future)                   |
| Toolbar Mic       | ❌ No action    | Voice input (future)                     |
| Toolbar Send      | ❌ No action    | Needs to send message                    |

**File:** `components/ui/CustomDrawerContent.tsx`

| Component | Status          | What It Does Now        |
| --------- | --------------- | ----------------------- |
| Search    | ❌ No action    | Visual only             |
| New chat  | ❌ Goes to "/"  | Should reset chat state |
| Explore   | ❌ Goes to mock | Future feature          |
| Sign out  | ✅ Works        | Clerk signOut           |
| History   | ❌ Hardcoded    | Shows demo links        |
| Profile   | ✅ Works        | Goes to profile screen  |

### Backend (Ready)

All Convex functions exist and work:

- `api.chat.createConversation` - Create new conversation
- `api.chat.sendMessage` - Send message + stream response
- `api.chat.getConversation` - Get single conversation
- `api.chat.getUserConversations` - List all conversations
- `api.models.getModels` - Get available models
- `api.queries.getUserCredits` - Get user credits

---

## Work Objectives

### Core Objective

Transform mock-home.tsx into a production chat screen where:

1. Fresh state shows AiCircle
2. First message creates conversation, AiCircle fades out, messages appear
3. Responses stream word-by-word
4. Sidebar shows real conversation history
5. "New chat" resets to fresh state

### Definition of Done

- [ ] BotSwitch shows real models from Convex
- [ ] Sending message creates conversation and streams response
- [ ] AiCircle fades out when first message sent
- [ ] Messages display correctly (user right, assistant left)
- [ ] Typing indicator shows during streaming
- [ ] Sidebar shows real conversations from Convex
- [ ] Tapping sidebar conversation loads that chat
- [ ] "New chat" resets to AiCircle state
- [ ] Credits visible and update after messages
- [ ] Auth gate prevents unauthenticated access

---

## TODOs

### Phase 1: Auth Gate

#### Task 1.1: Create Route Groups with Auth Protection

**What to do:**
Restructure app to protect routes. Unauthenticated users go to login.

**Files to create:**

1. `app/(auth)/_layout.tsx`:

```tsx
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

2. `app/(app)/_layout.tsx`:

```tsx
import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Slot } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useUnistyles } from 'react-native-unistyles';

export default function AppLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { theme } = useUnistyles();

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

  if (!isSignedIn) return <Redirect href="/(auth)/login" />;

  return <Slot />;
}
```

3. Move files:
   - `app/screens/login.tsx` → `app/(auth)/login.tsx`
   - `app/screens/signup.tsx` → `app/(auth)/signup.tsx`
   - `app/(drawer)/*` → `app/(app)/(drawer)/*`

4. Update `app/_layout.tsx` to use Slot instead of Stack

**References:**

- `app/_layout.tsx` - Current root layout with providers
- `app/screens/login.tsx` - Existing login screen
- `app/screens/signup.tsx` - Existing signup screen

**Acceptance Criteria:**

- [x] Opening app when not signed in → login screen
- [x] Opening app when signed in → home screen (AiCircle)
- [x] No flicker or redirect loops

---

### Phase 2: Wire Up Home Screen

#### Task 2.1: Wire BotSwitch to Convex Models

**What to do:**
Replace hardcoded models with real models from Convex.

**File to modify:** `components/ui/BotSwitch.tsx`

**Changes:**

```tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export const BotSwitch = ({ selectedModel, onModelSelect }) => {
  const models = useQuery(api.models.getModels);

  // Replace hardcoded modelOptions with:
  const modelOptions =
    models?.map((m) => ({
      label: m.name,
      value: m._id,
      costPerToken: m.costPerToken,
    })) || [];

  // Show loading state if models not loaded
  if (!models) {
    return (
      <View style={styles.trigger}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  // Use selectedModel prop instead of internal state
  // Call onModelSelect(model._id) when selected
};
```

**Props to add:**

- `selectedModel: Id<"models"> | null`
- `onModelSelect: (modelId: Id<"models">) => void`

**References:**

- `convex/models.ts` - getModels query
- `app/(app)/(drawer)/(tabs)/index.tsx:28-45` - Example of using getModels

**Acceptance Criteria:**

- [x] BotSwitch shows models from Convex (Llama 3 8B Abliterated)
- [x] Selecting model updates parent state
- [x] Shows loading indicator while fetching

---

#### Task 2.2: Create Chat State Management for Home Screen

**What to do:**
Add state to home screen to manage current conversation, messages, and chat mode.

**File to modify:** `app/(app)/(drawer)/index.tsx` (was mock-home.tsx)

**State to add:**

```tsx
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';

const HomeScreen = () => {
  // Current conversation (null = fresh state, show AiCircle)
  const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);

  // Selected model
  const [selectedModelId, setSelectedModelId] = useState<Id<"models"> | null>(null);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  // Mutations/Actions
  const createConversation = useMutation(api.chat.createConversation);
  const sendMessage = useAction(api.chat.sendMessage);

  // Get conversation messages if we have one
  const conversation = useQuery(
    api.chat.getConversation,
    conversationId ? { conversationId } : 'skip'
  );

  // Get models to set default
  const models = useQuery(api.models.getModels);

  // Set default model when loaded
  useEffect(() => {
    if (models && models.length > 0 && !selectedModelId) {
      setSelectedModelId(models[0]._id);
    }
  }, [models, selectedModelId]);

  // Determine if we're in fresh state (show AiCircle) or chat state (show messages)
  const isFreshState = !conversationId || !conversation?.messages?.length;
```

**References:**

- `app/(app)/(drawer)/(tabs)/chat/[id].tsx` - Existing chat implementation with streaming
- `convex/chat.ts` - Chat mutations and actions

**Acceptance Criteria:**

- [x] Home screen has conversation state
- [x] Default model selected on load
- [x] Can query conversation messages

---

#### Task 2.3: Implement Send Message Flow

**What to do:**
Wire ChatInput's onSendMessage to create conversation (if needed) and send message.

**File to modify:** `app/(app)/(drawer)/index.tsx`

**Add handler:**

```tsx
const handleSendMessage = async (text: string, images?: string[]) => {
  if (!text.trim() || !selectedModelId) return;

  try {
    let convId = conversationId;

    // Create conversation if this is first message
    if (!convId) {
      convId = await createConversation({
        modelId: selectedModelId,
        title: text.slice(0, 50), // Use first 50 chars as title
      });
      setConversationId(convId);
    }

    // Start streaming
    setIsStreaming(true);
    setStreamingText('');

    // Send message and handle streaming response
    await sendMessage({
      conversationId: convId,
      content: text,
      // images handling if needed
    });

    setIsStreaming(false);
  } catch (error) {
    console.error('Failed to send message:', error);
    setIsStreaming(false);
  }
};

// Pass to ChatInput
<ChatInput onSendMessage={handleSendMessage} />;
```

**References:**

- `app/(app)/(drawer)/(tabs)/chat/[id].tsx:87-130` - Existing sendMessage implementation
- `convex/chat.ts:sendMessage` - Action that handles streaming

**Acceptance Criteria:**

- [x] Typing message and tapping send creates conversation
- [x] Message appears in UI
- [x] Response streams in word-by-word
- [x] Credits deducted after response

---

#### Task 2.4: Add Message List with AiCircle Fade Transition

**What to do:**
Show AiCircle in fresh state, fade it out and show messages when conversation starts.

**File to modify:** `app/(app)/(drawer)/index.tsx`

**Add message list component:**

```tsx
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

// In render:
<View style={styles.center}>
  {isFreshState ? (
    <Animated.View exiting={FadeOut.duration(300)}>
      <AiCircle />
    </Animated.View>
  ) : (
    <Animated.View entering={FadeIn.duration(300)} style={styles.messagesContainer}>
      <FlatList
        data={conversation?.messages || []}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <MessageBubble role={item.role} content={item.content} />}
        inverted
        ListFooterComponent={isStreaming ? <TypingIndicator /> : null}
      />
    </Animated.View>
  )}
</View>;
```

**References:**

- `app/(app)/(drawer)/(tabs)/chat/[id].tsx:200-250` - MessageBubble styling
- `app/(app)/(drawer)/(tabs)/chat/[id].tsx:175-195` - TypingIndicator component

**Acceptance Criteria:**

- [x] AiCircle visible when no messages
- [x] AiCircle fades out when first message sent
- [x] Messages fade in
- [x] Messages styled correctly (user right/blue, assistant left)
- [x] Typing indicator shows during streaming

---

#### Task 2.5: Add Credits Display to Header

**What to do:**
Show user's credits in the header.

**File to modify:** `app/(app)/(drawer)/index.tsx`

**Add to rightComponents:**

```tsx
const credits = useQuery(api.queries.getUserCredits);

const rightComponents = [
  <View key="credits" style={styles.creditsContainer}>
    <Icon name="Coins" size={14} color={theme.colors.highlight} />
    <ThemedText style={styles.creditsText}>
      {credits !== undefined ? credits.toLocaleString() : '...'}
    </ThemedText>
  </View>,
  <BotSwitch key="bot-switch" selectedModel={selectedModelId} onModelSelect={setSelectedModelId} />,
];
```

**References:**

- `convex/queries.ts:getUserCredits` - Credits query

**Acceptance Criteria:**

- [x] Credits visible in header
- [x] Credits update after sending message

---

### Phase 3: Wire Up Sidebar

#### Task 3.1: Show Real Conversations in Sidebar

**What to do:**
Replace hardcoded History with real conversations from Convex.

**File to modify:** `components/ui/CustomDrawerContent.tsx`

**Changes:**

```tsx
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function CustomDrawerContent({ onSelectConversation, onNewChat }) {
  const conversations = useQuery(api.chat.getUserConversations);

  // Group by date
  const groupedConversations = useMemo(() => {
    if (!conversations) return {};

    const groups: Record<string, typeof conversations> = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    conversations.forEach((conv) => {
      const convDate = new Date(conv._creationTime);
      let label = convDate.toLocaleDateString();

      if (convDate.toDateString() === today.toDateString()) {
        label = 'Today';
      } else if (convDate.toDateString() === yesterday.toDateString()) {
        label = 'Yesterday';
      }

      if (!groups[label]) groups[label] = [];
      groups[label].push(conv);
    });

    return groups;
  }, [conversations]);

  // Render grouped conversations instead of History
  {
    Object.entries(groupedConversations).map(([date, convs]) => (
      <View key={date}>
        <ThemedText style={styles.dateHeader}>{date}</ThemedText>
        {convs.map((conv) => (
          <TouchableOpacity
            key={conv._id}
            onPress={() => onSelectConversation(conv._id)}
            style={styles.historyItem}>
            <ThemedText style={styles.historyLink} numberOfLines={1}>
              {conv.title || 'Untitled conversation'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    ));
  }
}
```

**Props to add:**

- `onSelectConversation: (id: Id<"conversations">) => void`
- `onNewChat: () => void`

**References:**

- `convex/chat.ts:getUserConversations` - Query for user's conversations

**Acceptance Criteria:**

- [x] Sidebar shows real conversations from Convex
- [x] Conversations grouped by date (Today, Yesterday, older dates)
- [x] Tapping conversation loads it
- [x] Empty state if no conversations

---

#### Task 3.2: Wire New Chat Button

**What to do:**
Make "New chat" reset to fresh state.

**File to modify:** `components/ui/CustomDrawerContent.tsx`

**Changes:**

```tsx
<NavItem
  icon="Plus"
  label="New chat"
  onPress={() => {
    onNewChat();
    // Close drawer
    router.push('/(app)/(drawer)');
  }}
/>
```

**In home screen, handle new chat:**

```tsx
const handleNewChat = () => {
  setConversationId(null);
  setStreamingText('');
  setIsStreaming(false);
};

// Pass to drawer
<CustomDrawerContent onSelectConversation={setConversationId} onNewChat={handleNewChat} />;
```

**Acceptance Criteria:**

- [x] Tapping "New chat" resets to AiCircle state
- [x] Previous conversation state cleared
- [x] Drawer closes after tapping

---

#### Task 3.3: Wire Search Functionality

**What to do:**
Make search filter conversations.

**File to modify:** `components/ui/CustomDrawerContent.tsx`

**Changes:**

```tsx
const [searchQuery, setSearchQuery] = useState('');

// Filter conversations by search
const filteredConversations = useMemo(() => {
  if (!searchQuery.trim()) return groupedConversations;

  const filtered: Record<string, typeof conversations> = {};
  Object.entries(groupedConversations).forEach(([date, convs]) => {
    const matches = convs.filter(c =>
      c.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (matches.length) filtered[date] = matches;
  });
  return filtered;
}, [groupedConversations, searchQuery]);

// Wire to TextInput
<TextInput
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search"
  ...
/>
```

**Acceptance Criteria:**

- [x] Typing in search filters conversation list
- [x] Matches on conversation title
- [x] Shows "No results" if nothing matches

---

### Phase 4: Polish & Cleanup

#### Task 4.1: Handle Toolbar Buttons (Future Features)

**What to do:**
Add placeholder handlers for toolbar buttons that aren't wired yet.

**File to modify:** `components/ui/ChatInput.tsx`

**Add props for future features:**

```tsx
type ChatInputProps = {
  // ... existing props
  onWebSearch?: () => void; // Globe button
  onDeepResearch?: () => void; // Telescope button
  onVoiceInput?: () => void; // Mic button
};

// Wire buttons with disabled state or coming soon toast
<Pressable
  style={[styles.iconButton, styles.disabledButton]}
  onPress={() => Alert.alert('Coming Soon', 'Web search will be available in a future update')}>
  <Icon name="Globe" size={18} color={theme.colors.subtext} />
</Pressable>;
```

**Buttons to handle:**
| Button | Icon | Status | Placeholder Action |
|--------|------|--------|-------------------|
| Globe | Globe | Future | "Coming Soon" toast |
| Telescope | Telescope | Future | "Coming Soon" toast |
| Mic | Mic | Future | "Coming Soon" toast |
| Camera | Camera | Future | "Coming Soon" toast |
| File | File | Future | "Coming Soon" toast |

**Acceptance Criteria:**

- [x] All toolbar buttons have handlers
- [x] Unimplemented buttons show "Coming Soon"
- [x] Buttons visually indicate disabled state

---

#### Task 4.2: Archive Demo Screens

**What to do:**
Move demo screens to archive folder for future reference.

**Archive location:** `app/_archive/`

**Move commands:**

```bash
mkdir -p app/_archive/drawer
mkdir -p app/_archive/screens

# Demo drawer screens
mv app/(app)/(drawer)/lottie.tsx app/_archive/drawer/
mv app/(app)/(drawer)/results.tsx app/_archive/drawer/
mv app/(app)/(drawer)/suggestions.tsx app/_archive/drawer/

# Unused screens
mv app/screens/welcome.tsx app/_archive/screens/
mv app/screens/edit-profile.tsx app/_archive/screens/
mv app/screens/subscription.tsx app/_archive/screens/
mv app/screens/ai-voice.tsx app/_archive/screens/
mv app/screens/search-form.tsx app/_archive/screens/
mv app/screens/provider.tsx app/_archive/screens/
```

**Keep:**

- `app/screens/profile.tsx` - Will wire to Clerk data
- `app/screens/forgot-password.tsx` - Future use
- `app/screens/help.tsx` - Static FAQ

**Acceptance Criteria:**

- [x] Demo screens archived to `app/_archive/`
- [x] No broken navigation links
- [x] Archived screens preserved for reference

---

#### Task 4.3: Update Navigation Links

**What to do:**
Fix any remaining navigation links after restructure.

**Files to check:**

- `app/(auth)/login.tsx` - Success redirect
- `app/(auth)/signup.tsx` - Success redirect
- `components/ui/CustomDrawerContent.tsx` - All hrefs
- Any Link components

**Acceptance Criteria:**

- [x] Login success → home screen
- [x] Signup success → home screen
- [x] All drawer links work
- [x] Profile link works
- [x] Sign out → login screen

---

## Verification Strategy

### Manual Testing Flow

**Test 1: Fresh User**

1. Clear app data
2. Open app → should see login screen
3. Sign up with email
4. After verification → home screen with AiCircle
5. Credits show 1000

**Test 2: First Message**

1. On home screen with AiCircle
2. Type "Hello" in ChatInput
3. Tap send
4. AiCircle fades out
5. User message appears (right side, blue)
6. Typing indicator appears
7. Response streams in (left side)
8. Credits decrease

**Test 3: Conversation Continuity**

1. Send another message
2. Both messages visible
3. Response streams in
4. Scroll works if many messages

**Test 4: Sidebar**

1. Open drawer (swipe or tap ≡)
2. See conversation in "Today"
3. See "New chat" button
4. Tap "New chat"
5. AiCircle returns (fresh state)
6. Old conversation still in sidebar

**Test 5: Load Previous Conversation**

1. Open drawer
2. Tap previous conversation
3. Messages load
4. Can continue chatting

**Test 6: Model Selection**

1. Tap model switcher (BotSwitch)
2. See real models from Convex
3. Select different model
4. New conversation uses that model

---

## File Change Summary

| File                                    | Action       | Description                     |
| --------------------------------------- | ------------ | ------------------------------- |
| `app/_layout.tsx`                       | MODIFY       | Simplify to Slot with providers |
| `app/(auth)/_layout.tsx`                | CREATE       | Auth layout                     |
| `app/(auth)/login.tsx`                  | MOVE         | From screens/                   |
| `app/(auth)/signup.tsx`                 | MOVE         | From screens/                   |
| `app/(app)/_layout.tsx`                 | CREATE       | Auth gate                       |
| `app/(app)/(drawer)/index.tsx`          | MAJOR MODIFY | Wire up entire home screen      |
| `components/ui/BotSwitch.tsx`           | MODIFY       | Use Convex models               |
| `components/ui/CustomDrawerContent.tsx` | MAJOR MODIFY | Real conversations              |
| `components/ui/ChatInput.tsx`           | MINOR MODIFY | Future button handlers          |

---

## Commit Strategy

| Phase   | Message                                                           | Files               |
| ------- | ----------------------------------------------------------------- | ------------------- |
| 1.1     | `feat(auth): add route groups with auth protection`               | layouts             |
| 2.1     | `feat(models): wire BotSwitch to Convex models`                   | BotSwitch           |
| 2.2-2.4 | `feat(chat): implement home screen chat with AiCircle transition` | home screen         |
| 2.5     | `feat(credits): add credits display to header`                    | home screen         |
| 3.1-3.3 | `feat(sidebar): wire conversations and search`                    | CustomDrawerContent |
| 4.1     | `chore(ui): add placeholder handlers for future features`         | ChatInput           |
| 4.2     | `chore: archive unused demo screens`                              | file moves          |
| 4.3     | `fix(nav): update navigation links after restructure`             | various             |

---

## What This Plan Does NOT Cover (Future Work)

1. **Voice features** - AiCircle mic button, voice input
2. **Image attachments in chat** - Backend doesn't process images yet
3. **Web search** - Globe button
4. **Deep research** - Telescope button
5. **Camera capture** - Camera button in attach menu
6. **File attachments** - File button in attach menu
7. **Conversation deletion** - Swipe to delete
8. **Conversation renaming** - Long press to rename
9. **ComfyUI image generation** - Separate feature
10. **Credit purchases** - Payment integration

---

## Success Criteria

After completing this plan:

- [ ] App requires login to access
- [ ] Home screen shows AiCircle in fresh state
- [ ] Sending message fades out AiCircle, shows messages
- [ ] Responses stream word-by-word
- [ ] Sidebar shows real conversations
- [ ] Can switch between conversations
- [ ] "New chat" resets to fresh state
- [ ] Model selector shows real models
- [ ] Credits visible and update correctly
- [ ] All navigation works correctly
