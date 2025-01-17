import React, { useState } from 'react';
import './App.css';

function App() {
  const initialBoard = [
    ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
    ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
    ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
  ];

  const [selectedPiece, setSelectedPiece] = useState(null);
  const [boardState, setBoardState] = useState(initialBoard);

  const board = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const isLight = (row + col) % 2 === 0;
      board.push(
        <div
          key={`${row}-${col}`}
          className={`square ${isLight ? 'light' : 'dark'}`}
          onClick={() => handleSquareClick(row, col)}
        >
          {boardState[row][col]}
        </div>
      );
    }
  }

  function handleSquareClick(row, col) {
    if (selectedPiece) {
      // Move piece
      const [selectedRow, selectedCol] = selectedPiece;
      const piece = boardState[selectedRow][selectedCol];
      if (piece === '♟' || piece === '♙') { // Pawn move
        if (col === selectedCol && (row === selectedRow + (piece === '♙' ? -1 : 1)) && boardState[row][col] === null) {
          const newBoardState = [...boardState];
          newBoardState[row][col] = newBoardState[selectedRow][selectedCol];
          newBoardState[selectedRow][selectedCol] = null;
          setBoardState(newBoardState);
        }
      } else if (piece === '♜' || piece === '♖') { // Rook move
        if ((row === selectedRow || col === selectedCol) && boardState[row][col] === null) {
          const newBoardState = [...boardState];
           newBoardState[row][col] = newBoardState[selectedRow][selectedCol];
          newBoardState[selectedRow][selectedCol] = null;
          setBoardState(newBoardState);
        }
      } else if (piece === '♞' || piece === '♘') { // Knight move
        const rowDiff = Math.abs(row - selectedRow);
        const colDiff = Math.abs(col - selectedCol);
        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
          const newBoardState = [...boardState];
          newBoardState[row][col] = newBoardState[selectedRow][selectedCol];
          newBoardState[selectedRow][selectedCol] = null;
          setBoardState(newBoardState);
        }
      } else if (piece === '♝' || piece === '♗') { // Bishop move
        if (Math.abs(row - selectedRow) === Math.abs(col - selectedCol) && boardState[row][col] === null) {
          const newBoardState = [...boardState];
          newBoardState[row][col] = newBoardState[selectedRow][selectedCol];
          newBoardState[selectedRow][selectedCol] = null;
          setBoardState(newBoardState);
        }
      } else if (piece === '♛' || piece === '♕') { // Queen move
        if ((row === selectedRow || col === selectedCol || Math.abs(row - selectedRow) === Math.abs(col - selectedCol)) && boardState[row][col] === null) {
          const newBoardState = [...boardState];
          newBoardState[row][col] = newBoardState[selectedRow][selectedCol];
          newBoardState[selectedRow][selectedCol] = null;
          setBoardState(newBoardState);
        }
      } else if (piece === '♚' || piece === '♔') { // King move
        const rowDiff = Math.abs(row - selectedRow);
        const colDiff = Math.abs(col - selectedCol);
        if ((rowDiff <= 1 && colDiff <= 1) && boardState[row][col] === null) {
          const newBoardState = [...boardState];
          newBoardState[row][col] = newBoardState[selectedRow][selectedCol];
          newBoardState[selectedRow][selectedCol] = null;
          setBoardState(newBoardState);
        }
      }
       else if (boardState[row][col] === null) {
        const newBoardState = [...boardState];
        newBoardState[row][col] = newBoardState[selectedRow][selectedCol];
        newBoardState[selectedRow][selectedCol] = null;
        setBoardState(newBoardState);
      }
      setSelectedPiece(null);
    } else if (boardState[row][col]) {
      // Select piece
      setSelectedPiece([row, col]);
    }
  }

  return <div className="board">{board}</div>;
}

export default App;
