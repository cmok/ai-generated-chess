import { ChessGame } from './ChessGame';
import type { ChessMove, PieceColor, PieceType, AIConfig } from '../types/chess';

type PieceTable = number[][];

export class ChessAI {
  private game: ChessGame;
  private difficulty: number;
  private stockfish: Worker | null = null;
  private stockfishReady: boolean = false;
  private pendingResolve: ((move: ChessMove | null) => void) | null = null;

  // Piece values for evaluation
  private pieceValues: Record<PieceType, number> = {
    P: 100,
    N: 320,
    B: 330,
    R: 500,
    Q: 900,
    K: 20000,
  };

  // Piece-square tables for positional evaluation
  private pawnTable: PieceTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5, 5, 10, 25, 25, 10, 5, 5],
    [0, 0, 0, 20, 20, 0, 0, 0],
    [5, -5, -10, 0, 0, -10, -5, 5],
    [5, 10, 10, -20, -20, 10, 10, 5],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ];

  private knightTable: PieceTable = [
    [-50, -40, -30, -30, -30, -30, -40, -50],
    [-40, -20, 0, 0, 0, 0, -20, -40],
    [-30, 0, 10, 15, 15, 10, 0, -30],
    [-30, 5, 15, 20, 20, 15, 5, -30],
    [-30, 0, 15, 20, 20, 15, 0, -30],
    [-30, 5, 10, 15, 15, 10, 5, -30],
    [-40, -20, 0, 5, 5, 0, -20, -40],
    [-50, -40, -30, -30, -30, -30, -40, -50],
  ];

  private bishopTable: PieceTable = [
    [-20, -10, -10, -10, -10, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 10, 10, 5, 0, -10],
    [-10, 5, 5, 10, 10, 5, 5, -10],
    [-10, 0, 10, 10, 10, 10, 0, -10],
    [-10, 10, 10, 10, 10, 10, 10, -10],
    [-10, 5, 0, 0, 0, 0, 5, -10],
    [-20, -10, -10, -10, -10, -10, -10, -20],
  ];

  private rookTable: PieceTable = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [5, 10, 10, 10, 10, 10, 10, 5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [-5, 0, 0, 0, 0, 0, 0, -5],
    [0, 0, 0, 5, 5, 0, 0, 0],
  ];

  private queenTable: PieceTable = [
    [-20, -10, -10, -5, -5, -10, -10, -20],
    [-10, 0, 0, 0, 0, 0, 0, -10],
    [-10, 0, 5, 5, 5, 5, 0, -10],
    [-5, 0, 5, 5, 5, 5, 0, -5],
    [0, 0, 5, 5, 5, 5, 0, -5],
    [-10, 5, 5, 5, 5, 5, 0, -10],
    [-10, 0, 5, 0, 0, 0, 0, -10],
    [-20, -10, -10, -5, -5, -10, -10, -20],
  ];

  private kingMiddleGameTable: PieceTable = [
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-30, -40, -40, -50, -50, -40, -40, -30],
    [-20, -30, -30, -40, -40, -30, -30, -20],
    [-10, -20, -20, -20, -20, -20, -20, -10],
    [20, 20, 0, 0, 0, 0, 20, 20],
    [20, 30, 10, 0, 0, 10, 30, 20],
  ];

  constructor(game: ChessGame, difficulty: number = 10) {
    this.game = game;
    this.difficulty = difficulty;

    // Initialize Stockfish for levels 4+
    if (difficulty >= 4 && typeof Worker !== 'undefined') {
      this.initStockfish();
    }
  }

  private initStockfish(): void {
    try {
      // Load Stockfish from CDN as a Web Worker
      const stockfishUrl =
        'https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.0/stockfish.js';
      this.stockfish = new Worker(stockfishUrl);

      this.stockfish.onmessage = (event: MessageEvent) => {
        const line: string = event.data || event;
        if (line.startsWith('bestmove')) {
          const bestMoveStr = line.split(' ')[1];
          if (this.pendingResolve && bestMoveStr) {
            const move = this.parseStockfishMove(bestMoveStr);
            this.pendingResolve(move);
            this.pendingResolve = null;
          }
        }
        if (line === 'uciok') {
          this.stockfishReady = true;
        }
      };

      this.stockfish.postMessage('uci');
    } catch (e) {
      console.log('Stockfish initialization failed, falling back to custom AI:', e);
    }
  }

  setDifficulty(difficulty: number): void {
    this.difficulty = difficulty;
    // Initialize Stockfish if difficulty is 4+ and not already initialized
    if (difficulty >= 4 && !this.stockfish) {
      this.initStockfish();
    }
  }

  getConfig(): AIConfig {
    const useStockfish = this.difficulty >= 4 && !!this.stockfish;
    const depth = useStockfish ? Math.min(this.difficulty - 2, 20) : this.difficulty;
    const moveTime = useStockfish
      ? Math.min(500 + (this.difficulty - 4) * 200, 3000)
      : 0;

    return {
      difficulty: this.difficulty,
      useStockfish,
      depth,
      moveTime,
    };
  }

  // Get the best move for the current position
  async getBestMove(color: PieceColor): Promise<ChessMove | null> {
    // Use Stockfish for levels 4-20
    if (this.difficulty >= 4 && this.stockfish) {
      return await this.getStockfishMove(color);
    }

    // Use custom minimax for levels 1-3
    return this.getCustomMove(color);
  }

  // Stockfish-based move calculation
  private getStockfishMove(color: PieceColor): Promise<ChessMove | null> {
    return new Promise((resolve) => {
      if (!this.stockfish || !this.stockfishReady) {
        // Fallback to custom AI if Stockfish isn't ready
        resolve(this.getCustomMove(color));
        return;
      }

      // Convert board to FEN
      const fen = this.game.toFen();

      // Set up search parameters based on difficulty
      const depth = Math.min(this.difficulty - 2, 20);
      const moveTime = Math.min(500 + (this.difficulty - 4) * 200, 3000);

      this.pendingResolve = resolve;

      // Send position and go command to Stockfish
      this.stockfish!.postMessage(`position fen ${fen}`);
      this.stockfish!.postMessage(`go depth ${depth} movetime ${moveTime}`);

      // Timeout fallback
      setTimeout(() => {
        if (this.pendingResolve) {
          this.pendingResolve = null;
          resolve(this.getCustomMove(color));
        }
      }, moveTime + 1000);
    });
  }

  private parseStockfishMove(moveStr: string): ChessMove | null {
    if (!moveStr || moveStr.length < 4) return null;

    const files = 'abcdefgh';
    const ranks = '87654321';

    const fromCol = files.indexOf(moveStr[0] ?? '');
    const fromRow = ranks.indexOf(moveStr[1] ?? '');
    const toCol = files.indexOf(moveStr[2] ?? '');
    const toRow = ranks.indexOf(moveStr[3] ?? '');

    if (fromCol === -1 || fromRow === -1 || toCol === -1 || toRow === -1) {
      return null;
    }

    const move: ChessMove = {
      from: { row: fromRow, col: fromCol },
      to: { row: toRow, col: toCol },
    };

    // Handle promotion
    if (moveStr.length === 5) {
      const promotionChar = moveStr[4];
      const promotionMap: Record<string, PieceType> = {
        n: 'N',
        b: 'B',
        r: 'R',
        q: 'Q',
      };
      if (promotionChar && promotionChar in promotionMap) {
        move.promotion = promotionMap[promotionChar];
      }
    }

    return move;
  }

  // Custom minimax-based move calculation (for levels 1-3)
  private getCustomMove(color: PieceColor): ChessMove | null {
    const depth = this.difficulty;
    const isMaximizing = color === 'white';

    const moves = this.game.getAllLegalMoves(color);

    if (moves.length === 0) return null;
    if (moves.length === 1) return moves[0] ?? null;

    // Sort moves for better alpha-beta pruning
    this.sortMoves(moves);

    let bestMove: ChessMove | null = null;
    let bestValue = isMaximizing ? -Infinity : Infinity;
    let alpha = -Infinity;
    let beta = Infinity;

    for (const move of moves) {
      this.game.makeMove(move);

      const value = this.minimax(depth - 1, alpha, beta, !isMaximizing);

      this.game.undoMove();

      if (isMaximizing) {
        if (value > bestValue) {
          bestValue = value;
          bestMove = move;
        }
        alpha = Math.max(alpha, bestValue);
      } else {
        if (value < bestValue) {
          bestValue = value;
          bestMove = move;
        }
        beta = Math.min(beta, bestValue);
      }

      if (beta <= alpha) break;
    }

    return bestMove || (moves[0] ?? null);
  }

  private minimax(depth: number, alpha: number, beta: number, isMaximizing: boolean): number {
    if (depth === 0) {
      return this.evaluateBoard();
    }

    const color: PieceColor = isMaximizing ? 'white' : 'black';
    const moves = this.game.getAllLegalMoves(color);

    if (moves.length === 0) {
      if (this.game.isInCheck(color)) {
        return isMaximizing ? -100000 : 100000; // Checkmate
      }
      return 0; // Stalemate
    }

    this.sortMoves(moves);

    if (isMaximizing) {
      let maxValue = -Infinity;
      for (const move of moves) {
        this.game.makeMove(move);

        const value = this.minimax(depth - 1, alpha, beta, false);

        this.game.undoMove();

        maxValue = Math.max(maxValue, value);
        alpha = Math.max(alpha, value);

        if (beta <= alpha) break;
      }
      return maxValue;
    } else {
      let minValue = Infinity;
      for (const move of moves) {
        this.game.makeMove(move);

        const value = this.minimax(depth - 1, alpha, beta, true);

        this.game.undoMove();

        minValue = Math.min(minValue, value);
        beta = Math.min(beta, value);

        if (beta <= alpha) break;
      }
      return minValue;
    }
  }

  private sortMoves(moves: ChessMove[]): void {
    // Simple move ordering: captures first, then others
    moves.sort((a, b) => {
      const aCapture = this.game.getPiece(a.to.row, a.to.col) ? 1 : 0;
      const bCapture = this.game.getPiece(b.to.row, b.to.col) ? 1 : 0;
      return bCapture - aCapture;
    });
  }

  evaluateBoard(): number {
    let score = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.game.getPiece(row, col);
        if (!piece) continue;

        const pieceType = this.game.getPieceType(piece);
        const isWhite = this.game.isWhite(piece);
        const value = this.pieceValues[pieceType as PieceType] ?? 0;

        // Add material value
        score += isWhite ? value : -value;

        // Add positional value
        const tableValue = this.getPositionalValue(pieceType as PieceType, row, col, isWhite);
        score += isWhite ? tableValue : -tableValue;
      }
    }

    return score;
  }

  private getPositionalValue(pieceType: PieceType, row: number, col: number, isWhite: boolean): number {
    let table: PieceTable;

    switch (pieceType) {
      case 'P':
        table = this.pawnTable;
        break;
      case 'N':
        table = this.knightTable;
        break;
      case 'B':
        table = this.bishopTable;
        break;
      case 'R':
        table = this.rookTable;
        break;
      case 'Q':
        table = this.queenTable;
        break;
      case 'K':
        table = this.kingMiddleGameTable;
        break;
      default:
        return 0;
    }

    // Flip table for black pieces
    if (isWhite) {
      return table[row]?.[col] ?? 0;
    } else {
      return table[7 - row]?.[col] ?? 0;
    }
  }
}
