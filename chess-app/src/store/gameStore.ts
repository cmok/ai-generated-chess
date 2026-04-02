import { create } from 'zustand';
import { ChessGame } from '../core/ChessGame';
import { ChessAI } from '../core/ChessAI';
import type {
  GameState,
  ChessMove,
  PieceColor,
  GameMode,
  Position,
} from '../types/chess';

interface GameStore extends GameState {
  chessGame: ChessGame;
  ai: ChessAI | null;

  // Actions
  initializeGame: () => void;
  resetGame: () => void;
  selectSquare: (position: Position | null) => void;
  makeMove: (move: ChessMove) => boolean;
  undoMove: () => void;
  flipBoard: () => void;
  setGameMode: (mode: GameMode) => void;
  setPlayerColor: (color: PieceColor) => void;
  setAIDifficulty: (difficulty: number) => void;
  makeAIMove: () => Promise<void>;
  setIsAiThinking: (thinking: boolean) => void;
}

const createInitialState = (): Omit<GameState, 'chessGame' | 'ai'> => ({
  board: [],
  currentTurn: 'white',
  castlingRights: {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true },
  },
  enPassantTarget: null,
  halfMoveClock: 0,
  fullMoveNumber: 1,
  moveHistory: [],
  capturedPieces: { white: [], black: [] },
  gameOver: false,
  gameResult: null,
  selectedSquare: null,
  validMoves: [],
  isFlipped: false,
  gameMode: 'human-vs-ai',
  playerColor: 'white',
  aiDifficulty: 10,
  isAiThinking: false,
  lastMove: null,
});

export const useGameStore = create<GameStore>((set, get) => {
  const chessGame = new ChessGame();

  return {
    ...createInitialState(),
    chessGame,
    ai: new ChessAI(chessGame, 10),

    initializeGame: () => {
      const { chessGame, aiDifficulty } = get();
      chessGame.reset();
      const ai = new ChessAI(chessGame, aiDifficulty);
      const state = chessGame;

      set({
        board: state.board.map((row) => [...row]),
        currentTurn: state.currentTurn,
        castlingRights: JSON.parse(JSON.stringify(state.castlingRights)),
        enPassantTarget: state.enPassantTarget,
        halfMoveClock: state.halfMoveClock,
        fullMoveNumber: state.fullMoveNumber,
        moveHistory: [],
        capturedPieces: { white: [], black: [] },
        gameOver: false,
        gameResult: null,
        selectedSquare: null,
        validMoves: [],
        lastMove: null,
        isAiThinking: false,
        ai,
      });
    },

    resetGame: () => {
      get().initializeGame();
    },

    selectSquare: (position: Position | null) => {
      if (position) {
        const { chessGame, currentTurn, gameMode, playerColor, isAiThinking, gameOver } = get();

        if (isAiThinking || gameOver) return;

        // In AI vs AI mode, ignore selection
        if (gameMode === 'ai-vs-ai') return;

        // In human vs AI mode, only allow selection for player's color
        if (gameMode === 'human-vs-ai' && currentTurn !== playerColor) return;

        const piece = chessGame.getPiece(position.row, position.col);
        const pieceColor = chessGame.getPieceColor(piece);

        if (piece && pieceColor === currentTurn) {
          const validMoves = chessGame.getLegalMoves(position.row, position.col);
          set({ selectedSquare: position, validMoves });
        } else {
          // Check if clicking on a valid move destination
          const move = get().validMoves.find(
            (m) => m.to.row === position.row && m.to.col === position.col
          );
          if (move) {
            get().makeMove(move);
          } else {
            set({ selectedSquare: null, validMoves: [] });
          }
        }
      } else {
        set({ selectedSquare: null, validMoves: [] });
      }
    },

    makeMove: (move: ChessMove): boolean => {
      const { chessGame } = get();
      const success = chessGame.makeMove(move);

      if (success) {
        set({
          board: chessGame.board.map((row) => [...row]),
          currentTurn: chessGame.currentTurn,
          castlingRights: JSON.parse(JSON.stringify(chessGame.castlingRights)),
          enPassantTarget: chessGame.enPassantTarget,
          halfMoveClock: chessGame.halfMoveClock,
          fullMoveNumber: chessGame.fullMoveNumber,
          moveHistory: [...chessGame.moveHistory],
          capturedPieces: JSON.parse(JSON.stringify(chessGame.capturedPieces)),
          gameOver: chessGame.gameOver,
          gameResult: chessGame.gameResult,
          selectedSquare: null,
          validMoves: [],
          lastMove: move,
        });
      }

      return success;
    },

    undoMove: () => {
      const { chessGame, gameMode } = get();

      if (gameMode === 'human-vs-ai') {
        // Undo both AI and human moves
        chessGame.undoMove();
        chessGame.undoMove();
      } else {
        chessGame.undoMove();
      }

      set({
        board: chessGame.board.map((row) => [...row]),
        currentTurn: chessGame.currentTurn,
        castlingRights: JSON.parse(JSON.stringify(chessGame.castlingRights)),
        enPassantTarget: chessGame.enPassantTarget,
        halfMoveClock: chessGame.halfMoveClock,
        fullMoveNumber: chessGame.fullMoveNumber,
        moveHistory: [...chessGame.moveHistory],
        capturedPieces: JSON.parse(JSON.stringify(chessGame.capturedPieces)),
        gameOver: chessGame.gameOver,
        gameResult: chessGame.gameResult,
        selectedSquare: null,
        validMoves: [],
        lastMove:
          chessGame.moveHistory.length > 0
            ? chessGame.moveHistory[chessGame.moveHistory.length - 1]?.move ?? null
            : null,
      });
    },

    flipBoard: () => {
      set((state) => ({ isFlipped: !state.isFlipped }));
    },

    setGameMode: (mode: GameMode) => {
      set({ gameMode: mode });
      get().resetGame();
    },

    setPlayerColor: (color: PieceColor) => {
      set({ playerColor: color });
      get().resetGame();
    },

    setAIDifficulty: (difficulty: number) => {
      const { ai } = get();
      if (ai) {
        ai.setDifficulty(difficulty);
      }
      set({ aiDifficulty: difficulty });
    },

    setIsAiThinking: (thinking: boolean) => {
      set({ isAiThinking: thinking });
    },

    makeAIMove: async () => {
      const { chessGame, ai, gameOver, isAiThinking } = get();

      if (gameOver || isAiThinking) return;

      set({ isAiThinking: true });

      // Use setTimeout to allow UI to update before AI thinks
      await new Promise((resolve) => setTimeout(resolve, 100));

      const aiColor = chessGame.currentTurn;
      const move = await ai?.getBestMove(aiColor);

      if (move) {
        get().makeMove(move);
      }

      set({ isAiThinking: false });

      // Continue AI vs AI
      const state = get();
      if (!state.gameOver && state.gameMode === 'ai-vs-ai') {
        setTimeout(() => get().makeAIMove(), 500);
      }
    },
  };
});
