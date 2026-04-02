// Chess piece types
export type PieceType = 'P' | 'R' | 'N' | 'B' | 'Q' | 'K';
export type PieceColor = 'white' | 'black';
export type GameMode = 'human-vs-ai' | 'ai-vs-ai';
export type GameResultType = 'checkmate' | 'stalemate' | 'fifty-move-rule' | null;

// Position on the board (0-7, 0-7)
export interface Position {
  row: number;
  col: number;
}

// A chess move with optional special move flags
export interface ChessMove {
  from: Position;
  to: Position;
  enPassant?: boolean;
  castling?: 'kingSide' | 'queenSide';
  promotion?: PieceType;
}

// Castling rights for a color
export interface CastlingRights {
  kingSide: boolean;
  queenSide: boolean;
}

// Game result
export type GameResult = {
  type: 'checkmate';
  winner: PieceColor;
} | {
  type: 'stalemate' | 'fifty-move-rule';
} | null;

// Board state for saving/restoring
export interface BoardState {
  board: string[][];
  currentTurn: PieceColor;
  castlingRights: {
    white: CastlingRights;
    black: CastlingRights;
  };
  enPassantTarget: Position | null;
  halfMoveClock: number;
  fullMoveNumber: number;
}

// Move history entry
export interface MoveHistoryEntry {
  move: ChessMove;
  stateBefore: BoardState;
  capturedPiece: string | null;
  capturedPieces: {
    white: string[];
    black: string[];
  };
  notation: string;
}

// Captured pieces
export interface CapturedPieces {
  white: string[];
  black: string[];
}

// Game state for Zustand store
export interface GameState {
  board: string[][];
  currentTurn: PieceColor;
  castlingRights: {
    white: CastlingRights;
    black: CastlingRights;
  };
  enPassantTarget: Position | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  moveHistory: MoveHistoryEntry[];
  capturedPieces: CapturedPieces;
  gameOver: boolean;
  gameResult: GameResult;
  selectedSquare: Position | null;
  validMoves: ChessMove[];
  isFlipped: boolean;
  gameMode: GameMode;
  playerColor: PieceColor;
  aiDifficulty: number;
  isAiThinking: boolean;
  lastMove: ChessMove | null;
}

// AI configuration
export interface AIConfig {
  difficulty: number;
  useStockfish: boolean;
  depth: number;
  moveTime: number;
}
