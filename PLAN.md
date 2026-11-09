# Blind Touch-Typing Learning Platform: Master Development Plan

## Project Vision & Goals
A modern, responsive, offline-first web application designed to teach blind touch-typing through muscle memory and adaptive progression (inspired by Keybr and Monkeytype).
- **Core Pedagogy**: Progressive letter unlocking (starting with home row keys `F`, `J`, etc.), adaptive pseudo-word generation targeting weak keys, and real-time visual finger guidance.
- **Architecture**: Next.js 15 (React 19 + TypeScript) PWA with Dexie.js (IndexedDB) for offline-first resilience, synchronizing with PostgreSQL via Drizzle ORM.

---

## Architecture Overview

```mermaid
graph TD
    UI[Next.js 15 React App / PWA] --> Store[Zustand Stores]
    Store --> Engine[Core Typing Engine & Metrics]
    Store --> Curriculum[Adaptive Keybr-style Curriculum]
    Store --> Audio[Web Audio Mechanical Switch Synthesizer]
    Store --> LocalDB[(Dexie.js / IndexedDB)]

    subgraph Offline Sync Pipeline
        LocalDB --> SyncQueue[Sync Queue Manager]
        SyncQueue -->|When Online| API[/api/sync/sessions]
    end

    API --> Drizzle[Drizzle ORM]
    Drizzle --> Postgres[(PostgreSQL Database)]
```

---

## Step-by-Step Implementation Roadmap

### Phase 1: Foundation & Project Scaffolding
- [x] Initialize Next.js 15 project with TypeScript, Tailwind CSS, and `src/` directory layout.
- [x] Configure Web App Manifest, Service Worker, and PWA capabilities for offline standalone execution.
- [x] Install and configure core packages:
  - `zustand` (performance-focused state management).
  - `dexie` & `dexie-react-hooks` (local client database).
  - `drizzle-orm`, `drizzle-kit`, and `pg` (PostgreSQL ORM).
  - `lucide-react`, `clsx`, `tailwind-merge` (UI essentials).
- [x] Set up Vitest / testing harness for pure TypeScript logic testing.

### Phase 2: Core Typing Engine (Zero-DOM, Pure TypeScript)
- [x] **State Machine**: Implement typing engine lifecycle (`idle` -> `running` -> `paused` -> `completed`).
- [x] **Realtime Metrics**:
  - High-precision timestamping using `performance.now()`.
  - Gross WPM, Net WPM, Accuracy (%), raw CPM, and consistency calculations.
  - Per-character dwell time (latency between consecutive keys).
- [x] **Input Diffing & Cursor Management**:
  - Exact match vs. typo character diffing.
  - Backspace behavior (allow backspacing mistake words or forward lock).
- [x] **Unit Tests**: Full test suite covering edge cases (fast typing, multiple backspaces, paste prevention).

### Phase 3: Adaptive Learning Algorithm (Keybr-style)
- [x] **Key Progression Ladder (Initial 7 Stages)**:
  - Stage 1: Home row anchors (`f`, `j`, `d`, `k`).
  - Stage 2: Full home row (`s`, `l`, `a`, `;`).
  - Stage 3: Top row vowels & index reaches (`e`, `i`, `r`, `u`).
  - Stage 4: Center reaches & high frequency (`g`, `h`, `t`, `y`).
  - Stage 5: Top row extremes & bottom row (`o`, `p`, `w`, `q`, `n`, `m`, `c`, `v`).
  - Stage 6: Remaining rare letters (`b`, `x`, `z`).
  - Stage 7: Basic punctuation (`,`, `.`, `'`, `?`).
- [x] **Curriculum Expansion (Advanced & Code Stages)**:
  - [x] Stage 8: Number Row (`1`, `2`, `3`, `4`, `5`, `6`, `7`, `8`, `9`, `0`).
  - [x] Stage 9: Shift Symbols & Enclosing Brackets (`!`, `@`, `#`, `$`, `%`, `^`, `&`, `*`, `(`, `)`, `[`, `]`, `{`, `}`).
  - [x] Stage 10: Programming Operators (`=`, `+`, `-`, `_`, `/`, `\`, `|`, `<`, `>`, `:`, `~`, `` ` ``).
  - [x] Stage 11: Mixed Capitalization & Casing Drills (CamelCase, snake_case, PascalCase).
  - [x] Stage 12: Full Code Syntax Drills (JavaScript, TypeScript, Python, HTML/CSS snippet typing).
