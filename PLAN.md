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
- [ ] **Mobile Responsiveness & PWA**:
  - [ ] Responsive scaling for tablet/mobile screens.
  - [ ] Detection for external physical/Bluetooth keyboard on mobile with fallback theory/review screen.

---

## Verification & Quality Gates
- [ ] **Performance**: 60fps input loop with $< 8\text{ms}$ total keystroke-to-render latency.
- [ ] **Offline Resilience**: Practice 5 lessons with airplane mode turned on -> reload -> all progress preserved -> reconnect -> server successfully synced.
- [ ] **Typing Accuracy**: Engine matches standard net WPM calculation: $((\text{all characters} / 5) - \text{uncorrected errors}) / \text{time in minutes}$.

