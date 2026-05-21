import type { BingoCard as BingoCardType } from '../types';
import { BingoSquare } from './BingoSquare';

interface BingoCardProps {
  card: BingoCardType;
  winningSquareIds: Set<string>;
  onSquareClick: (row: number, col: number) => void;
}

const HEADERS = ['B', 'I', 'N', 'G', 'O'];

export function BingoCard({ card, winningSquareIds, onSquareClick }: BingoCardProps) {
  return (
    <div className="w-full max-w-sm mx-auto" role="grid" aria-label="Bingo card">
      {/* Column headers */}
      <div className="grid grid-cols-5 gap-1.5 mb-1.5">
        {HEADERS.map((h) => (
          <div
            key={h}
            className="flex items-center justify-center h-8 rounded-md bg-indigo-600 text-white font-bold text-lg"
            aria-hidden="true"
          >
            {h}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-1.5">
        {card.squares.flat().map((square) => (
          <div key={square.id} role="gridcell" className="aspect-square">
            <BingoSquare
              square={square}
              isWinning={winningSquareIds.has(square.id)}
              onClick={onSquareClick}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
