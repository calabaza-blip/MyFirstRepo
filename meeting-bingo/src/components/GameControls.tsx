interface GameControlsProps {
  filledCount: number;
  isNearBingo: boolean;
  isListening: boolean;
  isSpeechSupported: boolean;
  micError: string | null;
  onToggleMic: () => void;
}

export function GameControls({
  filledCount,
  isNearBingo,
  isListening,
  isSpeechSupported,
  micError,
  onToggleMic,
}: GameControlsProps) {
  const micBlocked = micError === 'not-allowed';

  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-xl bg-white border border-gray-200 shadow-sm">
      {/* Progress counter */}
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${isNearBingo ? 'text-orange-600' : 'text-gray-700'}`}>
          {filledCount}/24 filled
        </span>
        {isNearBingo && (
          <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700 animate-pulse">
            Almost BINGO!
          </span>
        )}
      </div>

      {/* Mic toggle */}
      {isSpeechSupported && !micBlocked ? (
        <button
          onClick={onToggleMic}
          aria-label={isListening ? 'Stop listening' : 'Start listening'}
          aria-pressed={isListening}
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isListening
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
          }`}
        >
          <span aria-hidden="true">{isListening ? '🎙️' : '🎤'}</span>
          <span>{isListening ? 'Stop' : 'Start mic'}</span>
        </button>
      ) : (
        <span className="text-xs text-gray-400 italic">
          {micBlocked ? 'Mic blocked' : 'Tap squares to fill'}
        </span>
      )}
    </div>
  );
}
