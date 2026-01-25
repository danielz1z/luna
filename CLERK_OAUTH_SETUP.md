# Clerk OAuth Setup Guide

## Overview

This app uses **OAuth-only authentication** with Google and Apple Sign-In via Clerk. Email/password authentication has been removed.

**Key Components:**

- **Clerk Dashboard**: Configure OAuth providers
- **Redirect URI**: `luna://oauth-callback` (handled by `expo-auth-session`)
- **Environment**: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

---

## Prerequisites

- Clerk account and workspace ("luna")
- Google Cloud Console project (for Google OAuth)
- Apple Developer account (for Apple Sign-In)
- Expo app with scheme `luna` (configured in `app.json`)

---

## 1. Google OAuth Setup

### 1.1 Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth 2.0 Client ID**
5. Select **iOS** as application type
6. Enter your iOS Bundle ID: `com.blobsid.luna` (from `app.json`)
7. Copy the **Client ID**

### 1.2 Configure in Clerk Dashboard

1. Log in to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select workspace: **luna**
3. Navigate to **User & Authentication > Social Connections**
4. Click **Google**
5. Toggle **Enable for sign-up and sign-in**
6. Paste your Google **Client ID**
7. Add **Redirect URI**: `luna://oauth-callback`
8. Click **Save**

---

## 2. Apple Sign-In Setup

### 2.1 Configure Apple Developer Account

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** > Your App ID (`com.blobsid.luna`)
4. Enable **Sign in with Apple** capability
5. Save changes

### 2.2 Configure in Clerk Dashboard

1. In Clerk Dashboard, navigate to **User & Authentication > Social Connections**
2. Click **Apple**
3. Toggle **Enable for sign-up and sign-in**
4. Add **Redirect URI**: `luna://oauth-callback`
5. Click **Save**

**Note**: Apple Sign-In uses your app's Bundle ID automatically. No additional credentials needed.

---

## 3. Environment Variables

Ensure your `.env.local` file contains:

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

Get your publishable key from:

- Clerk Dashboard > **API Keys** > **Publishable Key**

---

## 4. Redirect URI Configuration

**Important**: The redirect URI `luna://oauth-callback` is handled by `expo-auth-session`, NOT by an Expo Router route.

- `WebBrowser.maybeCompleteAuthSession()` (called in `SignInWith.tsx`) intercepts the deep link
- The OAuth flow returns control to the `startSSOFlow()` promise
- **No route file is needed** for `oauth-callback`

---

## 5. Testing

### 5.1 Test Google OAuth

1. Start the app: `npx expo start`
2. Open on iOS Simulator or device
3. Tap **Sign in with Google**
4. Complete Google sign-in flow
5. Verify: User is signed in, modal closes, stays on same screen

### 5.2 Test Apple Sign-In

1. **Note**: Apple Sign-In only works on physical iOS devices (not simulator)
2. Tap **Sign in with Apple**
3. Complete Apple sign-in flow
4. Verify: User is signed in, modal closes, stays on same screen

---

## 6. Troubleshooting

### "OAuth callback failed"

- **Check**: Redirect URI in Clerk Dashboard matches `luna://oauth-callback`
- **Check**: App scheme in `app.json` is `luna`
- **Check**: `WebBrowser.maybeCompleteAuthSession()` is called in `SignInWith.tsx`

### "Invalid client ID"

- **Google**: Verify Client ID in Clerk Dashboard matches Google Cloud Console
- **Apple**: Ensure Bundle ID in Clerk matches your app's Bundle ID (`com.blobsid.luna`)

### "User not authenticated" errors

- **Check**: Clerk publishable key is set in `.env.local`
- **Check**: Clerk workspace is "luna"
- **Restart**: Clear Expo cache: `npx expo start -c`

---

## 7. Additional Resources

- [Clerk OAuth Documentation](https://clerk.com/docs/authentication/social-connections/oauth)
- [Expo Auth Session](https://docs.expo.dev/versions/latest/sdk/auth-session/)
- [Google OAuth Setup](https://support.google.com/cloud/answer/6158849)
- [Apple Sign-In Setup](https://developer.apple.com/sign-in-with-apple/)

---

## 8. Architecture Notes

### Why No Email/Password?

- **Simplified UX**: OAuth is faster and more secure
- **Reduced maintenance**: No password reset flows
- **Better security**: Leverages Google/Apple's auth infrastructure

### Why Modal Instead of Navigation?

- **Context preservation**: User stays on current screen
- **Message preservation**: Input not cleared when auth modal appears
- **Better UX**: Seamless auth flow without navigation disruption

### Deferred Sign-In

- **Unauthenticated access**: Users can explore the app without signing in
- **Contextual auth**: Sign-in prompt appears when user tries to send a message
- **Proactive option**: "Sign in" button in drawer for early authentication