- [x] **Confidence Score Engine**:
  - Calculate per-key score: $Confidence = f(\text{Accuracy}, \text{Speed}, \text{Error Frequency})$.
  - Track individual key dwell times and error rates.
- [x] **Pseudo-Word / Exercise Generator**:
  - Markov chain / N-gram frequency model that builds pronounceable words using *only* unlocked letters.
  - Bias word generation heavily toward the user's lowest-confidence keys until target confidence (e.g. 95% accuracy @ 35+ WPM) is achieved.

### Phase 4: Virtual Keyboard & Visual Guidance
- [x] **Layout System**:
  - Foundational keyboard matrix with key dimensions and finger assignments (QWERTY default; multi-layout engine expanded in Phase 11).
  - Define keyboard matrix with key dimensions and finger assignments.
- [x] **Interactive Visual Keyboard Component**:
  - Responsive SVG / CSS Grid keyboard.
  - Active target key highlight + finger color indicator.
  - Dynamic keypress animations (reflecting real-time physical keydown).
- [x] **Hands & Finger Guide Component (Fingers Row)**:
  - 10-finger color-coded pill indicators (Pinky, Ring, Middle, Index, Thumbs) highlighting the active finger.
- [x] **Transparent Hands Visual Overlay**:
  - [x] Semi-transparent SVG hand silhouettes (Left & Right hands) visually positioned with finger bones/joints.
  - [x] Active finger dynamically lights up / pulses in its assigned color (rose, orange, amber, emerald, blue) to teach physical posture.
  - [x] Dedicated Toolbar Toggle Button: On/Off switch with icon in the header controls to toggle the hands overlay on/off based on user preference.
- [x] **"Hardcore Mode"**:
  - Toggle to hide the visual keyboard or mask upcoming characters to force physical muscle memory.

### Phase 5: Audio Feedback System
- [x] **Web Audio API Engine**:
  - Synthesize low-latency click sounds or load audio buffers for mechanical switches (Cherry MX Blue, Brown, Red, and Typewriter).
  - Sub-5ms sound trigger on keydown.
  - Distinct subtle audio cue on mistake / invalid character.

### Phase 6: Local-First Storage (Dexie.js)
- [x] **IndexedDB Schema**:
  - `sessions`: Completed typing sessions with detailed metrics and raw key logs.
  - `keyProgress`: Aggregated stats per key (confidence, accuracy, attempts, rolling WPM).
  - `syncQueue`: Offline mutations awaiting server sync.
  - `userSettings`: Local preferences (theme, audio, layout, target WPM, activeStageId).
- [x] **Reactive Storage & Hydration**:
  - Automatically persist completed practice sessions and key confidence to IndexedDB.
  - Hydrate active curriculum stage, letter confidence, and audio preferences on page reload.
  - Reset progress cleanly wipes local database tables.

### Phase 7: Backend Synchronization & PostgreSQL (Drizzle ORM)
- [x] **Drizzle Schema Definition**:
  - Tables: `users`, `typing_sessions`, `user_key_stats`.
  - Configured `drizzle.config.ts` for database migrations and Drizzle Studio.
- [x] **Sync Protocol**:
  - Implemented `/api/sync/sessions` batch endpoint with Zod validation.
  - Idempotent upserts (`ON CONFLICT (id) DO NOTHING`) preventing duplicate runs.
  - Client-side `ClientSyncManager` with `navigator.onLine` auto-reconnect and periodic sync flushes.

### Phase 8: UI Dashboard, Analytics & Responsive Polish
- [x] **Typing Canvas UI**: Smooth caret animation, active line rendering, mistake coloration, and progress scorecard.
- [x] **Analytics Dashboard (`/stats`)**:
  - [x] Keyboard Heatmap: Color keys by confidence score, accuracy %, and dwell speed (Green -> Yellow -> Red).
  - [x] Interactive per-key inspection drawer with lifetime hits, errors, rolling WPM, and dwell time.
  - [x] Lifetime practice metrics (Peak WPM, Average WPM, Average Accuracy, Total Keystrokes).
  - [x] Offline practice history table loaded directly from Dexie.js (`db.sessions`).
- [x] **High-Resolution (2K / QHD) Responsive Design & Theme Tokens**:
  - [x] High-DPI root font-size scaling (`17.5px` on $\ge 1920\text{px}$, `19.5px` on $\ge 2400\text{px}$, `22px` on $\ge 3200\text{px}$).
  - [x] Fluid typing text sizes (`text-3xl` to `text-8xl` on 2K displays).
  - [x] Enlarged keycaps, hand silhouettes, and expanded layout containers (`max-w-[1700px]`).
  - [x] Dedicated UI Text Size toggle button (`1x` standard, `1.25x` large, `1.5x` huge) persisted in IndexedDB.
  - [x] Centralized design tokens in `src/styles/theme.ts`.
