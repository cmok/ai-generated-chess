import React from 'react';
import { CapturedPiecesContainer, CapturedSection, CapturedList } from '../styles/GlobalStyles';
import { Piece } from './Piece';
import { useGameStore } from '../store/gameStore';

export const CapturedPieces: React.FC = () => {
  const capturedPieces = useGameStore((state) => state.capturedPieces);

  const whiteCaptured = capturedPieces.white;
  const blackCaptured = capturedPieces.black;

  return (
    <CapturedPiecesContainer>
      <CapturedSection>
        <span className="label">Captured by Black:</span>
        <CapturedList>
          {whiteCaptured.map((piece, index) => (
            <Piece key={index} piece={piece} />
          ))}
        </CapturedList>
      </CapturedSection>
      <CapturedSection>
        <span className="label">Captured by White:</span>
        <CapturedList>
          {blackCaptured.map((piece, index) => (
            <Piece key={index} piece={piece} />
          ))}
        </CapturedList>
      </CapturedSection>
    </CapturedPiecesContainer>
  );
};
