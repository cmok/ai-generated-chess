# Chess App - React + TypeScript

A fully-featured chess game built with React, TypeScript, and styled-components. Play against an AI opponent or watch two AIs battle it out.

## Features

- **Multiple Game Modes**
  - Human vs AI (play as White or Black)
  - AI vs AI (watch computer players compete)

- **Complete Chess Rules**
  - All standard moves including castling, en passant, and pawn promotion
  - Check, checkmate, and stalemate detection
  - Draw by fifty-move rule

- **AI Opponent**
  - Hybrid AI system: Custom Minimax (levels 1-3) + Stockfish engine (levels 4-20)
  - 20 difficulty levels for all skill levels
  - Levels 1-3: Fast custom AI with alpha-beta pruning
  - Levels 4-20: Stockfish chess engine

- **User Interface**
  - Clean, responsive design
  - Visual move hints and highlights
  - Move history and captured pieces display
  - Undo moves and flip board functionality

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests with UI
npm run test:ui
```

## Project Structure

```
chess-app/
├── src/
│   ├── types/
│   │   └── chess.ts           # TypeScript interfaces and types
│   ├── core/
│   │   ├── ChessGame.ts       # Core chess game logic
│   │   └── ChessAI.ts         # AI engine (Minimax + Stockfish)
│   ├── store/
│   │   └── gameStore.ts       # Zustand state management
│   ├── components/
│   │   ├── ChessBoard.tsx     # Board container component
│   │   ├── Square.tsx         # Individual board square
│   │   ├── Piece.tsx          # Chess piece display
│   │   ├── GameControls.tsx   # Game mode and difficulty controls
│   │   ├── GameInfo.tsx       # Status and move history display
│   │   └── CapturedPieces.tsx # Captured pieces display
│   ├── styles/
│   │   └── GlobalStyles.ts    # styled-components definitions
│   ├── __tests__/
│   │   └── ChessGame.test.ts  # Unit tests for core logic
│   ├── test/
│   │   └── setup.ts           # Test setup file
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # Application entry point
│   └── vite-env.d.ts          # Vite type declarations
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - Lightweight state management
- **styled-components** - CSS-in-JS styling
- **Vite** - Fast build tool and dev server
- **Vitest** - Unit testing framework

## Architecture

The app follows a clean architecture pattern:

1. **Core Layer** (`src/core/`) - Pure TypeScript classes for game logic and AI, completely framework-agnostic
2. **State Layer** (`src/store/`) - Zustand store that bridges core logic with React
3. **UI Layer** (`src/components/`) - React components that render the game state

### State Flow

```
User Action → Store Action → Core Logic → State Update → UI Re-render
```

## Development

```bash
# Start dev server with hot reload
npm run dev

# Type check
npx tsc --noEmit

# Run tests
npm test

# Build for production
npm run build
```

## License

MIT