- [x] **Installable PWA & Offline App Shell**:
  - [x] Web App Manifest (`manifest.json` / `app/manifest.ts`) with modern app icons, standalone display mode, and dark cyber theme colors.
  - [x] Service Worker (`public/sw.js`) for full offline caching of app shell, scripts, CSS, and mechanical switch audio assets.
  - [x] In-app PWA install prompt button (`<InstallAppButton />`) dynamically available in the top toolbar.
  *(Note: Physical desktop/laptop keyboard is required; mobile virtual keyboard typing is explicitly excluded).*

### Phase 9: Arcade Mode & Mini-Games Hub (`/arcade`)
*Full game design document available in [`ARCADE.md`](./ARCADE.md).*
- [x] **Arcade Hub Navigation & Route (`/arcade`)**:
  - Retro neon arcade hub with game selector cards, difficulty toggles, and high-score badges.
- [ ] **Arcade Progression & Unlock Gating (Prerequisite Condition)**:
  - Arcade Mode locked by default for new typists; unlocks only after meeting specific curriculum milestones to ensure foundational touch-typing mechanics before high-stress gamification.
  - Locked UI state with visual padlock badge, unlock progress indicator, and explanatory modal on the Home page (`/`) and Arcade Hub (`/arcade`).
  - *Unlock Condition (Criteria TBD)*: E.g., complete Stage 3 (Home Row mastery) or achieve minimum confidence across primary keys. Exact gating condition to be finalized.
- [x] **Mini-Game 1: "Redline RPM" (Speedometer Sustain Challenge)**:
  - Analog & digital SVG speedometer dial responding in real time to rolling WPM.
  - Realistic automotive instrument cluster with $270^\circ$ sweep (135° to 405°), mathematical needle-to-tick alignment, and MID HUD.
  - Redline threshold marker: player must keep speed in the red zone for $X$ consecutive seconds.
  - Turbo boost particles, engine downshift audio cues, and decay penalties if dropping below the line.
  - Tiers: Amateur (35 WPM / 10s), Sport (50 WPM / 15s), Supercar (75 WPM / 20s), Hypercar (100+ WPM / 25s).
- [x] **Mini-Game 2: "Bomb Defusal Protocol" (Crisis Countdown)**:
  - Counter-Strike themed C4 Pelican case prop with dynamic 7-segment digital LED countdown clock and status pulsing diode.
  - Authentic Counter-Strike audio cues (preloaded & cached in Service Worker for 100% offline play):
    - "The bomb has been planted" radio dispatch (`bombpl.wav`) on round start.
    - Accelerating C4 digital countdown beeps (`c4_beep1.wav`, intervals accelerating down to 80ms).
    - Wire snipping sound (`c4_disarm.wav`) on completed phase wire cuts.
    - Massive C4 detonation explosion (`c4_explode1.wav`) + "Terrorists win" radio dispatch (`terwin.wav`) on timeout.
    - "Bomb has been defused" (`bombdef.wav`) + "Counter-Terrorists win" (`ctwin.wav`) on victory.
    - Procedural fallback Web Audio synth + Web Speech API for graceful degradation.
  - Severe mistake penalty: every typo deducts $-1.5\text{s}$ to $-5.0\text{s}$ from remaining time with alarm zap and screen shake.
  - Multi-phase defusal sequences with visual cut wires: Disarm codes (e.g. `7355608`), terminal commands, and cryptographic hashes.
  - Tiers: Recruit (45s, $-1.5\text{s}$), Agent (30s, $-3.0\text{s}$), Special Forces (22s, $-4.0\text{s}$), Impossible (15s, $-5.0\text{s}$).
  - Fully tested with Vitest unit tests covering countdown tick, typo penalty deductions, phase wire cutting, and win/loss states.
- [ ] **Brainstormed Future Mini-Games**:
  - [ ] *Word Invaders*: Retro space defense destroying falling alien ships with typed words.
  - [ ] *Rhythm DJ / Beat Match*: Guitar Hero style vertical note highway training cadence and dwell consistency.
  - [ ] *Terminal Hacker*: Cyber infiltration code-runner keeping security trace route below 100%.
  - [ ] *Ghost Drag Race*: 1/4-mile drag duel against your personal best ghost car.
- [x] **Arcade Storage & Audio**:
  - Dexie table `arcadeScores` tracking personal bests, stars, and medals per difficulty tier.
  - Web Audio procedural SFX (engine revs, countdown beeps, defusal zaps, detonation).

