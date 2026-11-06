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
- [x] **Key Progression Ladder**:
  - Stage 1: Home row anchors (`f`, `j`, `d`, `k`, `s`, `l`, `a`, `;`).
  - Stage 2: Center/Reach keys (`g`, `h`, `r`, `u`, `e`, `i`, `t`, `y`).
  - Stage 3: Top row & Bottom row keys (`q`, `w`, `o`, `p`, `z`, `x`, `c`, `v`, `b`, `n`, `m`).
  - Stage 4: Capitals & Punctuation (`Shift`, commas, periods, quotes).
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
- [x] **Hands & Finger Guide Component**:
  - Visual hand representation indicating which finger (e.g., Left Index, Right Ring) should strike the next key.
- [x] **"Hardcore Mode"**:
  - Toggle to hide the visual keyboard or mask upcoming characters to force physical muscle memory.

### Phase 5: Audio Feedback System
- [x] **Web Audio API Engine**:
  - Synthesize low-latency click sounds or load audio buffers for mechanical switches (Cherry MX Blue, Brown, Red, and Typewriter).
  - Sub-5ms sound trigger on keydown.
  - Distinct subtle audio cue on mistake / invalid character.

### Phase 6: Local-First Storage (Dexie.js)
- [ ] **IndexedDB Schema**:
  - `sessions`: Completed typing sessions with detailed metrics and raw key logs.
  - `keyProgress`: Aggregated stats per key (confidence, accuracy, attempts).
  - `syncQueue`: Offline mutations awaiting server sync.
  - `userSettings`: Local preferences (theme, audio, layout, target WPM).
- [ ] **Reactive Hooks**: Connect Dexie tables to UI via `useLiveQuery` for zero-lag reactivity.

### Phase 7: Backend Synchronization & PostgreSQL (Drizzle ORM)
- [ ] **Drizzle Schema Definition**:
  - Tables: `users`, `sessions`, `key_statistics`, `stage_progress`.
- [ ] **Sync Protocol**:
  - Implement `/api/sync/sessions` batch endpoint with idempotent upserts (`sessionId` UUID).
  - Client-side `SyncManager` with `navigator.onLine` auto-reconnect and periodic sync.
- [ ] **Analytics API**:
  - Endpoints for global and personal progress trends, speed evolution, and heatmaps.

### Phase 8: UI Dashboard, Analytics & Responsive Polish
- [ ] **Typing Canvas UI**: Smooth caret animation, active line rendering, mistake coloration.
- [ ] **Analytics Dashboard**:
  - Keyboard Heatmap: Color keys by error rate / speed (Green -> Yellow -> Red).
  - Progress line charts: WPM & Accuracy over time.
- [ ] **Mobile Responsiveness**:
  - Responsive scaling for tablet/mobile screens.
  - Detection for external physical/Bluetooth keyboard on mobile with fallback theory/review screen.

---

## Verification & Quality Gates
- [ ] **Performance**: 60fps input loop with $< 8\text{ms}$ total keystroke-to-render latency.
- [ ] **Offline Resilience**: Practice 5 lessons with airplane mode turned on -> reload -> all progress preserved -> reconnect -> server successfully synced.
- [ ] **Typing Accuracy**: Engine matches standard net WPM calculation: $((\text{all characters} / 5) - \text{uncorrected errors}) / \text{time in minutes}$.

