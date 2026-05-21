# Meeting Bingo — Implementation Plan

**Version**: 1.1
**Date**: May 21, 2026

---

## Review Summary

Reviewed: May 21, 2026 | Reviewers: VP Product, VP Engineering, VP Design

### Changes Applied

| # | Change |
|---|--------|
| 1 | Rewrote UXR item #3 with distinct guidance for the second auto-fill moment (near-BINGO tension begins) |
| 2 | Added `useRef` requirement for `isListening` flag in `useSpeechRecognition` to prevent stale closure in `onend` |
| 3 | Specified `alreadyFilled` Set lifecycle: scoped to game instance, reset on new game / Play Again |
| 4 | Unified word-matching to `\b`-boundary regex for both single words and multi-word phrases |
| 5 | Added accessibility requirements: keyboard navigation, ARIA labels, live-region announcements for auto-fills |
| 6 | Resolved contradiction: mobile 375px layout promoted to P0 to match Acceptance Criteria |
| 7 | Defined `GameContext` vs `useGame` boundary: Context owns serializable state; hook owns actions and derived values |
| 8 | Updated `bingoChecker` spec to return *all* winning lines, not just the first |
| 9 | Changed transcript display from "last 100 characters" to a scroll-anchored 3-line view to reduce visual churn |
| 10 | Changed mic status indicator from red dot to icon + color (e.g., microphone icon + color tint) for WCAG 2.1 AA |
| 11 | Added error path for mic permission denied: show inline banner with manual-mode fallback instructions |
| 12 | Added `npm install -D @types/canvas-confetti` to Phase 1 install commands |

### Unresolved Items

None — all identified issues addressed in this revision.

---

**Version 1.0**
**Date**: May 21, 2026
**Source Documents**: meeting-bingo-architecture.md, meeting-bingo-prd.md, meeting-bingo-uxr.md
**Target Build Time**: 90 minutes (MVP)

---

## Context

Meeting Bingo is a browser-based bingo game that auto-fills squares when corporate buzzwords are detected via live audio transcription. Zero cost, no backend, no accounts. The three planning documents are aligned: architecture defines the stack and code patterns, the PRD defines features and acceptance criteria, and the UXR defines user needs and the key moments that must delight.

---

## Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React 18 + TypeScript | Strong typing, workshop familiarity |
| Build | Vite | Fast HMR, minimal config |
| Styling | Tailwind CSS | Rapid utility-first UI |
| Speech | Web Speech API | Free, browser-native, no API keys |
| Animation | canvas-confetti | Lightweight, no dependencies |
| State | React useState + Context | Simple, no extra deps |
| Persistence | localStorage | No backend required |
| Deploy | Vercel | Free tier, instant deploys |

---

## Feature Scope

### P0 — Must ship (core game loop)
- 5×5 bingo card generation (24 random words + FREE center)
- 3 buzzword category packs: Agile, Corporate, Tech (40+ words each)
- Web Speech API transcription with continuous listening
- Auto-fill squares on word detection (within 500ms of detection)
- Manual tap toggle fallback for missed words
- BINGO detection across 5 rows, 5 columns, and 2 diagonals
- Win celebration: confetti animation, highlighted winning line, no sound by default

### P1 — Ship if time allows
- Shareable result (clipboard copy + native share sheet on mobile)
- Game state persistence via localStorage

### P0 addition (promoted from P1)
- Mobile responsive layout (375px minimum width) — promoted to P0 to match Acceptance Criteria requirement

### P2 — Post-MVP
- Light/dark theme toggle

---

## UXR Design Constraints

Non-negotiable findings from user research that affect implementation decisions:

1. **Privacy message on landing page** — "Audio processed locally. Never recorded." The Maya persona has microphone anxiety; this message must be visible before the mic permission prompt appears.
2. **First auto-fill is the delight moment** — The toast notification and square animation must fire immediately and feel satisfying. This is what converts skeptical users from "this is a gimmick" to "this actually works."
3. **Second auto-fill signals potential victory** — By the second fill, the user's mental model shifts from "does this work?" to "could I actually win?" The progress counter should become more prominent and near-BINGO hint logic should activate earlier (3+ fills in a single line, not just 1 away).
4. **Celebration must be discreet** — Confetti yes, sound off by default. The user is in a live meeting and cannot cheer aloud.
5. **Minimal gameplay UI** — Card + transcript panel only during the game. Nothing that competes for attention with the meeting.
6. **Near-BINGO tension** — Show a progress indicator ("X/24 filled") and a visual hint when one square away from winning.

---

## File Structure

