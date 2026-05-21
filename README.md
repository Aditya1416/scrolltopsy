# Scrolltopsy

> *an autopsy of your scrolling habit.*

A brutally honest doomscrolling tracker for Android. No streaks. No gamification. No comfort. Just a clinical record of the time you fed to the algorithm — and a physician's note to explain what you traded it for.

---

## Screenshots

> **Home** · **Tracking** · **Shame Report** · **Settings**

```
┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐
│                     │  │                     │  │                     │
│  SCR-20260522  ⚙   │  │                     │  │  autopsy complete   │
│                     │  │    ╔═══════════╗    │  │                     │
│  good evening, a.  │  │    ║  23:47    ║    │  │        47           │
│                     │  │    ╚═══════════╝    │  │                     │
│      ╭──────╮       │  │                     │  │  minutes            │
│     ╱   47   ╲      │  │    still scrolling  │  │  unrecoverable      │
│    │  min     │     │  │                     │  │  ──────────────     │
│    │  wasted  │     │  │                     │  │  pages you could    │
│     ╲  today ╱      │  │                     │  │  have read ..... 70 │
│      ╰──────╯       │  │                     │  │  steps you could    │
│                     │  │                     │  │  have walked .. 4700│
│  22:10 — 22:47 47m  │  │                     │  │                     │
│  21:03 — 21:19 16m  │  │      i'm done       │  │  ╔═══════════════╗  │
│                     │  │                     │  │  ║ 47 minutes of ║  │
│  i'm about to       │  │                     │  │  ║ your finite   ║  │
│  doomscroll         │  │                     │  │  ║ time transfer-║  │
│                     │  │                     │  │  ║ red to an     ║  │
└─────────────────────┘  └─────────────────────┘  └─────────────────────┘
```

---

## What it does

You open it before you doomscroll. You tap **"i'm about to doomscroll."** A timer starts. When you're done, you tap **"i'm done."** The app shows you the damage.

That's it. No notifications asking you to return. No achievements for quitting. No daily goals. The app does not want you to use it more — that's the point.

---

## Features

### Home screen
- **SVG arc ring** — fills red as you approach 60 minutes wasted today. Animates on load over 1200ms.
- **Dot-grid background** — drawn in SVG, zero GPU overdraw
- **Personalised greeting** — time-aware (`good evening, a.`), fades in at 300ms
- **Session log** — last 3 sessions today with `HH:MM — HH:MM` time ranges, staggered slide-up
- **Scrolltype badge** — your behavioural classification, appears after 7 sessions

### Tracking screen
- **Timestamp-based timer** — survives backgrounding, lock screen, app switching. `AppState` handler re-syncs on foreground.
- **Pulsing red glow** — animated radial gradient, `Animated.loop`, `useNativeDriver: true`
- **Format:** `M:SS` not `MM:SS` — single digit minutes, zero-padded seconds

### Shame report (choreographed)
Eight elements reveal in sequence via `Animated.sequence`:

| Delay | Element |
|-------|---------|
| 200ms | `autopsy complete` header fades in |
| 600ms | Duration number springs in (scale 0.8 → 1.0) |
| 1400ms | `minutes unrecoverable` label |
| 1600ms | Thin divider |
| 1800ms | Equivalence ledger (4 rows with dot leaders) |
| 1900ms | Physician's note starts typewriting at 18ms/char |
| 2400ms | Session stats row |
| 2800ms | Scrolltype classification card (spring) |

**Equivalences:**
- Pages you could have read: `mins × 1.5`
- Steps you could have walked: `mins × 100`
- Lines of code: `mins × 8`
- Fraction of a power nap: `(mins / 20) × 100%`

### Shame engine — 60 messages across 5 tiers

| Tier | Duration | Tone |
|------|----------|------|
| 1 | < 5 min | Dry, almost indifferent |
| 2 | 5–15 min | Matter-of-fact, slightly pointed |
| 3 | 15–30 min | Clinical, no comfort |
| 4 | 30–60 min | Cold precision |
| 5 | > 60 min | Quiet devastation |

No message repeats back-to-back. Rotates by session count.

### Scrolltype classification
Assigned after 7 sessions. Computed from your actual session timestamps:

| Type | Condition |
|------|-----------|
| `late-night doom merchant` | Worst hour: 10pm–2am |
| `morning anxiety checker` | Worst hour: 6am–9am |
| `deep void diver` | Longest session > 45 min |
| `compulsive refresher` | > 28 total sessions |
| `weekend void walker` | > 50% sessions on weekends |
| `casual self-saboteur` | Everything else |

