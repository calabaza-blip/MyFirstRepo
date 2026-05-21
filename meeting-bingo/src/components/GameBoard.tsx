import { useCallback, useState } from 'react';
import { useGame } from '../hooks/useGame';
import { useBingoDetection } from '../hooks/useBingoDetection';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { detectWordsWithAliases } from '../lib/wordDetector';
import { BingoCard } from './BingoCard';
import { GameControls } from './GameControls';
import { TranscriptPanel } from './TranscriptPanel';
import { ToastContainer } from './ui/Toast';
import { Button } from './ui/Button';
import type { Toast } from '../types';

export function GameBoard() {
  const {
    state,
    fillSquare,
    autoFillWord,
    getAlreadyFilled,
    newGame,
    resetGame,
    filledCount,
    nearBingoLine,
    winningSquareIds,
  } = useGame();

  useBingoDetection();

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [transcriptLines, setTranscriptLines] = useState<string[]>([]);
  const [detectedWords, setDetectedWords] = useState<string[]>([]);

  function addToast(word: string) {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, word }]);
  }

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  const handleFinalTranscript = useCallback(
    (text: string) => {
      if (!state.card) return;

      // Accumulate last 3 lines for the transcript panel
      setTranscriptLines((prev) => [...prev, text.trim()].slice(-3));

      const candidates = detectWordsWithAliases(text, state.card.words, getAlreadyFilled());
      for (const word of candidates) {
        const filled = autoFillWord(word);
        if (filled) {
          addToast(word);
          setDetectedWords((prev) => [word, ...prev].slice(0, 5));
        }
      }
    },
    [state.card, autoFillWord, getAlreadyFilled],
  );

  const { isListening, isSupported, interimTranscript, error, startListening, stopListening } =
    useSpeechRecognition({ onFinalTranscript: handleFinalTranscript });

  function handleToggleMic() {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }

  const handleSquareClick = useCallback(
    (row: number, col: number) => {
      fillSquare(row, col, false);
    },
    [fillSquare],
  );

  if (!state.card) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button
          onClick={resetGame}
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          aria-label="Back to home"
        >
          ← Home
        </button>
        <h1 className="text-base font-semibold text-gray-800">Meeting Bingo</h1>
        <Button variant="ghost" size="sm" onClick={newGame}>
          New card
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center gap-4 px-4 py-6 max-w-sm mx-auto w-full">
        <BingoCard
          card={state.card}
          winningSquareIds={winningSquareIds}
          onSquareClick={handleSquareClick}
        />

        <div className="w-full">
          <TranscriptPanel
            isListening={isListening}
            isSupported={isSupported}
            interimTranscript={interimTranscript}
            transcriptLines={transcriptLines}
            detectedWords={detectedWords}
            error={error}
          />
        </div>

        <div className="w-full">
          <GameControls
            filledCount={filledCount}
            isNearBingo={nearBingoLine !== null}
            isListening={isListening}
            isSpeechSupported={isSupported}
            micError={error}
            onToggleMic={handleToggleMic}
          />
        </div>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
