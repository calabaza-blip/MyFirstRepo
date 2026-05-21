import { createContext, useEffect, useReducer, type ReactNode } from 'react';
import type { BingoCard, CategoryId, GameState, WinningLine } from '../types';

const STORAGE_KEY = 'meeting-bingo-state';

function loadPersistedState(fallback: GameState): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as GameState;
    // Never restore a mid-win state; treat it as a fresh setup prompt
    if (parsed.status === 'won') return { ...parsed, status: 'playing' };
    return parsed;
  } catch {
    return fallback;
  }
}

type GameAction =
  | { type: 'START_SETUP' }
  | { type: 'SELECT_CATEGORY'; categoryId: CategoryId; card: BingoCard }
  | { type: 'FILL_SQUARE'; row: number; col: number; isAutoFilled: boolean }
  | { type: 'SET_WIN'; winningLines: WinningLine[] }
  | { type: 'NEW_GAME' }
  | { type: 'RESET' };

const initialState: GameState = {
  status: 'idle',
  categoryId: null,
  card: null,
  winningLines: [],
  startedAt: null,
  wonAt: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_SETUP':
      return { ...state, status: 'setup' };

    case 'SELECT_CATEGORY':
      return {
        ...state,
        status: 'playing',
        categoryId: action.categoryId,
        card: action.card,
        winningLines: [],
        startedAt: Date.now(),
        wonAt: null,
      };

    case 'FILL_SQUARE': {
      if (!state.card) return state;
      const squares = state.card.squares.map((row) =>
        row.map((sq) => {
          if (sq.row !== action.row || sq.col !== action.col || sq.isFreeSpace) return sq;
          const newFilled = action.isAutoFilled ? true : !sq.isFilled;
          return {
            ...sq,
            isFilled: newFilled,
            isAutoFilled: action.isAutoFilled ? true : sq.isAutoFilled,
            filledAt: newFilled ? (sq.filledAt ?? Date.now()) : null,
          };
        }),
      );
      return { ...state, card: { ...state.card, squares } };
    }

    case 'SET_WIN':
      return { ...state, status: 'won', winningLines: action.winningLines, wonAt: Date.now() };

    case 'NEW_GAME':
      return { ...initialState, status: 'setup' };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, loadPersistedState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota / private-browsing errors
    }
  }, [state]);

  return <GameContext.Provider value={{ state, dispatch }}>{children}</GameContext.Provider>;
}
