import React from 'react';
import { Controls, ControlGroup, Buttons, Button, DifficultyHint } from '../styles/GlobalStyles';
import { useGameStore } from '../store/gameStore';

export const GameControls: React.FC = () => {
  const gameMode = useGameStore((state) => state.gameMode);
  const playerColor = useGameStore((state) => state.playerColor);
  const aiDifficulty = useGameStore((state) => state.aiDifficulty);
  const isAiThinking = useGameStore((state) => state.isAiThinking);
  const setGameMode = useGameStore((state) => state.setGameMode);
  const setPlayerColor = useGameStore((state) => state.setPlayerColor);
  const setAIDifficulty = useGameStore((state) => state.setAIDifficulty);
  const resetGame = useGameStore((state) => state.resetGame);
  const undoMove = useGameStore((state) => state.undoMove);
  const flipBoard = useGameStore((state) => state.flipBoard);

  return (
    <>
      <Controls className="controls">
        <ControlGroup>
          <label htmlFor="gameMode">Game Mode:</label>
          <select
            id="gameMode"
            value={gameMode}
            onChange={(e) => setGameMode(e.target.value as 'human-vs-ai' | 'ai-vs-ai')}
          >
            <option value="human-vs-ai">Human vs AI</option>
            <option value="ai-vs-ai">AI vs AI</option>
          </select>
        </ControlGroup>

        <ControlGroup>
          <label htmlFor="playerColor">Play as:</label>
          <select
            id="playerColor"
            value={playerColor}
            onChange={(e) => setPlayerColor(e.target.value as 'white' | 'black')}
            disabled={gameMode === 'ai-vs-ai'}
          >
            <option value="white">White</option>
            <option value="black">Black</option>
          </select>
        </ControlGroup>

        <ControlGroup>
          <label htmlFor="aiDifficulty">
            AI Level (1-20): <span id="diffValue">{aiDifficulty}</span>
          </label>
          <input
            type="range"
            id="aiDifficulty"
            min={1}
            max={20}
            value={aiDifficulty}
            onChange={(e) => setAIDifficulty(parseInt(e.target.value))}
            style={{ width: '200px' }}
          />
          <DifficultyHint>
            Levels 1-3: Custom AI (Fast) | Levels 4-20: Stockfish (Grandmaster)
          </DifficultyHint>
        </ControlGroup>
      </Controls>

      <Buttons className="buttons">
        <Button onClick={resetGame}>New Game</Button>
        <Button onClick={undoMove} disabled={isAiThinking}>
          Undo Move
        </Button>
        <Button onClick={flipBoard}>Flip Board</Button>
      </Buttons>
    </>
  );
};
