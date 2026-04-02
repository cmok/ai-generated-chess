import React, { useMemo } from 'react';
import { ChessBoard as StyledBoard, BoardContainer } from '../styles/GlobalStyles';
import { Square } from './Square';
import { useGameStore } from '../store/gameStore';

export const ChessBoard: React.FC = () => {
  const board = useGameStore((state) => state.board);
  const isFlipped = useGameStore((state) => state.isFlipped);
  const selectedSquare = useGameStore((state) => state.selectedSquare);
  const validMoves = useGameStore((state) => state.validMoves);
  const lastMove = useGameStore((state) => state.lastMove);
  const currentTurn = useGameStore((state) => state.currentTurn);
  const gameOver = useGameStore((state) => state.gameOver);
  const selectSquare = useGameStore((state) => state.selectSquare);
  const makeMove = useGameStore((state) => state.makeMove);
  const chessGame = useGameStore((state) => state.chessGame);

  const rows = useMemo(() => {
    const base = [0, 1, 2, 3, 4, 5, 6, 7];
    return isFlipped ? [...base].reverse() : base;
  }, [isFlipped]);

  const cols = useMemo(() => {
    const base = [0, 1, 2, 3, 4, 5, 6, 7];
    return isFlipped ? [...base].reverse() : base;
  }, [isFlipped]);

  const handleSquareClick = (row: number, col: number) => {
    // If a piece is selected and this is a valid move, make the move
    if (selectedSquare) {
      const move = validMoves.find((m) => m.to.row === row && m.to.col === col);
      if (move) {
        makeMove(move);
        return;
      }
    }

    // Otherwise, select the square
    selectSquare({ row, col });
  };

  const isInCheck = (row: number, col: number): boolean => {
    if (gameOver) return false;
    const kingPos = chessGame.findKing(currentTurn);
    if (!kingPos) return false;
    if (kingPos.row !== row || kingPos.col !== col) return false;
    return chessGame.isInCheck(currentTurn);
  };

  return (
    <BoardContainer>
      <StyledBoard isFlipped={isFlipped} data-chessboard>
        {rows.map((row) =>
          cols.map((col) => {
            const piece = board[row]?.[col] ?? '';
            const isLight = (row + col) % 2 === 0;
            const isSelected =
              selectedSquare?.row === row && selectedSquare?.col === col;
            const isValidMove = validMoves.some(
              (m) => m.to.row === row && m.to.col === col && !piece
            );
            const isValidCapture = validMoves.some(
              (m) => m.to.row === row && m.to.col === col && piece
            );
            const isLastMove =
              (lastMove?.from.row === row && lastMove?.from.col === col) ||
              (lastMove?.to.row === row && lastMove?.to.col === col);
            const isCheck = isInCheck(row, col);

            return (
              <Square
                key={`${row}-${col}`}
                row={row}
                col={col}
                piece={piece}
                isLight={isLight}
                isSelected={isSelected}
                isValidMove={isValidMove}
                isValidCapture={isValidCapture}
                isLastMove={isLastMove}
                isCheck={isCheck}
                isFlipped={isFlipped}
                onClick={handleSquareClick}
              />
            );
          })
        )}
      </StyledBoard>
    </BoardContainer>
  );
};