### Phase 10: Cloud Authentication (Google OAuth) & Cross-Device Sync
*Goal: Allow users to sign in with their Google account so curriculum progression, key confidence, settings, and arcade high scores sync seamlessly across devices (desktop, laptop).*
- [x] **Google OAuth Authentication (Neon Auth / Better Auth)**:
  - Configure Google OAuth Provider and Neon Auth proxy (`/api/auth/[...path]`).
  - Store user identity (`id`, `name`, `email`, `image`) and manage secure session cookies across HTTP localhost and HTTPS production.
  - Header profile badge: Display avatar, user display name, sign-in modal, cloud sync status, and sign-out dropdown.
- [x] **Anonymous / Guest to Authenticated Account Linking**:
  - Maintain 100% offline-first capability for guest users (no login required to practice).
  - When a guest user logs in for the first time with existing local practice sessions, prompt: *"Merge your local practice history and progress into this account?"* (`<GuestMergeModal />`).
  - Seamlessly migrate Dexie.js local sessions and key progress to the authenticated PostgreSQL user profile (`mergeGuestSessions`).
- [x] **Bidirectional Cross-Device Synchronization Engine**:
  - **New Device Hydration (Cloud -> Local)**:
    - Upon signing in on a new computer or device, automatically pull lifetime statistics, key progress heatmap data, and unlocked curriculum stages from PostgreSQL down to Dexie IndexedDB via `/api/sync/hydrate`.
  - **Auto-Sync on Session Completion (Local -> Cloud)**:
    - Push completed typing sessions and rolling key confidence to `/api/sync/sessions` tagged with authenticated `userId`.
    - Real-time instant sync dispatch upon session completion with manual "Sync Now" button in the account dropdown.
  - **Conflict Resolution (Highest Stat Merge & Last-Write-Wins Accuracy)**:
    - If practice occurred on multiple offline devices, resolve conflicts by merging max key attempts, highest confidence scores, and preserving all unique session timestamps.

### Phase 11: Multi-Layout & Internationalization Engine (Dvorak, Colemak & Hebrew RTL)
*Goal: Enable typists to master alternative English ergonomic layouts (Dvorak, Colemak) and international non-Latin layouts (Hebrew standard SI-1452 with full Right-to-Left RTL text rendering).*

- [ ] **Ergonomic English Layouts (Dvorak & Colemak)**:
  - **Dvorak Matrix (`src/core/layouts/dvorak.ts`)**:
    - Complete Dvorak key mapping, finger assignments, and homing bumps on keys `U` (`KeyF`) and `H` (`KeyJ`).
    - Dvorak-specific curriculum progression ladder (Stages starting with Home row vowels/anchors: `a`, `o`, `e`, `u`, `i`, `d`, `h`, `t`, `n`, `s`).
  - **Colemak Matrix (`src/core/layouts/colemak.ts`)**:
    - Colemak key mapping, finger assignments, and homing bumps on `T` (`KeyF`) and `N` (`KeyJ`).
    - Colemak-specific curriculum progression ladder.

- [ ] **Hebrew Language & Right-to-Left (RTL) Layout Engine**:
  - **Hebrew Standard Matrix (`src/core/layouts/hebrew.ts`)**:
    - Standard Israeli SI-1452 keyboard mapping.
    - Homing tactile anchor keys on `כ` (physical `KeyF`) and `ח` (physical `KeyJ`).
    - Support for standard letters, final letters (*Sofiot*: `ך`, `ם`, `ן`, `ף`, `ץ`), and Hebrew punctuation.
  - **RTL Typing Engine & Canvas Integration**:
    - Dynamic bi-directional layout support: text direction switches to `dir="rtl"` when Hebrew layout is active.
    - Caret positioning, smooth cursor translation, and character diffing aligned right-to-left.
    - Hebrew pseudo-word / n-gram generator producing pronounceable Hebrew syllables and words using unlocked letters.
  - **Hebrew Curriculum Progression Ladder**:
    - Stage 1: Home row anchors (`כ`, `ח`, `ג`, `י`).
    - Stage 2: Full home row (`ש`, `ד`, `ע`, `ל`, `ף`, `,`).
    - Stage 3: Top row reaches (`ק`, `ר`, `א`, `ט`, `ו`, `ן`, `ם`, `פ`).
    - Stage 4: Bottom row reaches (`ז`, `ס`, `ב`, `ה`, `נ`, `מ`, `צ`, `ת`, `ץ`).
    - Stage 5: Final letter mastery and Hebrew punctuation (`.`, `,`, `'`, `/`, `;`).

