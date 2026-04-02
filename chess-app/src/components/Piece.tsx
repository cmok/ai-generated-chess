import React from 'react';
import { Piece as StyledPiece } from '../styles/GlobalStyles';

interface PieceProps {
  piece: string;
  isFlipped?: boolean;
}

const PIECE_SYMBOLS: Record<string, string> = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟',
};

export const Piece: React.FC<PieceProps> = ({ piece, isFlipped }) => {
  const isWhite = piece === piece.toUpperCase();
  const symbol = PIECE_SYMBOLS[piece];

  if (!symbol) return null;

  return (
    <StyledPiece isWhite={isWhite} isFlipped={isFlipped}>
      {symbol}
    </StyledPiece>
  );
};
