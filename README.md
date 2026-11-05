# ⌨️ Keyboard Hero

> **Master blind touch-typing through muscle memory isolation and adaptive learning.**  
> An ultra-responsive, offline-first web application built with Next.js 15, React 19, Dexie.js (IndexedDB), and PostgreSQL via Drizzle ORM.

---

## 🎯 About The Project

**Keyboard Hero** is designed to take typists from hunting-and-pecking to effortless blind touch-typing. Unlike generic typing tests that throw arbitrary paragraphs at beginners, Keyboard Hero employs **muscle memory isolation** (inspired by *Keybr* and *TypingClub*):

1. **Progressive Key Unlocking**: Begins with the home-row anchors (`F` and `J`) and systematically unlocks new letters only after reaching high accuracy and consistency thresholds.
2. **Adaptive Pseudo-Word Generation**: An algorithm detects your slowest and error-prone keys, dynamically generating pronounceable phonetic exercises heavily weighted toward your weakest letters.
3. **Sub-Millisecond Input Engine**: Pure TypeScript engine executing with $< 8\text{ms}$ input-to-render latency and high-precision `performance.now()` timestamping.
4. **Offline-First Resilience**: Full PWA support. Practice uninterrupted on airplanes or unstable connections; all progress is saved locally in **Dexie.js (IndexedDB)** and silently synchronized to **PostgreSQL** when reconnected.

---

## 🏗️ Architecture Overview

```mermaid
graph TD
    UI[Next.js 15 App / React 19 PWA] --> Store[Zustand Stores]
    Store --> Engine[Pure TypeScript Typing Engine]
    Store --> Curriculum[Adaptive Keybr-style Curriculum]
    Store --> Audio[Web Audio API Mechanical Synth]
    Store --> LocalDB[(Dexie.js / IndexedDB)]

    subgraph Offline Sync Engine
        LocalDB --> Queue[Sync Queue Manager]
        Queue -->|When Online| API[/api/sync/sessions]
    end

    API --> Drizzle[Drizzle ORM]
    Drizzle --> Postgres[(PostgreSQL Database)]
```

---

## ⚡ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | **Next.js 15 (App Router)** | Full-stack architecture, unified TypeScript models, and API route handlers. |
| **UI Library** | **React 19** | Modern concurrent rendering and server/client component boundaries. |
| **Styling** | **Tailwind CSS + shadcn/ui** | Clean, accessible, dark-mode first aesthetic. |
| **State Management** | **Zustand** | Granular subscriptions outside the React render loop to guarantee zero keystroke lag. |
| **Local Database** | **Dexie.js (IndexedDB)** | High-performance, reactive local persistence for offline sessions. |
| **Offline PWA** | **@serwist/next** | Service worker caching enabling offline access across desktop and mobile. |
| **Backend & ORM** | **PostgreSQL + Drizzle ORM** | Lightweight, type-safe SQL queries with idempotent batch synchronization. |
| **Audio Engine** | **Web Audio API** | Real-time mechanical switch sound synthesis with $< 5\text{ms}$ trigger latency. |

---

## 📂 Project Structure

```text
keyboard-hero/
├── docs/
│   ├── BACKEND_GUIDELINES.md   # Server layering, Drizzle schema rules & API contracts
│   └── FRONTEND_GUIDELINES.md  # Client standards, Zustand patterns & latency guarantees
├── src/
│   ├── app/                    # Next.js App Router (pages & API routes)
│   ├── components/             # Reusable UI components (keyboard, canvas, analytics)
│   ├── core/                   # Pure TypeScript logic (zero DOM dependencies)
│   │   ├── engine/             # Keystroke state machine & WPM math
│   │   ├── curriculum/         # Key progression stages & pseudo-word generator
│   │   └── audio/              # Mechanical keyboard sound synthesizer
│   ├── db/                     # Drizzle ORM schema, migrations & PostgreSQL client
│   ├── local-db/               # Dexie.js schema & offline background sync manager
│   ├── stores/                 # Zustand domain stores
│   └── types/                  # Shared TypeScript interfaces catalog
├── PLAN.md                     # Master 8-phase development roadmap
└── README.md                   # Project overview & documentation
```

---

## 🗺️ Roadmap & Implementation Plan

Development is tracked through our comprehensive **[PLAN.md](PLAN.md)** across 8 phases:

- [x] **Phase 0**: Project Planning, Architecture Design & TypeScript Interface Catalog
- [ ] **Phase 1**: Project Scaffolding (Next.js 15, Tailwind, Dexie, Drizzle)
- [ ] **Phase 2**: Pure TypeScript Typing Engine & High-Precision Metrics Suite
- [ ] **Phase 3**: Adaptive Learning Algorithm (Progressive Key Unlocking & Word Generator)
- [ ] **Phase 4**: Interactive Virtual Keyboard & Hand Placement Guide
- [ ] **Phase 5**: Web Audio Mechanical Switch Synthesizer
- [ ] **Phase 6**: Offline-First Storage Engine (Dexie.js)
- [ ] **Phase 7**: Backend Synchronization & PostgreSQL Integration (Drizzle ORM)
- [ ] **Phase 8**: Analytics Dashboard (Key Heatmaps, Trends, Streaks) & Mobile Polish

---

## 📐 Development Guidelines

To ensure code quality and consistency across both server and client:
- **[Frontend Guidelines](docs/FRONTEND_GUIDELINES.md)**: Rules for sub-millisecond input performance, Zustand selector usage, and offline Dexie queries.
- **[Backend Guidelines](docs/BACKEND_GUIDELINES.md)**: Standards for 3-tier layering, Zod validation, idempotent sync handlers, and Drizzle migrations.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
