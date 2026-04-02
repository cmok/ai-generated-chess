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

  // Helper to sync store state from chessGame
  const syncState = () => {
    const { chessGame } = get();
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
      lastMove:
        chessGame.moveHistory.length > 0
          ? chessGame.moveHistory[chessGame.moveHistory.length - 1]?.move ?? null
          : null,
    });
  };

  // Helper to check if it's the AI's turn
  const isAITurn = (): boolean => {
    const { gameMode, playerColor } = get();
    const { currentTurn } = get().chessGame;
    if (gameMode === 'ai-vs-ai') return true;
    if (gameMode === 'human-vs-ai' && currentTurn !== playerColor) return true;
    return false;
  };

  // Helper to schedule next AI move
  const scheduleNextAIMove = (delay: number = 500) => {
    setTimeout(() => {
      const state = get();
      if (!state.gameOver && !state.isAiThinking && isAITurn()) {
        state.makeAIMove();
      }
    }, delay);
  };

  return {
    ...createInitialState(),
    chessGame,
    ai: new ChessAI(chessGame, 10),

    initializeGame: () => {
      const { aiDifficulty, gameMode, playerColor } = get();
      chessGame.reset();
      const ai = new ChessAI(chessGame, aiDifficulty);

      // Reset only game-related state, preserve gameMode and playerColor
      set({
        board: chessGame.board.map((row) => [...row]),
        currentTurn: chessGame.currentTurn,
        castlingRights: JSON.parse(JSON.stringify(chessGame.castlingRights)),
        enPassantTarget: chessGame.enPassantTarget,
        halfMoveClock: chessGame.halfMoveClock,
        fullMoveNumber: chessGame.fullMoveNumber,
        moveHistory: [],
        capturedPieces: { white: [], black: [] },
        gameOver: false,
        gameResult: null,
        selectedSquare: null,
        validMoves: [],
        isFlipped: false,
        isAiThinking: false,
        lastMove: null,
        ai,
        aiDifficulty,
        gameMode,
        playerColor,
      });

      // Schedule AI's first move if it's the AI's turn
      if (isAITurn()) {
        scheduleNextAIMove(500);
      }
    },

    resetGame: () => {
      get().initializeGame();
    },

    selectSquare: (position: Position | null) => {
      if (position) {
        const { chessGame, currentTurn, gameMode, playerColor, isAiThinking, gameOver } = get();

        if (isAiThinking || gameOver) return;
        if (gameMode === 'ai-vs-ai') return;
        if (gameMode === 'human-vs-ai' && currentTurn !== playerColor) return;

        const piece = chessGame.getPiece(position.row, position.col);
        const pieceColor = chessGame.getPieceColor(piece);

        if (piece && pieceColor === currentTurn) {
          const validMoves = chessGame.getLegalMoves(position.row, position.col);
          set({ selectedSquare: position, validMoves });
        } else {
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
        syncState();
        set({ selectedSquare: null, validMoves: [] });

        // Schedule next AI move if it's now the AI's turn
        if (!chessGame.gameOver && isAITurn()) {
          scheduleNextAIMove(500);
        }
      }

      return success;
    },

    undoMove: () => {
      const { chessGame, gameMode } = get();

      if (gameMode === 'human-vs-ai') {
        chessGame.undoMove();
        chessGame.undoMove();
      } else {
        chessGame.undoMove();
      }

      syncState();
      set({ selectedSquare: null, validMoves: [] });
    },

    flipBoard: () => {
      set((state) => ({ isFlipped: !state.isFlipped }));
    },

    setGameMode: (mode: GameMode) => {
      set({ gameMode: mode });
      get().initializeGame();
    },

    setPlayerColor: (color: PieceColor) => {
      set({ playerColor: color });
      get().initializeGame();
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
      if (!isAITurn()) return;

      set({ isAiThinking: true });

      // Use setTimeout to allow UI to update before AI thinks
      await new Promise((resolve) => setTimeout(resolve, 100));

      const aiColor = chessGame.currentTurn;
      
      // Add timeout to prevent AI from freezing
      const movePromise = ai?.getBestMove(aiColor);
      const timeoutPromise = new Promise<null>((resolve) =>
        setTimeout(() => resolve(null), 10000) // 10 second timeout
      );
      
      const move = await Promise.race([movePromise, timeoutPromise]);

      // Always reset thinking state before making the move
      set({ isAiThinking: false });

      if (move) {
        get().makeMove(move);
      }

      // Continue AI vs AI
      const state = get();
      if (!state.gameOver && state.gameMode === 'ai-vs-ai') {
        scheduleNextAIMove(500);
      }
    },
  };
});
