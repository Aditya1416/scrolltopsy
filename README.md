# scrolltopsy

a post-mortem of your scroll session.

## what it does

tap "i'm about to doomscroll" before opening a feed.
tap "i'm done" when you surface.

scrolltopsy shows you exactly what you gave away.

## running locally

```bash
npm install
npm run dev
```

requires node 18+.

## android build

```bash
npm run build
npx cap sync android
cd android && .\gradlew.bat assembleRelease
```

requires android sdk (`ANDROID_HOME`), ndk 27.1.12297006, jdk 17+.

build from a short path (`C:\s3\`) — long paths exceed windows' 260-char limit.

## stack

vite + react + firebase + capacitor (android)

## privacy

no analytics. no device ids. no raw timestamps leave the device.
firestore receives weekly aggregates only, encrypted with aes-256-gcm before upload.
sign-in is optional. everything works without an account.
