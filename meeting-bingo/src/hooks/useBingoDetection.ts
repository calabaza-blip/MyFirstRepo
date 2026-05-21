import { useContext, useEffect } from 'react';
import { GameContext } from '../context/GameContext';
import { checkBingo } from '../lib/bingoChecker';

/**
 * React hook that monitors the card state and dispatches a SET_WIN action when bingo is detected.
 * Must be used inside a GameProvider; throws if context is missing.
 */
export function useBingoDetection() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useBingoDetection must be used inside GameProvider');
  const { state, dispatch } = ctx;

  useEffect(() => {
    if (state.status !== 'playing' || !state.card) return;
    const winningLines = checkBingo(state.card);
    if (winningLines.length > 0) {
      dispatch({ type: 'SET_WIN', winningLines });
    }
  }, [state.card, state.status, dispatch]);
}
