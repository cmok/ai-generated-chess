# Chess App - React + TypeScript

A fully-featured chess game built with React, TypeScript, and styled-components. Play against an AI opponent or watch two AIs battle it out.

## Features

- **Multiple Game Modes**
  - Human vs AI (play as White or Black)
  - AI vs AI (watch computer players compete)

- **Complete Chess Rules**
  - All standard moves including castling, en passant, and pawn promotion
  - Check, checkmate, and stalemate detection
  - Draw by repetition and insufficient material

- **AI Opponent**
  - Hybrid AI system: Custom Minimax (levels 1-3) + Stockfish engine (levels 4-20)
  - 20 difficulty levels for all skill levels

- **Modern Tech Stack**
  - React 18 with TypeScript
  - Zustand for state management
  - styled-components for styling
  - Vite for fast builds and HMR
  - Vitest for testing

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
```

## Project Structure

```
chess-app/
├── src/
│   ├── types/
│   │   └── chess.ts           # TypeScript interfaces
│   ├── core/
│   │   ├── ChessGame.ts       # Game logic
│   │   └── ChessAI.ts         # AI engine
│   ├── store/
│   │   └── gameStore.ts       # Zustand store
│   ├── components/
│   │   ├── ChessBoard.tsx     # Board container
│   │   ├── Square.tsx         # Individual square
│   │   ├── Piece.tsx          # Chess piece display
│   │   ├── GameControls.tsx   # Game controls
│   │   ├── GameInfo.tsx       # Status & move history
│   │   └── CapturedPieces.tsx # Captured pieces display
│   ├── styles/
│   │   └── GlobalStyles.ts    # styled-components
│   ├── __tests__/
│   │   └── ChessGame.test.ts  # Unit tests
│   ├── App.tsx                # Main app component
│   └── main.tsx               # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Zustand** - State management
- **styled-components** - CSS-in-JS styling
- **Vite** - Build tool and dev server
- **Vitest** - Testing framework

## License

MIT
