export type CategoryId = 'agile' | 'corporate' | 'tech';

export interface Category {
  id: CategoryId;
  name: string;
  description: string;
  icon: string;
  words: string[];
}

export interface BingoSquare {
  id: string;
  word: string;
  isFilled: boolean;
  isAutoFilled: boolean;
  isFreeSpace: boolean;
  filledAt: number | null;
  row: number;
  col: number;
}

export interface BingoCard {
  squares: BingoSquare[][];
  words: string[];
}

export type GameStatus = 'idle' | 'setup' | 'playing' | 'won';

export interface WinningLine {
  type: 'row' | 'column' | 'diagonal';
  index: number;
  squares: Array<{ row: number; col: number }>;
}

export interface GameState {
  status: GameStatus;
  categoryId: CategoryId | null;
  card: BingoCard | null;
  winningLines: WinningLine[];
  startedAt: number | null;
  wonAt: number | null;
}

export interface SpeechRecognitionState {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  interimTranscript: string;
  error: string | null;
}

export interface Toast {
  id: string;
  word: string;
}
