import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../hooks/useGame';
import { buildShareText, shareResult } from '../lib/shareUtils';
import { BingoCard } from './BingoCard';
import { Button } from './ui/Button';
import { CATEGORIES_BY_ID } from '../data/categories';

type ShareStatus = 'idle' | 'shared' | 'copied' | 'failed';

export function WinScreen() {
  const { state, newGame, resetGame, filledCount, winningSquareIds } = useGame();
  const [shareStatus, setShareStatus] = useState<ShareStatus>('idle');

  useEffect(() => {
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
  }, []);

  if (!state.card || !state.categoryId) return null;

  const category = CATEGORIES_BY_ID[state.categoryId];
  const elapsed =
    state.startedAt && state.wonAt
      ? Math.round((state.wonAt - state.startedAt) / 1000)
      : null;
  const elapsedStr =
    elapsed !== null
      ? `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`
      : null;

  const winType = state.winningLines[0]?.type ?? 'row';
  const winLabel = winType.charAt(0).toUpperCase() + winType.slice(1);

  async function handleShare() {
    if (!state.card) return;
    const text = buildShareText({
      card: state.card,
      category,
      filledCount,
      winType: winLabel,
      elapsed: elapsedStr,
    });
    const result = await shareResult(text);
    setShareStatus(result);
    if (result !== 'failed') {
      setTimeout(() => setShareStatus('idle'), 2500);
    }
  }

  const shareLabel =
    shareStatus === 'copied'
      ? '✓ Copied!'
      : shareStatus === 'shared'
        ? '✓ Shared!'
        : shareStatus === 'failed'
          ? 'Could not share'
          : '📤 Share result';

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex flex-col items-center justify-start px-4 py-10 overflow-y-auto">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        {/* Celebration header */}
        <div className="text-center">
          <div className="text-5xl mb-2">🎉</div>
          <h1 className="text-3xl font-bold text-gray-900">BINGO!</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {winLabel} complete{elapsedStr ? ` in ${elapsedStr}` : ''}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 w-full text-center">
          <div className="rounded-xl bg-white border border-gray-200 p-3">
            <div className="text-2xl font-bold text-indigo-600">{filledCount}</div>
            <div className="text-xs text-gray-500">squares filled</div>
          </div>
          <div className="rounded-xl bg-white border border-gray-200 p-3">
            <div className="text-2xl font-bold text-indigo-600">{category.icon}</div>
            <div className="text-xs text-gray-500">{category.name} pack</div>
          </div>
        </div>

        {/* Static card snapshot */}
        <BingoCard
          card={state.card}
          winningSquareIds={winningSquareIds}
          onSquareClick={() => {}}
        />

        {/* Actions */}
        <div className="flex flex-col gap-3 w-full">
          <Button
            variant="secondary"
            size="md"
            onClick={handleShare}
            disabled={shareStatus === 'shared' || shareStatus === 'copied'}
            className="w-full"
          >
            {shareLabel}
          </Button>
          <Button size="lg" onClick={newGame} className="w-full">
            Play Again
          </Button>
          <Button variant="ghost" size="md" onClick={resetGame} className="w-full">
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
