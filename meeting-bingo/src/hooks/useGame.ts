import { useCallback, useContext, useMemo, useRef } from 'react';
import { GameContext } from '../context/GameContext';
import { generateCard } from '../lib/cardGenerator';
import { getNearBingoLine } from '../lib/bingoChecker';
import type { CategoryId } from '../types';

/**
 * Primary game hook exposing all game actions and derived state for the current session.
 * Must be used inside a GameProvider; throws if context is missing.
 * @returns Game state plus action handlers: `startSetup`, `selectCategory`, `fillSquare`,
 *   `autoFillWord`, `getAlreadyFilled`, `newGame`, `resetGame`, and derived `filledCount`,
 *   `nearBingoLine`, `winningSquareIds`.
 */
export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  const { state, dispatch } = ctx;

  // Scoped to the game instance — reset on every new game / Play Again
  const alreadyFilledRef = useRef(new Set<string>());

  const startSetup = useCallback(() => {
    dispatch({ type: 'START_SETUP' });
  }, [dispatch]);

  const selectCategory = useCallback(
    (categoryId: CategoryId) => {
      alreadyFilledRef.current.clear();
      const card = generateCard(categoryId);
      dispatch({ type: 'SELECT_CATEGORY', categoryId, card });
    },
    [dispatch],
  );

  const fillSquare = useCallback(
    (row: number, col: number, isAutoFilled = false) => {
      dispatch({ type: 'FILL_SQUARE', row, col, isAutoFilled });
    },
    [dispatch],
  );

  // Called by speech detection — handles deduplication via alreadyFilledRef
  const autoFillWord = useCallback(
    (word: string): boolean => {
      if (!state.card) return false;
      const key = word.toLowerCase();
      if (alreadyFilledRef.current.has(key)) return false;

      const sq = state.card.squares
        .flat()
        .find((s) => !s.isFreeSpace && !s.isFilled && s.word.toLowerCase() === key);
      if (!sq) return false;

      alreadyFilledRef.current.add(key);
      dispatch({ type: 'FILL_SQUARE', row: sq.row, col: sq.col, isAutoFilled: true });
      return true;
    },
    [state.card, dispatch],
  );

  const getAlreadyFilled = useCallback(() => alreadyFilledRef.current, []);

  const newGame = useCallback(() => {
    alreadyFilledRef.current.clear();
    dispatch({ type: 'NEW_GAME' });
  }, [dispatch]);

  const resetGame = useCallback(() => {
    alreadyFilledRef.current.clear();
    dispatch({ type: 'RESET' });
  }, [dispatch]);

  const filledCount = useMemo(() => {
    if (!state.card) return 0;
    return state.card.squares.flat().filter((sq) => sq.isFilled && !sq.isFreeSpace).length;
  }, [state.card]);

  const nearBingoLine = useMemo(() => {
    if (!state.card || state.status !== 'playing') return null;
    const result = getNearBingoLine(state.card);
    if (!result || result.maxFilled < 4) return null;
    return result;
  }, [state.card, state.status]);

  const winningSquareIds = useMemo(() => {
    const ids = new Set<string>();
    state.winningLines.forEach((line) => {
      line.squares.forEach(({ row, col }) => ids.add(`${row}-${col}`));
    });
    return ids;
  }, [state.winningLines]);

  return {
    state,
    startSetup,
    selectCategory,
    fillSquare,
    autoFillWord,
    getAlreadyFilled,
    newGame,
    resetGame,
    filledCount,
    nearBingoLine,
    winningSquareIds,
  };
}
