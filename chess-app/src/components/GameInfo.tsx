import React from 'react';
import { GameInfo, Status, MoveHistory } from '../styles/GlobalStyles';
import { useGameStore } from '../store/gameStore';

export const GameInfoComponent: React.FC = () => {
  const currentTurn = useGameStore((state) => state.currentTurn);
  const gameOver = useGameStore((state) => state.gameOver);
  const gameResult = useGameStore((state) => state.gameResult);
  const isAiThinking = useGameStore((state) => state.isAiThinking);
  const moveHistory = useGameStore((state) => state.moveHistory);
  const chessGame = useGameStore((state) => state.chessGame);

  const getStatusText = (): string => {
    if (gameOver) {
      if (gameResult?.type === 'checkmate') {
        const winner = gameResult.winner;
        return `Checkmate! ${winner?.charAt(0).toUpperCase() + winner?.slice(1)} wins!`;
      } else if (gameResult?.type === 'stalemate') {
        return 'Stalemate! Draw.';
      } else {
        return 'Draw by fifty-move rule.';
      }
    }

    const turn = currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1);
    let statusText = `${turn}'s turn`;

    if (chessGame.isInCheck(currentTurn)) {
      statusText += ' - Check!';
    }

    if (isAiThinking) {
      statusText += ' (AI thinking...)';
    }

    return statusText;
  };

  const getMoveHistoryText = (): string => {
    const moves = moveHistory.map((entry, index) => {
      const moveNum = Math.floor(index / 2) + 1;
      const notation = entry.notation;

      if (index % 2 === 0) {
        return `${moveNum}. ${notation}`;
      } else {
        return notation;
      }
    });
    return 'Moves: ' + moves.join(' ');
  };

  return (
    <GameInfo>
      <Status gameOver={gameOver}>{getStatusText()}</Status>
      <MoveHistory>{getMoveHistoryText()}</MoveHistory>
    </GameInfo>
  );
};
