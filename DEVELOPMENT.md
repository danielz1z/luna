# Luna Development Guide

## Prerequisites

- Node.js v20 (`nvm use 20`)
- Xcode with iOS SDK
- Apple Developer account (free works)
- Physical iPhone connected via USB (optional but recommended)

---

## First-Time Setup

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

> Note: `--legacy-peer-deps` is required due to peer dependency conflicts

### 2. Generate iOS Native Project

```bash
npx expo prebuild --platform ios
```

This creates the `ios/` folder. Only needed once (or when native dependencies change).

### 3. Install CocoaPods

```bash
cd ios && pod install && cd ..
```

> First time takes 2-5 minutes. Subsequent runs are faster.

### 4. Configure Xcode Signing

1. Open `ios/Luna.xcworkspace` in Xcode
2. Select **Luna** project in sidebar (blue icon, top)
3. Select **Luna** under TARGETS
4. Go to **Signing & Capabilities** tab
5. Check **"Automatically manage signing"**
6. Select your **Team** (sign into Apple account if needed)
7. Push Notifications capability should already be present

---

## Daily Development Workflow

### Step 1: Start Metro Bundler (Terminal 1)

```bash
npx expo start --dev-client
```

Keep this running. This serves your JavaScript code.

### Step 2: Run the App

**Option A: From Xcode (Recommended for first run)**

1. Open `ios/Luna.xcworkspace`
2. Select your iPhone from device dropdown
3. Press `Cmd+R` or click Play button

**Option B: From CLI (After first successful build)**

```bash
npx expo run:ios --device
```

---

## Troubleshooting

### "No script URL provided"

**Cause:** Metro bundler isn't running.  
**Fix:** Run `npx expo start --dev-client` in a separate terminal.

### "Could not connect to development server"

**Cause:** Phone can't reach Mac on network.  
**Fixes:**

1. Ensure Mac and iPhone are on **same WiFi network**
2. Check Mac firewall: **System Settings → Network → Firewall** (disable or allow Node)
3. Try with USB cable connected
4. Restart Metro with LAN flag: `npx expo start --dev-client --lan`

### "No Accounts" / Signing errors

**Cause:** Not signed into Apple account in Xcode.  
**Fix:** Xcode → Settings → Accounts → Add Apple ID

### "Provisioning profile doesn't include Push Notifications"

**Cause:** Stale provisioning profile.  
**Fix:** In Xcode Signing & Capabilities:

1. Uncheck "Automatically manage signing"
2. Re-check "Automatically manage signing"
3. Save (`Cmd+S`)

### Build freezes in CLI

**Cause:** CLI build can hang on large projects.  
**Fix:** Build from Xcode directly instead (`Cmd+R`).

### CocoaPods issues

```bash
cd ios
pod deintegrate
pod install
cd ..
```

---

## Quick Reference

| Task                | Command                                    |
| ------------------- | ------------------------------------------ |
| Start Metro         | `npx expo start --dev-client`              |
| Run on device (CLI) | `npx expo run:ios --device`                |
| Rebuild native      | `npx expo prebuild --platform ios --clean` |
| Clean build         | Delete `ios/` folder, then prebuild again  |
| Update pods         | `cd ios && pod install && cd ..`           |

---

## Architecture Notes

- **Expo SDK 54** with New Architecture enabled
- **React Native 0.81**
- **NativeWind v2** for Tailwind styling
- **Expo Router v6** for file-based navigation
- Uses `expo-notifications` (requires Push capability)
