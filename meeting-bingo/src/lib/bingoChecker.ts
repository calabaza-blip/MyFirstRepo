import type { BingoCard, WinningLine } from '../types';

/**
 * Checks a bingo card for all completed lines (rows, columns, diagonals).
 * @param card - The current bingo card state.
 * @returns An array of winning lines; empty if no bingo has been achieved.
 */
export function checkBingo(card: BingoCard): WinningLine[] {
  const { squares } = card;
  const winning: WinningLine[] = [];

  for (let row = 0; row < 5; row++) {
    if (squares[row].every((sq) => sq.isFilled)) {
      winning.push({
        type: 'row',
        index: row,
        squares: squares[row].map((sq) => ({ row: sq.row, col: sq.col })),
      });
    }
  }

  for (let col = 0; col < 5; col++) {
    if (squares.every((r) => r[col].isFilled)) {
      winning.push({
        type: 'column',
        index: col,
        squares: squares.map((r) => ({ row: r[col].row, col: r[col].col })),
      });
    }
  }

  const diag1 = [0, 1, 2, 3, 4].map((i) => squares[i][i]);
  if (diag1.every((sq) => sq.isFilled)) {
    winning.push({
      type: 'diagonal',
      index: 0,
      squares: diag1.map((sq) => ({ row: sq.row, col: sq.col })),
    });
  }

  const diag2 = [0, 1, 2, 3, 4].map((i) => squares[i][4 - i]);
  if (diag2.every((sq) => sq.isFilled)) {
    winning.push({
      type: 'diagonal',
      index: 1,
      squares: diag2.map((sq) => ({ row: sq.row, col: sq.col })),
    });
  }

  return winning;
}

/**
 * Returns the incomplete line closest to completion, used to highlight near-bingo progress.
 * @param card - The current bingo card state.
 * @returns The best incomplete line with its fill count and square coordinates, or null if all lines are complete.
 */
export function getNearBingoLine(card: BingoCard): { maxFilled: number; squares: Array<{ row: number; col: number }> } | null {
  const { squares } = card;
  const lines: Array<{ filled: number; coords: Array<{ row: number; col: number }> }> = [];

  for (let row = 0; row < 5; row++) {
    lines.push({
      filled: squares[row].filter((sq) => sq.isFilled).length,
      coords: squares[row].map((sq) => ({ row: sq.row, col: sq.col })),
    });
  }

  for (let col = 0; col < 5; col++) {
    lines.push({
      filled: squares.filter((r) => r[col].isFilled).length,
      coords: squares.map((r) => ({ row: r[col].row, col: r[col].col })),
    });
  }

  const diag1 = [0, 1, 2, 3, 4].map((i) => squares[i][i]);
  lines.push({
    filled: diag1.filter((sq) => sq.isFilled).length,
    coords: diag1.map((sq) => ({ row: sq.row, col: sq.col })),
  });

  const diag2 = [0, 1, 2, 3, 4].map((i) => squares[i][4 - i]);
  lines.push({
    filled: diag2.filter((sq) => sq.isFilled).length,
    coords: diag2.map((sq) => ({ row: sq.row, col: sq.col })),
  });

  const incomplete = lines.filter((l) => l.filled < 5);
  if (incomplete.length === 0) return null;

  const best = incomplete.reduce((a, b) => (b.filled > a.filled ? b : a));
  return { maxFilled: best.filled, squares: best.coords };
}