```
meeting-bingo/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx
    ├── App.tsx                      # Screen router: landing | category | game | win
    ├── index.css                    # Tailwind imports
    ├── types/
    │   └── index.ts                 # All TypeScript interfaces
    ├── data/
    │   └── categories.ts            # 3 category word packs (40+ words each)
    ├── context/
    │   └── GameContext.tsx          # Global game state provider
    ├── lib/
    │   ├── cardGenerator.ts         # Fisher-Yates shuffle, 5×5 grid builder
    │   ├── bingoChecker.ts          # Check all 12 winning lines
    │   ├── wordDetector.ts          # Transcript matching + word aliases
    │   └── shareUtils.ts            # Clipboard / native share
    ├── hooks/
    │   ├── useSpeechRecognition.ts  # Web Speech API wrapper with auto-restart
    │   ├── useGame.ts               # Game state + actions
    │   ├── useBingoDetection.ts     # Win condition checker
    │   └── useLocalStorage.ts       # Persistence helper
    └── components/
        ├── LandingPage.tsx          # Hero, privacy message, New Game CTA
        ├── CategorySelect.tsx       # 3 category cards with sample word preview
        ├── GameBoard.tsx            # Game container — wires all hooks together
        ├── BingoCard.tsx            # 5×5 grid renderer
        ├── BingoSquare.tsx          # Individual square (4 visual states)
        ├── TranscriptPanel.tsx      # Live transcript + detected word chips
        ├── GameControls.tsx         # Mic toggle + progress counter
        ├── WinScreen.tsx            # Confetti, stats, share button
        └── ui/
            ├── Button.tsx
            ├── Card.tsx
            └── Toast.tsx
```

---

## Implementation Phases

### Phase 1 — Foundation (20 min)

**Goal**: Working project scaffold with types and data.

1. Scaffold: `npm create vite@latest meeting-bingo -- --template react-ts`
2. Install dependencies:
   ```bash
   npm install canvas-confetti
   npm install -D tailwindcss postcss autoprefixer @types/canvas-confetti
   npx tailwindcss init -p
   ```
3. Create `src/types/index.ts` — define all interfaces: `BingoSquare`, `BingoCard`, `GameState`, `GameStatus`, `WinningLine`, `SpeechRecognitionState`, `Toast`, `CategoryId`, `Category`
4. Create `src/data/categories.ts` — 3 category packs with 40+ words each (Agile, Corporate, Tech)
5. Configure Tailwind in `index.css` and `tailwind.config.js`

**Deliverable**: `npm run dev` starts without errors; types compile cleanly.

---

### Phase 2 — Core Game (30 min)

**Goal**: Fully playable card game without speech.

1. `src/lib/cardGenerator.ts`
   - Fisher-Yates shuffle
   - Pick 24 words from selected category
   - Build 5×5 `BingoSquare[][]` with `isFreeSpace: true` at `[2][2]` (pre-filled)

2. `src/lib/bingoChecker.ts`
   - Check all 12 lines: 5 rows + 5 columns + 2 diagonals
   - Return **all** `WinningLine[]` found (not just first) — multiple lines can be completed simultaneously

3. `src/components/BingoSquare.tsx`
   - 4 visual states: default / filled / free space / winning
   - Manual click toggles `isFilled`
   - `isAutoFilled` drives a pulse animation
   - Keyboard accessible: `role="button"`, `tabIndex={0}`, `onKeyDown` handler for Enter/Space
   - `aria-label` includes word and filled state (e.g., "synergy, filled")

4. `src/components/BingoCard.tsx`
   - Renders 5×5 grid
   - Passes `isWinningSquare` boolean to each square

5. `src/components/LandingPage.tsx`
   - Headline + tagline
   - Privacy message: "Audio processed locally. Never recorded."
   - "New Game" CTA button

6. `src/components/CategorySelect.tsx`
   - 3 category cards: icon, name, description, 3 sample words preview
   - Clicking generates card and transitions to game screen

7. `src/App.tsx`
   - Screen state machine: `landing → category → game → win`
   - Handlers: `handleStart`, `handleCategorySelect`, `handleWin`, `handlePlayAgain`, `handleBackToHome`

8. Wire `useBingoDetection` to fire after every square fill

**Deliverable**: Can pick category, see card, tap squares manually, and trigger a BINGO.

---

### Phase 3 — Speech Recognition (25 min)

**Goal**: Auto-fill squares from live audio.

1. `src/hooks/useSpeechRecognition.ts`
   - Wrap `window.SpeechRecognition || window.webkitSpeechRecognition`
   - Set `continuous = true`, `interimResults = true`, `lang = 'en-US'`
   - Track listening state with `useRef<boolean>` (not useState) for the `onend` auto-restart check — React state is stale inside closures
   - Auto-restart in `onend` handler if `isListeningRef.current` is still true
   - Expose: `startListening`, `stopListening`, `resetTranscript`, `isSupported`

2. `src/lib/wordDetector.ts`
   - Case-insensitive; normalize curly quotes
   - Use `\b`-boundary regex for **all** matches (both single words and multi-word phrases) to prevent partial matches (e.g., "pivot" must not match inside "pivotal")
   - `WORD_ALIASES` map: `ci/cd`, `mvp`, `roi`, `api`, `devops` → common spoken variants
   - `alreadyFilled: Set<string>` scoped to the active game instance — reset on new game or Play Again; passed in as a parameter or owned by `useGame`, not module-level

