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
- [ ] Configure `@serwist/next` (PWA) and Service Worker for full offline capabilities.
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
  - Multi-layout support (QWERTY, Colemak, Dvorak).
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
- [ ] **Mobile Responsiveness & PWA**:
  - [ ] Responsive scaling for tablet/mobile screens.
  - [ ] Detection for external physical/Bluetooth keyboard on mobile with fallback theory/review screen.

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
- [ ] **Mini-Game 2: "Bomb Defusal Protocol" (Crisis Countdown)**:
  - Ticking briefcase bomb prop with dynamic digital LED countdown clock.
  - Severe mistake penalty: every typo deducts $-2.0\text{s}$ to $-5.0\text{s}$ from remaining time with alarm siren and screen shake.
  - Multi-phase defusal sequences (passphrases, wire cutting, cryptographic hashes).
  - Tiers: Recruit (45s, $-1.5\text{s}$), Agent (30s, $-3.0\text{s}$), Special Forces (22s, $-4.0\text{s}$), Impossible (15s, $-5.0\text{s}$).
- [ ] **Brainstormed Future Mini-Games**:
  - [ ] *Word Invaders*: Retro space defense destroying falling alien ships with typed words.
  - [ ] *Rhythm DJ / Beat Match*: Guitar Hero style vertical note highway training cadence and dwell consistency.
  - [ ] *Terminal Hacker*: Cyber infiltration code-runner keeping security trace route below 100%.
  - [ ] *Ghost Drag Race*: 1/4-mile drag duel against your personal best ghost car.
- [x] **Arcade Storage & Audio**:
  - Dexie table `arcadeScores` tracking personal bests, stars, and medals per difficulty tier.
  - Web Audio procedural SFX (engine revs, countdown beeps, defusal zaps, detonation).

### Phase 10 (Optional): Cloud Authentication (Google OAuth) & Cross-Device Sync
*Goal: Allow users to sign in with their Google account so curriculum progression, key confidence, settings, and arcade high scores sync seamlessly across devices (desktop, laptop, tablet).*
- [ ] **Google OAuth Authentication (Auth.js / NextAuth v5)**:
  - Configure Google OAuth Provider (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
  - Integrate Auth.js Drizzle Adapter (`@auth/drizzle-adapter`) with existing PostgreSQL database (`src/db/schema.ts`).
  - Store user identity (`id`, `name`, `email`, `image`) and manage secure HTTP-only session cookies.
  - Header profile badge: Display avatar, user display name, sign-in button, and sign-out dropdown.
- [ ] **Anonymous / Guest to Authenticated Account Linking**:
  - Maintain 100% offline-first capability for guest users (no login required to practice).
  - When a guest user logs in with Google for the first time, prompt: *"Merge your local practice history and progress into this Google account?"*.
  - Seamlessly migrate Dexie.js local sessions and key progress to the authenticated PostgreSQL user profile.
- [ ] **Bidirectional Cross-Device Synchronization Engine**:
  - **New Device Hydration (Cloud -> Local)**:
    - Upon signing in on a new computer or device, automatically pull lifetime statistics, key progress heatmap data, and unlocked curriculum stages from PostgreSQL down to Dexie IndexedDB.
  - **Auto-Sync on Session Completion (Local -> Cloud)**:
    - Push completed typing sessions, rolling key confidence, and arcade scores to `/api/sync/sessions` tagged with authenticated `userId`.
  - **Conflict Resolution (Last-Write-Wins & Highest Stat Merge)**:
    - If practice occurred on multiple offline devices, resolve conflicts by merging max key attempts, highest confidence scores, and preserving all unique session timestamps.

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

## Verification & Quality Gates
- [ ] **Performance**: 60fps input loop with $< 8\text{ms}$ total keystroke-to-render latency.
- [ ] **Offline Resilience**: Practice 5 lessons with airplane mode turned on -> reload -> all progress preserved -> reconnect -> server successfully synced.
- [ ] **Typing Accuracy**: Engine matches standard net WPM calculation: $((\text{all characters} / 5) - \text{uncorrected errors}) / \text{time in minutes}$.

