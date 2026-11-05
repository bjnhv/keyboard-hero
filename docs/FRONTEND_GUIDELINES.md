# Frontend Development Guidelines & Coding Standards

This document establishes the architecture rules, performance requirements, component design standards, and state management patterns for all client-side code in this project.

---

## 1. Architectural Philosophy: Offline-First & High Performance

The core typing loop is real-time and performance-critical. A typing speed of 120 WPM produces ~10 keystrokes per second; frame drops or latency directly degrade the learning experience.

### Core Principles
1. **Zero-Lag Input Loop**: Typing input capture and metric updates must run with $< 8\text{ms}$ latency. Avoid re-rendering entire component trees on individual keystrokes.
2. **Offline-First by Default**: Every user action (completing a lesson, unlocking a key, updating settings) writes to **Dexie.js (IndexedDB)** immediately. Network sync happens silently in the background.
3. **Pure Logic Separation**: The typing engine (`src/core/engine/`) and curriculum generator (`src/core/curriculum/`) must be **100% pure TypeScript** with no React or browser DOM imports.

---

## 2. Next.js 15 & Component Structure

### Server vs. Client Components
- **Default to React Server Components (RSC)** for static layouts, static marketing/documentation pages, and server-side data preparation.
- Use `'use client'` strictly when:
  - Consuming browser APIs (`window`, `localStorage`, `IndexedDB`, `navigator.onLine`, `Web Audio API`).
  - Handling event listeners (`keydown`, `keypress`).
  - Managing Zustand stores or interactive UI animations.

```text
src/
├── app/                  # App Router routes & pages
├── components/           # Reusable UI components
│   ├── ui/               # Primitive design system (shadcn/ui style buttons, dialogs)
│   ├── keyboard/         # Virtual keyboard, key caps, hands indicator
│   ├── typing/           # Typing canvas, word stream, caret, live metrics
│   └── analytics/        # Heatmaps, accuracy graphs, progress charts
├── core/                 # PURE TypeScript business logic & algorithms
├── hooks/                # Custom React hooks (e.g. useOnlineStatus, useKeyboardAudio)
├── local-db/             # Dexie.js database & offline sync manager
└── stores/               # Zustand state stores
```

---

## 3. State Management (Zustand & Dexie.js)

### Zustand Rules
- Split stores by domain:
  - `useTypingStore`: Active exercise, input buffer, caret position, live WPM/accuracy.
  - `useCurriculumStore`: Active stage, unlocked letters, confidence scores.
  - `useSettingsStore`: Audio preferences, keyboard layout (QWERTY/Colemak/Dvorak), visual themes.
  - `useSyncStore`: Online status, pending sync count, last sync timestamp.
- **Selective Subscriptions**: Never do `const store = useTypingStore()`. Always select primitive values to prevent cascading re-renders:
  ```tsx
  // GOOD: Only re-renders when currentWord changes
  const currentWord = useTypingStore((state) => state.currentWord);

  // BAD: Re-renders on EVERY single keystroke and timer tick
  const { currentWord, keystrokes, wpm } = useTypingStore();
  ```

### Dexie.js (Offline Client DB) Rules
- Read operations in UI components must use `useLiveQuery` from `dexie-react-hooks`.
- Write operations must run asynchronously without blocking the UI thread.
- Never store ephemeral per-millisecond cursor positions in IndexedDB; only write completed sessions and aggregated key stats.

---

## 4. Real-Time Typing Engine Performance Standards

### High-Precision Timing
- Never use `Date.now()` for calculating WPM or keystroke dwell time. Always use `performance.now()` for sub-millisecond precision.
- Prevent default browser hotkeys when the typing canvas is focused:
  - Intercept `Tab`, `Backspace`, and `Space` to prevent scrolling or navigation.
  - Disable browser spellcheck, autocorrect, and autocomplete on typing input containers:
    ```tsx
    <input
      type="text"
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      spellCheck="false"
      className="opacity-0 absolute inset-0 cursor-default"
    />
    ```

### Sound Effects & Web Audio API
- Audio buffers must be decoded once at application startup or on user interaction.
- Never create a new `AudioContext` per keystroke; use a shared audio context singleton.
- Ensure audio does not block or delay UI rendering.

---

## 5. UI & Styling Guidelines (Tailwind CSS)

- **Mobile & Responsive First**: Design layouts to gracefully fit screens from 375px mobile to 4K ultra-wide monitors.
- **Dark Mode First**: Blind typing tutors are primarily used in dark environments; dark mode should be the default theme with high-contrast text legibility.
- **Color Coding Conventions**:
  - `Correct text`: Muted light gray / foreground (`text-foreground`).
  - `Untyped text`: Subdued low-contrast gray (`text-muted-foreground/40`).
  - `Incorrect text / Error`: Bright red / crimson (`text-red-500` or `text-rose-500`).
  - `Active letter / Caret`: Primary accent (e.g. Amber `#f59e0b` or Cyan `#06b6d4`).
- **Finger Color Indicators**:
  - Color-code keyboard columns corresponding to specific fingers (Pinky, Ring, Middle, Index, Thumbs) using subtle pastel outlines or dots.

---

## 6. Accessibility & Keyboard Navigation

- The entire app must be navigable using **keyboard shortcuts alone**:
  - `Tab + Enter`: Restart test / lesson.
  - `Esc`: Pause test or open quick-settings modal.
  - `Shift + Tab`: Jump between exercises.
- Provide clear ARIA attributes on interactive visual keys (`aria-label`, `role="presentation"` where appropriate).

