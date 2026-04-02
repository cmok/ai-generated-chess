import React, { useEffect } from 'react';
import { GlobalStyle, Container, Title, ResponsiveStyles } from './styles/GlobalStyles';
import { ChessBoard } from './components/ChessBoard';
import { GameControls } from './components/GameControls';
import { GameInfoComponent } from './components/GameInfo';
import { CapturedPieces } from './components/CapturedPieces';
import { ThinkingSpinner } from './components/ThinkingSpinner';
import { useGameStore } from './store/gameStore';

const App: React.FC = () => {
  const initializeGame = useGameStore((state) => state.initializeGame);
  const isAiThinking = useGameStore((state) => state.isAiThinking);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

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
      <ThinkingSpinner visible={isAiThinking} />
    </>
  );
};

export default App;