### Settings
- **Google Sign-In** via `@react-native-google-signin/google-signin` + Firebase Auth
- **Back up my data** — syncs weekly aggregates to Firestore (no raw sessions, no raw content)
- **Share this week** — generates a shareable URL
- **Delete all my data** — wipes AsyncStorage + Firestore doc, double-confirmed

---

## Privacy

- **No analytics.** No Mixpanel, Amplitude, Segment, Firebase Analytics, or tracking pixels.
- **No device identifiers stored** — not GAID, not IDFV, nothing.
- **Firestore receives weekly aggregates only** — `totalMins`, `weekMins`, `scrolltype`. Never raw session timestamps.
- Sessions live in `AsyncStorage` on-device only.
- Sign-in is optional. The app works fully offline without an account.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | Expo 56 / React Native 0.85 |
| Language | TypeScript |
| Navigation | React Navigation 7 (Stack) |
| Storage | AsyncStorage (`@react-native-async-storage`) |
| Auth | Firebase Auth + `@react-native-google-signin` |
| Database | Firestore (aggregates only) |
| Graphics | `react-native-svg` |
| Fonts | Space Mono (400, 700, Italic) via `@expo-google-fonts` |
| Haptics | `expo-haptics` |
| Animation | React Native `Animated` API (`useNativeDriver: true` throughout) |
| Build | EAS / Gradle 8 |

---

## Project structure

```
scrolltopsy-v3/
├── App.tsx                    # Entry point — fonts, auth, navigation
├── src/
│   ├── theme.ts               # Colour + font constants
│   ├── lib/
│   │   ├── firebase.ts        # Firebase init (getApps guard)
│   │   ├── auth.ts            # Google Sign-In + privacy consent flow
│   │   ├── storage.ts         # AsyncStorage CRUD + scrolltype classifier
│   │   ├── shame.ts           # 60-message dictionary + tier logic
│   │   └── sync.ts            # Firestore backup (aggregates only)
│   ├── screens/
│   │   ├── HomeScreen.tsx     # Arc ring, greeting, session log
│   │   ├── TrackingScreen.tsx # Timer, pulsing glow
│   │   ├── ShameScreen.tsx    # Choreographed reveal sequence
│   │   └── SettingsModal.tsx  # Auth, backup, delete
│   └── components/
│       ├── MonoText.tsx       # Space Mono text wrapper
│       └── GlassCard.tsx      # Glass-surface card
├── assets/
│   ├── icon.png               # 1024×1024 generated from SVG
│   └── adaptive-icon.png      # Android adaptive icon
├── android/                   # Native Android (Expo prebuild)
├── eas.json                   # EAS build profiles
└── app.json                   # Expo config
```

---

## Building locally

### Prerequisites
- Node 18+
- Android Studio or Android SDK (`ANDROID_HOME` set)
- NDK 27.1.12297006 (`sdkmanager "ndk;27.1.12297006"`)
- JDK 17+

> **Windows note:** Build from a short path like `C:\s3\` — the React Native C++ codegen generates filenames that exceed Windows' 260-character MAX_PATH limit when the project is nested in `C:\Users\...\OneDrive\Desktop\`.

```bash
# Install dependencies
npm install

# Run on connected device / emulator
npx expo run:android

# Build release APK (from android/ dir)
cd android
.\gradlew.bat assembleRelease
# APK → android/app/build/outputs/apk/release/app-release.apk
```

### EAS cloud build (no local SDK needed)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

---

## Google Sign-In setup (new Firebase project)

1. Add your Android app's SHA-1 to Firebase Console:
   ```
   keytool -list -v -keystore your.keystore -alias your-alias
   ```
2. Download the updated `google-services.json` → place in project root
3. Run `npx expo prebuild --platform android` to regenerate native files
4. Rebuild

---

## Design system

```
Background:   #000000  (pure void)
Surface:      #0a0a0a
Glass:        rgba(255,255,255,0.04)
Glass border: rgba(255,255,255,0.08)
Text:         #e8e8e8
Text sub:     #555555
Text muted:   #252525
Alarm red:    #E24B4A
Font:         Space Mono (monospace — everything)
```

Rules:
- No borders on interactive elements
- No card backgrounds except glass surfaces
- No page transition animations
- Exactly 3 red (`#E24B4A`) elements visible per screen
- All animations use `useNativeDriver: true` where possible

---

## License

MIT — see [LICENSE](LICENSE)

---

*scrolltopsy — because awareness is the first step, even if it changes nothing.*
