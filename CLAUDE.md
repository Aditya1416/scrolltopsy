# Scrolltopsy

## Live URL
https://scrolltopsy.vercel.app

## Stack
Vite + React + TypeScript + Tailwind + Firebase + Capacitor (Android)

## Commands
- npm run dev
- npm run build (outputs to dist/)
- npm test (must always pass — 43 tests)
- node scripts/generate-icons.js (icon generation)
- npx cap sync android (sync web to Android)
- cd android && ./gradlew assembleRelease (build APK)

## DO NOT TOUCH
- src/lib/storage.js
- src/lib/ai.js
- firestore.rules
- public/.well-known/assetlinks.json
- docs/

## Design rules
- Background: #0a0a0a everywhere, always
- Accent red: #E24B4A on exactly 3 elements per screen
- No borders on interactive elements
- No card backgrounds
- Geist Mono font throughout
- No page transition animations

## Privacy rules
- No analytics, tracking pixels, or fingerprinting
- No device identifiers stored
- Firestore receives weekly aggregates only
