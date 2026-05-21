import type { BingoCard, Category } from '../types';

/**
 * Builds a shareable plain-text summary of the player's bingo result including a grid visualization.
 * @param params - Card, category metadata, fill count, win type, and optional elapsed time string.
 * @returns A formatted multi-line share text string.
 */
export function buildShareText(params: {
  card: BingoCard;
  category: Category;
  filledCount: number;
  winType: string;
  elapsed: string | null;
}): string {
  const { card, category, filledCount, winType, elapsed } = params;

  const grid = card.squares
    .map((row) =>
      row.map((sq) => (sq.isFreeSpace ? '⭐' : sq.isFilled ? '🟩' : '⬜')).join(''),
    )
    .join('\n');

  const parts = [
    `🎯 Meeting Bingo — BINGO! (${category.name})`,
    elapsed
      ? `⏱ Won in ${elapsed} | ${filledCount}/24 squares filled`
      : `${filledCount}/24 squares filled`,
    `${winType.charAt(0).toUpperCase() + winType.slice(1)} complete`,
    '',
    grid,
  ];

  return parts.join('\n');
}

/**
 * Attempts to share text via the Web Share API, falling back to clipboard copy.
 * @param text - The text to share or copy.
 * @returns `'shared'` if Web Share succeeded, `'copied'` if clipboard copy succeeded, `'failed'` otherwise.
 */
export async function shareResult(text: string): Promise<'shared' | 'copied' | 'failed'> {
  if ('share' in navigator) {
    try {
      await navigator.share({ title: 'Meeting Bingo', text });
      return 'shared';
    } catch (e) {
      // AbortError means user cancelled — don't fall through to clipboard
      if ((e as Error).name === 'AbortError') return 'failed';
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return 'failed';
  }
}
