import type { BingoCard, BingoSquare, CategoryId } from '../types';
import { CATEGORIES_BY_ID } from '../data/categories';

function fisherYatesShuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generates a randomized 5x5 bingo card for the given category with a free center square.
 * @param categoryId - The category to draw words from.
 * @returns A fully initialized BingoCard with shuffled squares.
 */
export function generateCard(categoryId: CategoryId): BingoCard {
  const category = CATEGORIES_BY_ID[categoryId];
  const shuffled = fisherYatesShuffle(category.words);
  const selected = shuffled.slice(0, 24);

  const squares: BingoSquare[][] = [];
  let wordIndex = 0;

  for (let row = 0; row < 5; row++) {
    squares[row] = [];
    for (let col = 0; col < 5; col++) {
      const isFreeSpace = row === 2 && col === 2;
      squares[row][col] = {
        id: `${row}-${col}`,
        word: isFreeSpace ? 'FREE' : selected[wordIndex++],
        isFilled: isFreeSpace,
        isAutoFilled: false,
        isFreeSpace,
        filledAt: isFreeSpace ? Date.now() : null,
        row,
        col,
      };
    }
  }

  return { squares, words: selected };
}
