# APK Build Guide - Nuhi Great Travels Mobile App

This guide will help you build an Android APK from the mobile booking app using Capacitor.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Java JDK** (version 17 or higher)
3. **Android Studio** with Android SDK
4. **Gradle** (usually comes with Android Studio)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Install Capacitor Android Platform

```bash
npx cap add android
```

This will create an `android` folder in your project.

## Step 3: Build the Web App

First, build the React app for production:

```bash
npm run build
```

This creates an optimized production build in the `dist` folder.

## Step 4: Sync with Capacitor

Sync the web build with the Android project:

```bash
npx cap sync android
```

## Step 5: Open in Android Studio

```bash
npx cap open android
```

This will open the project in Android Studio.

## Step 6: Configure Android App

### Update App Information

1. In Android Studio, navigate to `android/app/src/main/res/values/strings.xml`
2. Update the app name and other details if needed

### Update Package Name (Optional)

If you want to change the package name:
1. Right-click on `android/app/src/main/java/com/nuhigreattravels/booking`
2. Refactor → Rename
3. Update `appId` in `capacitor.config.ts` to match

### Configure API URL

1. Create `android/app/src/main/assets/env.properties` (if needed)
2. Or update the API URL in your `.env` file before building

## Step 7: Build APK

### Option A: Build Debug APK (for testing)

1. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. The APK will be in: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B: Build Release APK (for production)

1. **Generate a Keystore** (first time only):
   ```bash
   keytool -genkey -v -keystore nuhi-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias nuhi
   ```

2. **Create `android/keystore.properties`**:
   ```properties
   storePassword=your-store-password
   keyPassword=your-key-password
   keyAlias=nuhi
   storeFile=../nuhi-release-key.jks
   ```

3. **Update `android/app/build.gradle`**:
   Add before `android {`:
   ```gradle
   def keystorePropertiesFile = rootProject.file("keystore.properties")
   def keystoreProperties = new Properties()
   if (keystorePropertiesFile.exists()) {
       keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
   }
   ```

   Update `android {` block:
   ```gradle
   android {
       ...
       signingConfigs {
           release {
               if (keystorePropertiesFile.exists()) {
                   keyAlias keystoreProperties['keyAlias']
                   keyPassword keystoreProperties['keyPassword']
                   storeFile file(keystoreProperties['storeFile'])
                   storePassword keystoreProperties['storePassword']
               }
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled false
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

4. **Build Release APK**:
   - In Android Studio: **Build → Generate Signed Bundle / APK**
   - Select **APK**
   - Choose your keystore
   - Select **release** build variant
   - The APK will be in: `android/app/build/outputs/apk/release/app-release.apk`

## Step 8: Test the APK

1. Enable **Developer Options** on your Android device
2. Enable **USB Debugging**
3. Connect device via USB
4. Install APK:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

Or transfer the APK to your device and install manually.

## Troubleshooting

### Issue: "SDK location not found"
- Set `ANDROID_HOME` environment variable:
  - Windows: `setx ANDROID_HOME "C:\Users\YourName\AppData\Local\Android\Sdk"`
  - Linux/Mac: `export ANDROID_HOME=$HOME/Android/Sdk`

### Issue: Build fails
- Make sure you've run `npm run build` before `npx cap sync`
- Check that all dependencies are installed: `npm install`
- Clean and rebuild: In Android Studio, **Build → Clean Project**, then **Build → Rebuild Project**

### Issue: API not working in APK
- Make sure your API URL is accessible from the device
- For local testing, use your computer's IP address instead of `localhost`
- Update `VITE_API_BASE_URL` in `.env` before building

## Alternative: Build from Command Line

You can also build APK from command line:

```bash
cd android
./gradlew assembleDebug  # For debug APK
./gradlew assembleRelease  # For release APK (requires signing config)
```

## Updating the App

When you make changes:

1. Update the React app
2. Run `npm run build`
3. Run `npx cap sync android`
4. Rebuild APK in Android Studio

## Publishing to Google Play Store

1. Build a release APK or AAB (Android App Bundle)
2. Create a Google Play Console account
3. Create a new app
4. Upload the APK/AAB
5. Fill in store listing details
6. Submit for review

## Notes

- The app uses Capacitor, which wraps your web app in a native container
- All web features (PWA, animations, etc.) work in the APK
- The app can access native device features through Capacitor plugins
- Make sure your API server is accessible from mobile devices (not just localhost)

