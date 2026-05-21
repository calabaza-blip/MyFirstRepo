# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Meeting Bingo** — a browser-based bingo game that auto-fills squares when corporate buzzwords are detected via live audio transcription. Zero-cost, no backend, no user accounts.

Planning documents in the repo root define the full scope:
- `meeting-bingo-prd.md` — feature requirements and acceptance criteria
- `meeting-bingo-architecture.md` — technical design, type definitions, project structure
- `meeting-bingo-implementation-plan.md` — phased build plan (v1.1, reviewed)
- `meeting-bingo-uxr.md` — UX research and key interaction moments

## Stack

| Layer | Choice |
|-------|--------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| Speech | Web Speech API (browser-native, no keys) |
| Animation | canvas-confetti |
| State | React useState + Context |
| Persistence | localStorage |
| Deploy | Vercel |

## Commands

Once the project is scaffolded (the implementation plan uses `npm create vite@latest`):

```bash
npm install          # install dependencies
npm run dev          # start dev server (Vite HMR)
npm run build        # production build → dist/
npm run preview      # serve the production build locally
```

## Architecture

The app is entirely client-side. Key boundaries from `meeting-bingo-architecture.md`:

- **`src/context/GameContext.tsx`** — owns all serializable game state (persisted to localStorage)
- **`src/hooks/useGame.ts`** — owns actions and derived values; consumes GameContext
- **`src/hooks/useSpeechRecognition.ts`** — Web Speech API wrapper; use `useRef` for `isListening` flag to avoid stale closure in the `onend` handler
- **`src/lib/wordDetector.ts`** — word matching uses `\b`-boundary regex for both single words and multi-word phrases
- **`src/lib/bingoChecker.ts`** — returns *all* winning lines (not just the first); checks 5 rows, 5 columns, 2 diagonals
- **`src/data/categories.ts`** — three buzzword packs: Agile, Corporate, Tech (40+ words each)

State flow: `UI / Game Logic / Speech Recognition → GameContext → localStorage`

The `alreadyFilled` Set tracking auto-filled words is scoped to a game instance and must be reset on new game / Play Again.

## Key Implementation Notes

- Mobile layout at 375px minimum width is **P0** (promoted from P1)
- Mic status indicator must use icon + color (not red dot alone) for WCAG 2.1 AA
- Transcript display: scroll-anchored 3-line view (not a raw character limit)
- On mic permission denied: show inline banner with manual-tap fallback instructions
- Accessibility: keyboard navigation, ARIA labels, live-region announcements for auto-fills