3. `src/components/TranscriptPanel.tsx`
   - Mic status indicator: microphone icon + color tint (icon+color, not color-only) — WCAG 2.1 AA compliance
   - Scroll-anchored 3-line transcript view (not raw last-100-characters) to reduce visual churn during a live meeting
   - Detected-word chips (green badges) for last 5 auto-filled words; live-region `aria-live="polite"` on chip container for screen readers

4. `src/components/GameControls.tsx`
   - Mic toggle button (start/stop listening)
   - "X/24 filled" progress counter
   - Near-BINGO hint: highlight closest line when 1 square away

5. Wire in `GameBoard.tsx`
   - On each new final transcript segment → `detectWordsWithAliases` → fill matching squares → check for bingo
   - Show toast on each auto-fill

**Deliverable**: Speaking a buzzword auto-fills the matching square with toast notification.

---

### Phase 4 — Polish & Deploy (15 min)

**Goal**: Satisfying win state, share functionality, and live URL.

1. `src/components/WinScreen.tsx`
   - Fire `canvas-confetti` on mount
   - Display winning line highlighted on a static card snapshot
   - Stats: time to BINGO, winning word, total squares filled, category played
   - Share button + "Play Again" + "Back to Home"

2. `src/lib/shareUtils.ts`
   - Build share text: emoji card summary + result stats + link
   - Use `navigator.share()` on mobile (triggers native share sheet)
   - Fall back to `navigator.clipboard.writeText()` on desktop

3. `src/components/ui/Toast.tsx`
   - Auto-dismiss after 2 seconds
   - Shows detected word: "✨ synergy detected!"

4. `src/hooks/useLocalStorage.ts`
   - Generic typed hook: `useLocalStorage<T>(key, initialValue)`
   - Persist `GameState`; restore on page reload

5. Deploy: `vercel --prod` from the `meeting-bingo/` directory

**Deliverable**: End-to-end flow works; app is live on Vercel.

---

## Key Implementation Notes

- **Feature detection**: Check `SpeechRecognition` support on mount. If unsupported, hide mic controls and show "Manual mode only — your browser doesn't support speech recognition" banner. Chrome is the primary target.
- **Mic permission denied**: If the user blocks mic access, the `onerror` handler fires with `error === 'not-allowed'`. Show an inline banner: "Microphone access blocked — tap squares manually to play." Hide mic toggle; keep manual mode fully functional.
- **Auto-restart**: Web Speech API stops after silence. The `onend` handler must call `recognition.start()` again if `isListeningRef.current` is still true. Use `useRef`, not `useState`, to avoid stale closure.
- **Word deduplication**: `alreadyFilled` Set is owned by `useGame` and reset on every new game. Pass it into `detectWordsWithAliases` as a parameter so it's never module-scoped.
- **Free space**: `[2][2]` starts with `isFilled: true`, `isFreeSpace: true`. It counts toward the 4 winning lines that pass through center.
- **No audio on win**: Only `canvas-confetti` — do not call `AudioContext` or play any sounds in the win path. User is in a live meeting.
- **GameContext vs useGame boundary**: `GameContext` owns the serializable `GameState` (card, filled squares, status, category). `useGame` owns actions (`fillSquare`, `newGame`, `resetGame`) and derived values (`filledCount`, `nearBingo`). Never put actions in Context directly — components import `useGame` for interactivity.

---

## Verification Checklist

### Core Loop
- [ ] Card generates with exactly 24 unique words + FREE center
- [ ] Regenerating card produces a different selection of words
- [ ] Category preview shows sample words before selection
- [ ] Privacy message visible on landing page before mic is requested
- [ ] Mic permission prompt appears when enabling transcription
- [ ] Transcript panel shows live text within 1 second of enabling
- [ ] Speaking a buzzword auto-fills the matching square within 500ms
- [ ] Toast notification appears on each auto-fill
- [ ] Manual tap fills and unfills squares
- [ ] BINGO detected correctly for rows, columns, and both diagonals
- [ ] Winning line highlighted on card
- [ ] Confetti plays on win; no audio fires
- [ ] Share button copies result to clipboard (or opens native share on mobile)
- [ ] Game state survives page refresh (localStorage)

### Acceptance Criteria (from PRD)
- [ ] Card load < 2 seconds
- [ ] Speech recognition starts < 1 second after enabling
- [ ] Auto-fill detection accuracy > 70% in manual test
- [ ] Layout correct at 375px width (mobile)
- [ ] Works on Chrome (primary), Firefox, Safari, Edge

---

## Out of Scope (MVP)

- User accounts / authentication
- Multiplayer real-time sync
- Custom buzzword creation
- Sound effects
- Game history beyond current session
- Leaderboards
- Calendar integration
- Backend server / database
