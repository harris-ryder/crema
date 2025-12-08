# Crema Native App 👋

This is an [Expo](https://expo.dev) project with Google Sign-In authentication.

## Prerequisites

⚠️ **Important**: This app uses Google Sign-In, which requires a **development build**. Expo Go is not supported.

### For Android Development
1. Install [Android Studio](https://developer.android.com/studio)
2. Set up Android SDK and environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
3. Add to your `~/.zshrc` or `~/.bash_profile` to make permanent

### For iOS Development
1. Install [Xcode](https://apps.apple.com/us/app/xcode/id497799835) from the App Store
2. Install iOS simulators through Xcode

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables
   
   Create a `.env` file in the native directory with:
   ```
   EXPO_PUBLIC_BACKEND_URL=http://localhost:3004
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id
   EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
   ```

3. Build and run the development app

   **For Android:**
   ```bash
   npx expo run:android
   ```
   
   **For iOS:**
   ```bash
   npx expo run:ios
   ```

   Note: First build takes 5-10 minutes. Subsequent runs will be faster with hot reload enabled.

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Troubleshooting

### Android SDK Location Error
If you see "SDK location not found", the build process needs to know where Android SDK is installed:
- Either set `ANDROID_HOME` environment variable (recommended)
- Or the build will create `android/local.properties` automatically if ANDROID_HOME is set
- Or manually create `android/local.properties` with: `sdk.dir=/path/to/your/sdk`

### App Installation Failed
If you see "signatures do not match" error:
```bash
adb uninstall com.crema.app
```
Then run the build command again.

### Google Sign-In Not Working
- Ensure you're running a development build, not Expo Go
- Verify Google Client IDs are correctly set in `.env`
- Check that the package name matches your Google OAuth configuration

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
