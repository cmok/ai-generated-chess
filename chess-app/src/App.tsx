import React, { useEffect } from 'react';
import { GlobalStyle, Container, Title, ResponsiveStyles } from './styles/GlobalStyles';
import { ChessBoard } from './components/ChessBoard';
import { GameControls } from './components/GameControls';
import { GameInfoComponent } from './components/GameInfo';
import { CapturedPieces } from './components/CapturedPieces';
import { useGameStore } from './store/gameStore';

const App: React.FC = () => {
  const initializeGame = useGameStore((state) => state.initializeGame);
  const gameMode = useGameStore((state) => state.gameMode);
  const playerColor = useGameStore((state) => state.playerColor);
  const makeAIMove = useGameStore((state) => state.makeAIMove);
  const gameOver = useGameStore((state) => state.gameOver);
  const isAiThinking = useGameStore((state) => state.isAiThinking);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle AI first move or AI vs AI mode
  useEffect(() => {
    if (gameOver || isAiThinking) return;

    const shouldAIMove =
      gameMode === 'ai-vs-ai' ||
      (gameMode === 'human-vs-ai' && playerColor === 'black');

    if (shouldAIMove) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [gameMode, playerColor, gameOver, isAiThinking, makeAIMove]);

  return (
    <>
      <GlobalStyle />
      <ResponsiveStyles />
      <Container>
        <Title>&#9812; Chess Game &#9818;</Title>
        <GameControls />
        <GameInfoComponent />
        <ChessBoard />
        <CapturedPieces />
      </Container>
    </>
  );
};

export default App;
