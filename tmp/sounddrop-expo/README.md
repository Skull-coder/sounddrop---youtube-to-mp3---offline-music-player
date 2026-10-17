# SoundDrop — Android APK Build Guide

This is your complete, standalone Expo React Native project ready to compile into an Android `.apk` binary.

## Step 1: Install Dependencies
Open your terminal in this folder and run:
```bash
npm install
```

## Step 2: Build the Standalone APK with EAS Cloud
```bash
npx eas-cli login
npx eas-cli build -p android --profile preview
```

- When prompted *"Generate a new Android Keystore?"*, choose **Yes** (press Enter).
- EAS will build the `.apk` on Expo's cloud build servers (takes 2–3 minutes).
- When done, the terminal will give you a direct download link and QR code for your `.apk`!

## Run Locally on your Android Phone with Expo Go:
```bash
npx expo start
```
Scan the QR code with the Expo Go app from Google Play Store.
