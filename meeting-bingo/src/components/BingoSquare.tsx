import type { BingoSquare as BingoSquareType } from '../types';

interface BingoSquareProps {
  square: BingoSquareType;
  isWinning: boolean;
  onClick: (row: number, col: number) => void;
}

export function BingoSquare({ square, isWinning, onClick }: BingoSquareProps) {
  const { word, isFilled, isAutoFilled, isFreeSpace, row, col } = square;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isFreeSpace) onClick(row, col);
    }
  }

  let cellClass =
    'relative flex items-center justify-center rounded-lg border-2 text-center text-xs font-medium leading-tight transition-all duration-200 select-none ';

  if (isFreeSpace) {
    cellClass += 'bg-indigo-500 border-indigo-600 text-white cursor-default';
  } else if (isWinning) {
    cellClass += 'bg-yellow-400 border-yellow-500 text-gray-900 scale-105 shadow-md cursor-pointer';
  } else if (isFilled) {
    cellClass += `bg-green-500 border-green-600 text-white cursor-pointer ${isAutoFilled ? 'ring-2 ring-green-300' : ''}`;
  } else {
    cellClass +=
      'bg-white border-gray-200 text-gray-700 hover:bg-indigo-50 hover:border-indigo-300 cursor-pointer active:scale-95';
  }

  const label = isFreeSpace
    ? 'Free space'
    : `${word}${isFilled ? ', filled' : ''}`;

  return (
    <div
      role="button"
      tabIndex={isFreeSpace ? -1 : 0}
      aria-label={label}
      aria-pressed={isFilled}
      onClick={() => !isFreeSpace && onClick(row, col)}
      onKeyDown={handleKeyDown}
      className={cellClass}
    >
      <span className="px-1 break-words w-full text-center">{isFreeSpace ? '⭐' : word}</span>
    </div>
  );
}
