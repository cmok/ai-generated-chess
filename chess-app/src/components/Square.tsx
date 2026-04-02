import React from 'react';
import { Square as StyledSquare } from '../styles/GlobalStyles';
import { Piece } from './Piece';

interface SquareProps {
  row: number;
  col: number;
  piece: string;
  isLight: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isValidCapture: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  isFlipped: boolean;
  onClick: (row: number, col: number) => void;
}

export const Square: React.FC<SquareProps> = ({
  row,
  col,
  piece,
  isLight,
  isSelected,
  isValidMove,
  isValidCapture,
  isLastMove,
  isCheck,
  isFlipped,
  onClick,
}) => {
  return (
    <StyledSquare
      isLight={isLight}
      isSelected={isSelected}
      isValidMove={isValidMove}
      isValidCapture={isValidCapture}
      isLastMove={isLastMove}
      isCheck={isCheck}
      isFlipped={isFlipped}
      onClick={() => onClick(row, col)}
    >
      {piece && <Piece piece={piece} isFlipped={isFlipped} />}
    </StyledSquare>
  );
};