- [ ] **Interactive Layout Switcher & State Management**:
  - Top navigation bar layout selector dropdown (`QWERTY`, `Dvorak`, `Colemak`, `עברית / Hebrew`).
  - Real-time visual keyboard switching: SVG keycaps dynamically display the active layout's character set and shifted symbols.
  - Transparent hands guide and finger pills dynamically highlight the correct physical finger based on the active layout.
  - Per-layout progress persistence: Dexie `userSettings.keyboardLayout`, tracking independent curriculum stages and key confidence per layout.

---

## Online Deployment & Serving Strategy (Discussion)

To serve Keyboard Hero publicly on the web while preserving sub-millisecond typing responsiveness and offline resilience, the following production architectures are evaluated:

### 1. Recommended Production Architecture (Vercel + Neon Postgres)
- **Frontend & API Routes**: **Vercel**
  - **Why**: Native Next.js 15 App Router support, automatic worldwide Edge CDN asset caching, instant SSL, zero cold-start edge delivery, and automatic preview deployments on GitHub pull requests.
  - **Cost**: Free tier covers hobby and portfolio workloads comfortably.
- **Managed Database**: **Neon Serverless PostgreSQL** (or **Supabase Postgres**)
  - **Why**: Serverless connection pooling (ideal for serverless Next.js API routes), automatic scale-to-zero, point-in-time recovery, and 100% compatibility with Drizzle ORM.
  - **Connection**: Integrated via `DATABASE_URL` with connection pooling (`pg` or `@neondatabase/serverless`).

### 2. Alternative Architecture A: Single-Host Platform (Railway / Render)
- **Deployment**: Single Railway project housing both the Next.js container and a co-located PostgreSQL instance.
- **Pros**: Zero networking latency between Next.js server and database; simplified one-dashboard management.
- **Cons**: Paid usage model after starter credits; single-region hosting unless multi-region CDN is placed in front (e.g., Cloudflare).

### 3. Alternative Architecture B: Self-Hosted Docker Container (VPS / Fly.io / Coolify)
- **Deployment**: Build production Docker image using Next.js `output: 'standalone'` mode.
- **Hosting**: Hetzner Cloud / DigitalOcean droplet ($4–$6/month) or Fly.io managed containers.
- **Pros**: Total infrastructure sovereignty, no vendor lock-in, fixed predictable hosting cost.
- **Cons**: Requires manual SSL provisioning, backup automation, and server maintenance.

### 4. Edge Asset Caching & Offline PWA Serving
- **Edge CDN (Cloudflare or Vercel Edge)**:
  - Static bundles (`_next/static/*`), audio synthesis assets, and sound buffers cached at 300+ edge locations worldwide for $<20\text{ms}$ initial page loads.
- **Service Worker / PWA**:
  - Cache core application shell so the app can be installed as a desktop/mobile PWA and boot instantly with zero internet connectivity.

---

## Live Production Deployment Status

- **Host**: Vercel Production
- **Live URLs**:
  - Main Project Domain: [https://keyboard-hero-app.vercel.app](https://keyboard-hero-app.vercel.app)
  - Vercel Auto Domain: [https://test-tau-vert.vercel.app](https://test-tau-vert.vercel.app)
  - Project Dashboard: [https://vercel.com/bjnhv/keyboard-hero](https://vercel.com/bjnhv/keyboard-hero)
- **Database & Cloud Services**: Neon Serverless PostgreSQL (`eu-central-1`)
  - Pooled Connection: `DATABASE_URL` (AWS Frankfurt pooler)
  - Unpooled Connection: `DATABASE_URL_UNPOOLED` (DDL migrations)
  - Auth: Neon Hosted Better Auth (`/neondb/auth`)
  - Serverless Functions: Neon Compute (`/hello`)
- **Health Check**: [https://keyboard-hero-app.vercel.app/api/neon/health](https://keyboard-hero-app.vercel.app/api/neon/health) (Status: `healthy`, 100% verified)

---

## Verification & Quality Gates
- [ ] **Performance**: 60fps input loop with $< 8\text{ms}$ total keystroke-to-render latency.
- [ ] **Offline Resilience**: Practice 5 lessons with airplane mode turned on -> reload -> all progress preserved -> reconnect -> server successfully synced.
- [ ] **Typing Accuracy**: Engine matches standard net WPM calculation: $((\text{all characters} / 5) - \text{uncorrected errors}) / \text{time in minutes}$.

