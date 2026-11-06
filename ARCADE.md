# Keyboard Hero: Arcade Mode Specification & Game Design Document

## 1. Overview & Vision
**Arcade Mode** transforms pure typing practice into high-intensity, gamified challenges that test burst speed, rhythm under pressure, and flawless accuracy. While the Guided Curriculum (Stages 1–12) focuses on systematic muscle memory development, Arcade Mode tests real-time agility through arcade-style gameplay loops, retro sound effects, and competitive leaderboards.

---

## 2. Mini-Game 1: "Redline RPM" (Highway Speedometer Sprint)

### Concept & Fantasy
You are driving a high-performance sports car on an open highway. To keep the engine in the turbo boost zone, your typing speed must stay above a designated **Redline WPM**. Dropping below the redline causes the RPM gauge to fall into the yellow/blue zone, draining your turbo reservoir. Hold the engine past the redline for $X$ consecutive seconds to cross the finish line and win.

### Core Mechanics
- **Dynamic Speedometer Needle**: An analog and digital speedometer dial (0 to 140+ WPM) rendered with SVG / Canvas. The needle responds in real time to the user's rolling 3-second net WPM.
- **The Redline Threshold**: A visible glowing marker on the speedometer (e.g., 50 WPM for Amateur, 75 WPM for Pro, 100 WPM for Hypercar).
- **Hold Time Requirement**: Once the needle enters the red zone, a **Sustain Timer** counts up (e.g., "Hold for 15.0s").
- **Penalty for Dropping**: If WPM drops below the threshold, the sustain timer rapidly freezes and decays, and the car engine coughs / downshifts with audio feedback.
- **Continuous Flow Text**: Seamless infinite stream of words or rolling sentences so the user never stops typing.

### Visual & Audio Design
- **Gauge Visuals**:
  - Radial tachometer with 3 zones: Safe (Blue/Neutral), Powerband (Amber), Redline (Vibrant Red/Crimson with neon glow).
  - Nitro boost flame particles emitted when exceeding redline by $+10$ WPM.
  - Camera shake effect at high velocities ($>80$ WPM).
- **Sound Effects (Web Audio Synth)**:
  - Low-frequency engine roar pitch modulated by current WPM.
  - Turbo blow-off valve sound when shifting words.
  - Downshift / screech sound if dipping below redline.

### Difficulty Tiers
| Tier | Vehicle Class | Redline WPM | Sustain Duration | Allowed Buffer Drops |
| :--- | :--- | :--- | :--- | :--- |
| **Amateur** | Street Tuner | 35 WPM | 10 Seconds | 2 drops allowed |
| **Sport** | GT Coupe | 50 WPM | 15 Seconds | 1 drop allowed |
| **Supercar** | V12 Prototype | 75 WPM | 20 Seconds | 0 drops (Strict) |
| **Hypercar** | Formula Electric | 100+ WPM | 25 Seconds | 0 drops (Instant reset) |

---

## 3. Mini-Game 2: "Bomb Defusal Protocol" (Crisis Countdown)

### Concept & Fantasy
A suitcase bomb with a glowing digital countdown clock is armed in front of you. To cut the correct wires and defuse the explosive payload, you must accurately type randomized cryptographic passphrases, terminal overrides, and security codes before the clock strikes zero. Every single mistake is penalized with a severe time deduction!

### Core Mechanics
- **Ticking Countdown Clock**: Starts with a strict time limit (e.g., 30.00 seconds with millisecond precision).
- **Typo Time Penalty**: Every typo or invalid keypress instantly penalizes the user by **$-2.0$ to $-5.0$ seconds** from the clock!
  - Visual: The clock flashes bright red with a `-3s` float-up damage badge.
  - Audio: Warning alarm siren and buzzer trigger.
  - Screen Shake: Heavy physical impact shake to test composure under stress.
- **Sequential Stages (Defusal Steps)**:
  - Phase 1: Disarm code (lowercase alphanumeric sequence).
  - Phase 2: Wire cut instructions (e.g., `cut wire: blue-cyan-red`).
  - Phase 3: Encryption hash bypass (mixed symbols, brackets, and uppercase keys).
- **Win Condition**: Completely type all defusal sequences before the timer hits `00:00.00`.
- **Failure Condition**: Timer hits zero -> Screen flashes white with explosive detonation animation and Game Over siren.

### Visual & Audio Design
- **Bomb Prop UI**:
  - Industrial C4 suitcase briefcase with LED segment display, bundled wires, and blinking status lights.
  - Three colored wires (Yellow, Green, Red) that spark and get snipped as phrases are completed.
