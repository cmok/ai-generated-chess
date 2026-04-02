import { describe, it, expect, beforeEach } from 'vitest';
import { ChessGame } from '../core/ChessGame';

describe('ChessGame', () => {
  let game: ChessGame;

  beforeEach(() => {
    game = new ChessGame();
  });

  describe('initialization', () => {
    it('should initialize with correct starting position', () => {
      expect(game.getPiece(0, 0)).toBe('r');
      expect(game.getPiece(0, 1)).toBe('n');
      expect(game.getPiece(0, 2)).toBe('b');
      expect(game.getPiece(0, 3)).toBe('q');
      expect(game.getPiece(0, 4)).toBe('k');
      expect(game.getPiece(7, 4)).toBe('K');
      expect(game.getPiece(6, 0)).toBe('P');
    });

    it('should start with white turn', () => {
      expect(game.currentTurn).toBe('white');
    });

    it('should not be game over at start', () => {
      expect(game.gameOver).toBe(false);
    });
  });

  describe('piece helpers', () => {
    it('should correctly identify white pieces', () => {
      expect(game.isWhite('P')).toBe(true);
      expect(game.isWhite('K')).toBe(true);
      expect(game.isWhite('p')).toBe(false);
    });

    it('should correctly identify black pieces', () => {
      expect(game.isBlack('p')).toBe(true);
      expect(game.isBlack('k')).toBe(true);
      expect(game.isBlack('P')).toBe(false);
    });

    it('should return correct piece color', () => {
      expect(game.getPieceColor('P')).toBe('white');
      expect(game.getPieceColor('p')).toBe('black');
      expect(game.getPieceColor('')).toBeNull();
    });

    it('should return correct piece type', () => {
      expect(game.getPieceType('P')).toBe('P');
      expect(game.getPieceType('p')).toBe('P');
      expect(game.getPieceType('K')).toBe('K');
    });
  });

  describe('pawn moves', () => {
    it('should allow white pawn to move forward one square', () => {
      const moves = game.getLegalMoves(6, 0);
      expect(moves.some(m => m.to.row === 5 && m.to.col === 0)).toBe(true);
    });

    it('should allow white pawn to move forward two squares from starting position', () => {
      const moves = game.getLegalMoves(6, 0);
      expect(moves.some(m => m.to.row === 4 && m.to.col === 0)).toBe(true);
    });

    it('should allow black pawn to move forward one square', () => {
      const moves = game.getLegalMoves(1, 0);
      expect(moves.some(m => m.to.row === 2 && m.to.col === 0)).toBe(true);
    });
  });

  describe('knight moves', () => {
    it('should allow knight to move in L-shape', () => {
      const moves = game.getLegalMoves(7, 1);
      expect(moves.some(m => m.to.row === 5 && m.to.col === 0)).toBe(true);
      expect(moves.some(m => m.to.row === 5 && m.to.col === 2)).toBe(true);
    });
  });

  describe('bishop moves', () => {
    it('should allow bishop to move diagonally after pawns move', () => {
      // Clear the board for bishop testing
      game.board = [
        ['', '', '', '', 'k', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', 'B', '', 'K', '', '', ''],
      ];
      game.currentTurn = 'white';
      game.castlingRights = {
        white: { kingSide: false, queenSide: false },
        black: { kingSide: false, queenSide: false },
      };
      const moves = game.getLegalMoves(7, 2);
      expect(moves.some(m => m.to.row === 6 && m.to.col === 3)).toBe(true);
      expect(moves.some(m => m.to.row === 5 && m.to.col === 4)).toBe(true);
    });
  });

  describe('rook moves', () => {
    it('should allow rook to move horizontally when path is clear', () => {
      // Clear the board for rook testing
      game.board = [
        ['', '', '', '', 'k', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['R', '', '', '', 'K', '', '', ''],
      ];
      game.currentTurn = 'white';
      const moves = game.getLegalMoves(7, 0);
      expect(moves.some(m => m.to.row === 7 && m.to.col === 1)).toBe(true);
      expect(moves.some(m => m.to.row === 7 && m.to.col === 2)).toBe(true);
    });
  });

  describe('queen moves', () => {
    it('should allow queen to move in all directions when path is clear', () => {
      // Clear the board for queen testing
      game.board = [
        ['', '', '', '', 'k', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'Q', '', '', ''],
      ];
      game.currentTurn = 'white';
      const moves = game.getLegalMoves(7, 4);
      expect(moves.some(m => m.to.row === 6 && m.to.col === 4)).toBe(true);
      expect(moves.some(m => m.to.row === 6 && m.to.col === 3)).toBe(true);
      expect(moves.some(m => m.to.row === 6 && m.to.col === 5)).toBe(true);
    });
  });

  describe('king moves', () => {
    it('should allow king to move one square in any direction when path is clear', () => {
      // Clear the board for king testing
      game.board = [
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'K', '', '', ''],
      ];
      game.currentTurn = 'white';
      const moves = game.getLegalMoves(7, 4);
      expect(moves.some(m => m.to.row === 6 && m.to.col === 4)).toBe(true);
      expect(moves.some(m => m.to.row === 6 && m.to.col === 3)).toBe(true);
      expect(moves.some(m => m.to.row === 6 && m.to.col === 5)).toBe(true);
    });
  });

  describe('castling', () => {
    it('should allow kingside castling when conditions are met', () => {
      // Clear the board and set up castling position
      game.board = [
        ['', '', '', '', 'k', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'K', '', '', 'R'],
      ];
      game.castlingRights.white.kingSide = true;
      game.castlingRights.white.queenSide = false;
      game.castlingRights.black.kingSide = false;
      game.castlingRights.black.queenSide = false;
      game.currentTurn = 'white';

      const moves = game.getLegalMoves(7, 4);
      expect(moves.some(m => m.castling === 'kingSide')).toBe(true);
    });
  });

  describe('makeMove', () => {
    it('should make a valid move', () => {
      const move = { from: { row: 6, col: 4 }, to: { row: 4, col: 4 } };
      const result = game.makeMove(move);
      expect(result).toBe(true);
      expect(game.getPiece(4, 4)).toBe('P');
      expect(game.getPiece(6, 4)).toBe('');
    });

    it('should switch turns after a move', () => {
      const move = { from: { row: 6, col: 4 }, to: { row: 4, col: 4 } };
      game.makeMove(move);
      expect(game.currentTurn).toBe('black');
    });

    it('should not allow move when game is over', () => {
      game.gameOver = true;
      const move = { from: { row: 6, col: 4 }, to: { row: 4, col: 4 } };
      const result = game.makeMove(move);
      expect(result).toBe(false);
    });
  });

  describe('undoMove', () => {
    it('should undo a move', () => {
      const move = { from: { row: 6, col: 4 }, to: { row: 4, col: 4 } };
      game.makeMove(move);
      game.undoMove();
      expect(game.getPiece(6, 4)).toBe('P');
      expect(game.getPiece(4, 4)).toBe('');
    });

    it('should return false when no moves to undo', () => {
      expect(game.undoMove()).toBe(false);
    });
  });

  describe('check detection', () => {
    it('should detect when king is in check', () => {
      // Rook on same file as king should put king in check
      game.board = [
        ['', '', '', '', 'k', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', 'R', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
      ];
      game.currentTurn = 'black';
      game.castlingRights = {
        white: { kingSide: false, queenSide: false },
        black: { kingSide: false, queenSide: false },
      };
      game.enPassantTarget = null;
      expect(game.isInCheck('black')).toBe(true);
    });
  });

  describe('FEN generation', () => {
    it('should generate correct FEN for starting position', () => {
      const fen = game.toFen();
      expect(fen).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    });
  });
});
