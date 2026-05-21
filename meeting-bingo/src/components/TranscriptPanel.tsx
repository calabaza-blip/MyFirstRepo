import { useEffect, useRef } from 'react';

interface TranscriptPanelProps {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  transcriptLines: string[];
  detectedWords: string[];
  error: string | null;
}

export function TranscriptPanel({
  isListening,
  isSupported,
  interimTranscript,
  transcriptLines,
  detectedWords,
  error,
}: TranscriptPanelProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptLines, interimTranscript]);

  if (!isSupported) {
    return (
      <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Manual mode only — your browser doesn't support speech recognition.
      </div>
    );
  }

  if (error === 'not-allowed') {
    return (
      <div className="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Microphone access blocked — tap squares manually to play.
      </div>
    );
  }

  const hasContent = transcriptLines.length > 0 || interimTranscript;

  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Mic status header — icon + color for WCAG 2.1 AA (not color-only) */}
      <div
        className={`flex items-center gap-2 px-3 py-2 text-xs font-medium border-b ${
          isListening
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-gray-50 border-gray-200 text-gray-500'
        }`}
      >
        <span aria-hidden="true">{isListening ? '🎙️' : '🎤'}</span>
        <span>{isListening ? 'Listening…' : 'Mic off'}</span>
      </div>

      {/* Transcript — scroll-anchored 3-line view */}
      <div className="px-3 py-2 h-16 overflow-hidden flex flex-col justify-end text-xs text-gray-600 leading-relaxed">
        {hasContent ? (
          <>
            {transcriptLines.map((line, i) => (
              <p key={i} className="truncate text-gray-400">
                {line}
              </p>
            ))}
            {interimTranscript && (
              <p className="truncate text-gray-700 italic">{interimTranscript}</p>
            )}
            <div ref={endRef} />
          </>
        ) : (
          <p className="text-gray-400 italic">
            {isListening ? 'Waiting for speech…' : 'Start mic to auto-fill squares.'}
          </p>
        )}
      </div>

      {/* Detected-word chips — aria-live so screen readers announce new detections */}
      {detectedWords.length > 0 && (
        <div
          aria-live="polite"
          aria-label="Recently detected words"
          className="flex flex-wrap gap-1 px-3 pb-2"
        >
          {detectedWords.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800"
            >
              {word}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