- **Sound Effects (Web Audio Synth)**:
  - Fast-paced heartbeat and rhythmic digital countdown beep accelerating as time runs low.
  - Sharp electric zap on typo penalty.
  - Loud click / pneumatic hiss on successful disarm.
  - Boom / detonation explosion sound on failure.

### Difficulty Tiers
| Tier | Starting Time | Penalty per Typo | Phrases to Defuse | Character Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Recruit** | 45 Seconds | $-1.5\text{s}$ | 3 Phrases | Letters only |
| **Agent** | 30 Seconds | $-3.0\text{s}$ | 4 Phrases | Letters + Numbers |
| **Special Forces** | 22 Seconds | $-4.0\text{s}$ | 5 Phrases | Mixed Case + Punctuation |
| **Impossible** | 15 Seconds | $-5.0\text{s}$ | 6 Phrases | Complex Code & Symbols |

---

## 4. Brainstorming Additional Mini-Games (Arcade Roadmap)

### Mini-Game 3: "Word Invaders" (Retro Space Defense)
- **Gameplay**: Alien spaceships and asteroids descend from the top of the screen towards your defense cannons. Each enemy displays a target word overhead.
- **Mechanics**: Typing a word fires a plasma laser that vaporizes the target. Faster typing prevents invaders from reaching the city shields.
- **Special Items**:
  - `[EMP]`: Destroys all enemies on screen.
  - `[FREEZE]`: Slows down descending words for 5 seconds.
  - Multi-word boss battles that require multi-sentence typing while missiles drop.

### Mini-Game 4: "Rhythm DJ / Beat Match" (Guitar Hero Style)
- **Gameplay**: Musical typing tracks where letters travel down 4 or 8 vertical lanes in rhythm with a background tempo (BPM).
- **Mechanics**: Striking the key right when the note enters the target zone rewards "PERFECT", "GREAT", or "MISS".
- **Focus**: Trains **dwell time consistency** and fluid rhythmic typing instead of erratic bursting.

### Mini-Game 5: "Terminal Hacker" (Matrix Cypher Infiltration)
- **Gameplay**: Fast green-on-black terminal screen simulating a cyber infiltration.
- **Mechanics**: Blocks of code and system scripts scroll upwards. The user must keep typing continuous code snippets to prevent the "Trace Route Security" bar from reaching 100%.
- **Focus**: Real-world programming syntax, indentation, and brackets (`{`, `}`, `=>`, `const`, `return`).

### Mini-Game 6: "Ghost Drag Race" (Shadow Duel)
- **Gameplay**: Two cars on a 1/4-mile drag strip. Top lane is the player; bottom lane is a "Ghost Car" representing the user's best historical run or a benchmark bot (e.g. 60 WPM bot).
- **Mechanics**: Visual real-time distance separation showing whether you are pulling ahead or falling behind your personal best.

---

## 5. Technical Architecture & Implementation Plan

### 1. Store & State Management
- Add dedicated `useArcadeStore` (`src/stores/use-arcade-store.ts`) or extend state for:
  - `activeGame: 'redline' | 'defuse' | 'invaders' | null`
  - `gameStatus: 'ready' | 'playing' | 'paused' | 'won' | 'lost'`
  - `redlineState`: `{ targetWpm, currentWpm, holdSecondsRemaining, totalHoldRequired, isRedlining }`
  - `defuseState`: `{ timeRemainingMs, penaltyDeductions, currentPhraseIndex, phrases, isDetonated }`

### 2. IndexedDB Schema Expansion
- Extend Dexie.js database (`src/local-db/client-db.ts`) with `arcadeScores` table:
  ```ts
  interface ArcadeScoreRecord {
    id: string;
    gameId: 'redline' | 'defuse';
    difficulty: string;
    score: number; // e.g. final WPM or seconds remaining
    wpm: number;
    accuracy: number;
    achievedAt: string;
  }
  ```

### 3. Audio Synth Enhancements
- Expand Web Audio API synthesizer (`src/core/audio/mechanical-synth.ts` or `src/core/audio/arcade-audio.ts`) with procedurally generated sound effects:
  - Countdown clock bleep
  - Typo buzzer
  - Engine RPM pitch bend oscillator
  - Explosion & defusal chime

### 4. Routes & UI Layout
- Route `/arcade`: Arcade Hub selection menu with retro neon aesthetic and cards for each game mode.
- Route `/arcade/redline`: Fullscreen vehicle dashboard with animated SVG speedometer.
- Route `/arcade/defuse`: High-tension C4 briefcase interface with digital LED clock and wire mechanics.

