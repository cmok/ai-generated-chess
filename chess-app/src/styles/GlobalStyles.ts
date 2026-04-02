import styled, { createGlobalStyle, css, keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

export const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  @media (max-width: 600px) {
    .chess-board {
      width: 320px !important;
      height: 320px !important;
    }
    
    .square {
      width: 40px !important;
      height: 40px !important;
      font-size: 30px !important;
    }
    
    .controls {
      flex-direction: column;
      align-items: center;
    }
    
    .buttons {
      flex-direction: column;
      align-items: center;
    }
    
    button {
      width: 200px;
    }
  }
`;

export const Container = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 900px;
  width: 100%;
`;

export const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 25px;
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
`;

export const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin-bottom: 20px;
`;

export const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  label {
    font-weight: 600;
    color: #555;
  }

  select {
    padding: 8px 15px;
    border: 2px solid #667eea;
    border-radius: 8px;
    font-size: 14px;
    background: white;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      border-color: #764ba2;
    }
  }
`;

export const Buttons = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 20px;
`;

export const Button = styled.button<{ disabled?: boolean }>`
  padding: 12px 25px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 5px 15px rgba(102, 126, 234, 0.4)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
`;

export const GameInfo = styled.div`
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
`;

export const Status = styled.div<{ gameOver?: boolean }>`
  font-size: 1.2em;
  font-weight: 600;
  color: #333;
  margin-bottom: 10px;

  ${props => props.gameOver && css`
    animation: ${pulse} 1s infinite;
  `}
`;

export const MoveHistory = styled.div`
  color: #666;
  font-size: 0.95em;
  max-height: 60px;
  overflow-y: auto;
`;

export const BoardContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

export const ChessBoard = styled.div<{ isFlipped?: boolean }>`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  width: 480px;
  height: 480px;
  border: 4px solid #333;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  ${props => props.isFlipped && 'transform: rotate(180deg);'}
`;

export const Square = styled.div<{ 
  isLight: boolean; 
  isSelected?: boolean; 
  isValidMove?: boolean; 
  isValidCapture?: boolean; 
  isLastMove?: boolean; 
  isCheck?: boolean;
  isFlipped?: boolean;
}>`
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 45px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  position: relative;
  background: ${props => {
    if (props.isSelected) return '#7fc97f';
    if (props.isValidCapture) return 'rgba(255, 0, 0, 0.4)';
    if (props.isLastMove) return 'rgba(255, 255, 0, 0.4)';
    if (props.isCheck) return 'rgba(255, 0, 0, 0.6)';
    return props.isLight ? '#f0d9b5' : '#b58863';
  }};

  &:hover {
    filter: brightness(1.1);
  }

  ${props => props.isSelected && css`
    box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
  `}

  ${props => props.isValidMove && !props.isValidCapture && css`
    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      background: rgba(0, 128, 0, 0.5);
      border-radius: 50%;
    }
  `}
`;

export const Piece = styled.span<{ isWhite: boolean; isFlipped?: boolean }>`
  cursor: grab;
  transition: transform 0.1s ease;
  color: ${props => props.isWhite ? '#fff' : '#000'};
  text-shadow: ${props => props.isWhite 
    ? '0 0 2px #000, 0 0 2px #000' 
    : '0 0 2px #fff, 0 0 2px #fff'};
  ${props => props.isFlipped && 'transform: rotate(180deg);'}

  &:active {
    cursor: grabbing;
    transform: scale(1.1);
  }
`;

export const CapturedPiecesContainer = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 10px;
`;

export const CapturedSection = styled.div`
  text-align: center;

  .label {
    display: block;
    font-weight: 600;
    color: #555;
    margin-bottom: 8px;
  }
`;

export const CapturedList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  min-height: 30px;
  font-size: 24px;
`;

export const DifficultyHint = styled.small`
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
`;

export const ResponsiveStyles = createGlobalStyle`
  @media (max-width: 600px) {
    .chess-board {
      width: 320px !important;
      height: 320px !important;
    }
  }
`;
