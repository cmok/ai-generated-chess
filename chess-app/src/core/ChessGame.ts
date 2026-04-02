import type {
  Position,
  ChessMove,
  CastlingRights,
  BoardState,
  GameResult,
  PieceColor,
  PieceType,
  CapturedPieces,
  MoveHistoryEntry,
} from '../types/chess';

export class ChessGame {
  board: string[][];
  currentTurn: PieceColor;
  moveHistory: MoveHistoryEntry[];
  capturedPieces: CapturedPieces;
  castlingRights: { white: CastlingRights; black: CastlingRights };
  enPassantTarget: Position | null;
  halfMoveClock: number;
  fullMoveNumber: number;
  gameOver: boolean;
  gameResult: GameResult;

  constructor() {
    this.board = [];
    this.currentTurn = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.castlingRights = {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true },
    };
    this.enPassantTarget = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.gameOver = false;
    this.gameResult = null;
    this.reset();
  }

  reset(): void {
    this.board = [
      ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
      ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
      ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'],
    ];
    this.currentTurn = 'white';
    this.moveHistory = [];
    this.capturedPieces = { white: [], black: [] };
    this.castlingRights = {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true },
    };
    this.enPassantTarget = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.gameOver = false;
    this.gameResult = null;
  }

  getPiece(row: number, col: number): string {
    if (row < 0 || row > 7 || col < 0 || col > 7) return '';
    return this.board[row]?.[col] ?? '';
  }

  isWhite(piece: string): boolean {
    return piece !== '' && piece === piece.toUpperCase();
  }

  isBlack(piece: string): boolean {
    return piece !== '' && piece === piece.toLowerCase();
  }

  getPieceColor(piece: string): PieceColor | null {
    if (!piece) return null;
    return this.isWhite(piece) ? 'white' : 'black';
  }

  getPieceType(piece: string): PieceType | null {
    if (!piece) return null;
    return piece.toUpperCase() as PieceType;
  }

  isValidPosition(row: number, col: number): boolean {
    return row >= 0 && row <= 7 && col >= 0 && col <= 7;
  }

  getPseudoLegalMoves(row: number, col: number): ChessMove[] {
    const piece = this.getPiece(row, col);
    if (!piece) return [];

    const color = this.getPieceColor(piece);
    const type = this.getPieceType(piece);
    const moves: ChessMove[] = [];

    if (!color || !type) return [];

    switch (type) {
      case 'P':
        this.getPawnMoves(row, col, color, moves);
        break;
      case 'R':
        this.getSlidingMoves(row, col, color, [[0, 1], [0, -1], [1, 0], [-1, 0]], moves);
        break;
      case 'N':
        this.getKnightMoves(row, col, color, moves);
        break;
      case 'B':
        this.getSlidingMoves(row, col, color, [[1, 1], [1, -1], [-1, 1], [-1, -1]], moves);
        break;
      case 'Q':
        this.getSlidingMoves(
          row,
          col,
          color,
          [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]],
          moves
        );
        break;
      case 'K':
        this.getKingMoves(row, col, color, moves);
        break;
    }

    return moves;
  }

  private getPawnMoves(row: number, col: number, color: PieceColor, moves: ChessMove[]): void {
    const direction = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;

    // Forward move
    if (this.isValidPosition(row + direction, col) && !this.getPiece(row + direction, col)) {
      moves.push({ from: { row, col }, to: { row: row + direction, col } });

      // Double move from starting position
      if (row === startRow && !this.getPiece(row + 2 * direction, col)) {
        moves.push({ from: { row, col }, to: { row: row + 2 * direction, col } });
      }
    }

    // Captures
    for (const dc of [-1, 1]) {
      const newRow = row + direction;
      const newCol = col + dc;
      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.getPiece(newRow, newCol);
        if (targetPiece && this.getPieceColor(targetPiece) !== color) {
          moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
        }

        // En passant
        if (
          this.enPassantTarget &&
          this.enPassantTarget.row === newRow &&
          this.enPassantTarget.col === newCol
        ) {
          moves.push({
            from: { row, col },
            to: { row: newRow, col: newCol },
            enPassant: true,
          });
        }
      }
    }
  }

  private getSlidingMoves(
    row: number,
    col: number,
    color: PieceColor,
    directions: [number, number][],
    moves: ChessMove[]
  ): void {
    for (const [dr, dc] of directions) {
      let newRow = row + dr;
      let newCol = col + dc;

      while (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.getPiece(newRow, newCol);

        if (!targetPiece) {
          moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
        } else {
          if (this.getPieceColor(targetPiece) !== color) {
            moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
          }
          break;
        }

        newRow += dr;
        newCol += dc;
      }
    }
  }

  private getKnightMoves(row: number, col: number, color: PieceColor, moves: ChessMove[]): void {
    const offsets: [number, number][] = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];

    for (const [dr, dc] of offsets) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.getPiece(newRow, newCol);
        if (!targetPiece || this.getPieceColor(targetPiece) !== color) {
          moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
        }
      }
    }
  }

  private getKingMoves(row: number, col: number, color: PieceColor, moves: ChessMove[]): void {
    const offsets: [number, number][] = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];

    for (const [dr, dc] of offsets) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (this.isValidPosition(newRow, newCol)) {
        const targetPiece = this.getPiece(newRow, newCol);
        if (!targetPiece || this.getPieceColor(targetPiece) !== color) {
          moves.push({ from: { row, col }, to: { row: newRow, col: newCol } });
        }
      }
    }

    // Castling
    if (this.canCastle(color, 'kingSide')) {
      moves.push({
        from: { row, col },
        to: { row, col: col + 2 },
        castling: 'kingSide',
      });
    }
    if (this.canCastle(color, 'queenSide')) {
      moves.push({
        from: { row, col },
        to: { row, col: col - 2 },
        castling: 'queenSide',
      });
    }
  }

  canCastle(color: PieceColor, side: 'kingSide' | 'queenSide'): boolean {
    const rights = this.castlingRights[color];
    if (!rights || (side === 'kingSide' ? !rights.kingSide : !rights.queenSide)) {
      return false;
    }

    const row = color === 'white' ? 7 : 0;

    if (side === 'kingSide') {
      if (this.getPiece(row, 5) || this.getPiece(row, 6)) return false;
      if (
        this.isSquareAttacked(row, 4, color) ||
        this.isSquareAttacked(row, 5, color) ||
        this.isSquareAttacked(row, 6, color)
      )
        return false;
    } else {
      if (this.getPiece(row, 1) || this.getPiece(row, 2) || this.getPiece(row, 3)) return false;
      if (
        this.isSquareAttacked(row, 4, color) ||
        this.isSquareAttacked(row, 3, color) ||
        this.isSquareAttacked(row, 2, color)
      )
        return false;
    }

    return true;
  }

  isSquareAttacked(row: number, col: number, defendingColor: PieceColor): boolean {
    const attackingColor = defendingColor === 'white' ? 'black' : 'white';

    // Check for pawn attacks
    const pawnDirection = defendingColor === 'white' ? -1 : 1;
    for (const dc of [-1, 1]) {
      const pawnRow = row + pawnDirection;
      const pawnCol = col + dc;
      if (this.isValidPosition(pawnRow, pawnCol)) {
        const piece = this.getPiece(pawnRow, pawnCol);
        if (
          piece &&
          this.getPieceType(piece) === 'P' &&
          this.getPieceColor(piece) === attackingColor
        ) {
          return true;
        }
      }
    }

    // Check for knight attacks
    const knightOffsets: [number, number][] = [
      [-2, -1],
      [-2, 1],
      [-1, -2],
      [-1, 2],
      [1, -2],
      [1, 2],
      [2, -1],
      [2, 1],
    ];
    for (const [dr, dc] of knightOffsets) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (this.isValidPosition(newRow, newCol)) {
        const piece = this.getPiece(newRow, newCol);
        if (
          piece &&
          this.getPieceType(piece) === 'N' &&
          this.getPieceColor(piece) === attackingColor
        ) {
          return true;
        }
      }
    }

    // Check for king attacks
    const kingOffsets: [number, number][] = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, -1],
      [0, 1],
      [1, -1],
      [1, 0],
      [1, 1],
    ];
    for (const [dr, dc] of kingOffsets) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (this.isValidPosition(newRow, newCol)) {
        const piece = this.getPiece(newRow, newCol);
        if (
          piece &&
          this.getPieceType(piece) === 'K' &&
          this.getPieceColor(piece) === attackingColor
        ) {
          return true;
        }
      }
    }

    // Check for sliding piece attacks
    const straightDirections: [number, number][] = [
      [0, 1],
      [0, -1],
      [1, 0],
      [-1, 0],
    ];
    const diagonalDirections: [number, number][] = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];

    for (const [dr, dc] of straightDirections) {
      let newRow = row + dr;
      let newCol = col + dc;
      while (this.isValidPosition(newRow, newCol)) {
        const piece = this.getPiece(newRow, newCol);
        if (piece) {
          const type = this.getPieceType(piece);
          const color = this.getPieceColor(piece);
          if (color === attackingColor && (type === 'R' || type === 'Q')) {
            return true;
          }
          break;
        }
        newRow += dr;
        newCol += dc;
      }
    }

    for (const [dr, dc] of diagonalDirections) {
      let newRow = row + dr;
      let newCol = col + dc;
      while (this.isValidPosition(newRow, newCol)) {
        const piece = this.getPiece(newRow, newCol);
        if (piece) {
          const type = this.getPieceType(piece);
          const color = this.getPieceColor(piece);
          if (color === attackingColor && (type === 'B' || type === 'Q')) {
            return true;
          }
          break;
        }
        newRow += dr;
        newCol += dc;
      }
    }

    return false;
  }

  findKing(color: PieceColor): Position | null {
    const kingPiece = color === 'white' ? 'K' : 'k';
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        if (piece === kingPiece) {
          return { row, col };
        }
      }
    }
    return null;
  }

  isInCheck(color: PieceColor): boolean {
    const kingPos = this.findKing(color);
    if (!kingPos) return false;
    return this.isSquareAttacked(kingPos.row, kingPos.col, color);
  }

  getLegalMoves(row: number, col: number): ChessMove[] {
    const pseudoMoves = this.getPseudoLegalMoves(row, col);
    const legalMoves: ChessMove[] = [];

    for (const move of pseudoMoves) {
      if (this.isLegalMove(move)) {
        legalMoves.push(move);
      }
    }

    return legalMoves;
  }

  isLegalMove(move: ChessMove): boolean {
    const savedState = this.saveState();
    this.makeMoveInternal(move);

    const color = this.currentTurn === 'white' ? 'black' : 'white';
    const inCheck = this.isInCheck(color);

    this.restoreState(savedState);

    return !inCheck;
  }

  getAllLegalMoves(color: PieceColor): ChessMove[] {
    const moves: ChessMove[] = [];
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = this.getPiece(row, col);
        if (piece && this.getPieceColor(piece) === color) {
          const pieceMoves = this.getLegalMoves(row, col);
          moves.push(...pieceMoves);
        }
      }
    }
    return moves;
  }

  saveState(): BoardState {
    return {
      board: this.board.map((row) => [...row]),
      currentTurn: this.currentTurn,
      castlingRights: JSON.parse(JSON.stringify(this.castlingRights)),
      enPassantTarget: this.enPassantTarget ? { ...this.enPassantTarget } : null,
      halfMoveClock: this.halfMoveClock,
      fullMoveNumber: this.fullMoveNumber,
    };
  }

  restoreState(state: BoardState): void {
    this.board = state.board.map((row) => [...row]);
    this.currentTurn = state.currentTurn;
    this.castlingRights = JSON.parse(JSON.stringify(state.castlingRights));
    this.enPassantTarget = state.enPassantTarget ? { ...state.enPassantTarget } : null;
    this.halfMoveClock = state.halfMoveClock;
    this.fullMoveNumber = state.fullMoveNumber;
  }

  private makeMoveInternal(move: ChessMove): void {
    const { from, to } = move;
    const piece = this.getPiece(from.row, from.col);
    const color = this.getPieceColor(piece);

    if (!piece || !color) return;

    // Handle en passant capture
    if (move.enPassant) {
      const capturedPawnRow = from.row;
      this.board[capturedPawnRow]![to.col] = '';
    }

    // Handle castling
    if (move.castling) {
      const row = from.row;
      if (move.castling === 'kingSide') {
        this.board[row]![5] = this.getPiece(row, 7);
        this.board[row]![7] = '';
      } else {
        this.board[row]![3] = this.getPiece(row, 0);
        this.board[row]![0] = '';
      }
    }

    // Move the piece
    this.board[to.row]![to.col] = piece;
    this.board[from.row]![from.col] = '';

    // Handle pawn promotion (auto-promote to queen)
    const pieceType = this.getPieceType(piece);
    if (pieceType === 'P' && (to.row === 0 || to.row === 7)) {
      this.board[to.row]![to.col] = color === 'white' ? 'Q' : 'q';
    }

    // Update en passant target
    if (pieceType === 'P' && Math.abs(to.row - from.row) === 2) {
      this.enPassantTarget = {
        row: (from.row + to.row) / 2,
        col: from.col,
      };
    } else {
      this.enPassantTarget = null;
    }

    // Update castling rights
    if (pieceType === 'K') {
      this.castlingRights[color].kingSide = false;
      this.castlingRights[color].queenSide = false;
    }
    if (pieceType === 'R') {
      if (from.col === 0) {
        this.castlingRights[color].queenSide = false;
      }
      if (from.col === 7) {
        this.castlingRights[color].kingSide = false;
      }
    }

    // Update half move clock
    const capturedPiece = this.getPiece(to.row, to.col);
    if (pieceType === 'P' || capturedPiece) {
      this.halfMoveClock = 0;
    } else {
      this.halfMoveClock++;
    }

    // Switch turns
    if (this.currentTurn === 'black') {
      this.fullMoveNumber++;
    }
    this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
  }

  makeMove(move: ChessMove): boolean {
    if (this.gameOver) return false;

    const piece = this.getPiece(move.from.row, move.from.col);
    const capturedPiece = this.getPiece(move.to.row, move.to.col);
    const color = this.getPieceColor(piece);

    if (!piece || !color) return false;

    // Track captured pieces
    if (capturedPiece) {
      this.capturedPieces[color].push(capturedPiece);
    }
    if (move.enPassant) {
      const capturedPawn = color === 'white' ? 'p' : 'P';
      this.capturedPieces[color].push(capturedPawn);
    }

    // Save state for undo
    const notation = this.getMoveNotation(move);
    this.moveHistory.push({
      move: { ...move },
      stateBefore: this.saveState(),
      capturedPiece: capturedPiece || null,
      capturedPieces: JSON.parse(JSON.stringify(this.capturedPieces)),
      notation,
    });

    // Make the move
    this.makeMoveInternal(move);

    // Check for game over conditions
    this.checkGameOver();

    return true;
  }

  undoMove(): boolean {
    if (this.moveHistory.length === 0) return false;

    const lastMove = this.moveHistory.pop();
    if (!lastMove) return false;

    this.restoreState(lastMove.stateBefore);
    this.capturedPieces = JSON.parse(JSON.stringify(lastMove.capturedPieces));
    this.gameOver = false;
    this.gameResult = null;

    return true;
  }

  private checkGameOver(): void {
    const legalMoves = this.getAllLegalMoves(this.currentTurn);

    if (legalMoves.length === 0) {
      this.gameOver = true;
      if (this.isInCheck(this.currentTurn)) {
        this.gameResult = {
          type: 'checkmate',
          winner: this.currentTurn === 'white' ? 'black' : 'white',
        };
      } else {
        this.gameResult = { type: 'stalemate' };
      }
    } else if (this.halfMoveClock >= 100) {
      this.gameOver = true;
      this.gameResult = { type: 'fifty-move-rule' };
    }
  }

  getMoveNotation(move: ChessMove): string {
    const piece = this.getPiece(move.from.row, move.from.col);
    const pieceType = this.getPieceType(piece);
    const files = 'abcdefgh';
    const ranks = '87654321';

    if (move.castling === 'kingSide') return 'O-O';
    if (move.castling === 'queenSide') return 'O-O-O';

    let notation = '';

    if (pieceType && pieceType !== 'P') {
      notation += pieceType;
    }

    if (this.getPiece(move.to.row, move.to.col) || move.enPassant) {
      if (pieceType === 'P') {
        notation += files[move.from.col] ?? '';
      }
      notation += 'x';
    }

    notation += (files[move.to.col] ?? '') + (ranks[move.to.row] ?? '');

    return notation;
  }

  toFen(): string {
    let fen = '';

    for (let row = 0; row < 8; row++) {
      let emptyCount = 0;
      for (let col = 0; col < 8; col++) {
        const piece = this.board[row]?.[col] ?? '';
        if (piece === '') {
          emptyCount++;
        } else {
          if (emptyCount > 0) {
            fen += emptyCount;
            emptyCount = 0;
          }
          fen += piece;
        }
      }
      if (emptyCount > 0) {
        fen += emptyCount;
      }
      if (row < 7) {
        fen += '/';
      }
    }

    fen += ' ' + (this.currentTurn === 'white' ? 'w' : 'b');

    let castling = '';
    if (this.castlingRights.white.kingSide) castling += 'K';
    if (this.castlingRights.white.queenSide) castling += 'Q';
    if (this.castlingRights.black.kingSide) castling += 'k';
    if (this.castlingRights.black.queenSide) castling += 'q';
    fen += ' ' + (castling || '-');

    if (this.enPassantTarget) {
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
      fen += ' ' + (files[this.enPassantTarget.col] ?? '') + (ranks[this.enPassantTarget.row] ?? '');
    } else {
      fen += ' -';
    }

    fen += ' ' + this.halfMoveClock + ' ' + this.fullMoveNumber;

    return fen;
  }
}
