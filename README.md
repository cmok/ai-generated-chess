# Chess Game - Human vs AI

A fully-featured chess game that runs in your browser, allowing you to play against an AI opponent or watch two AIs battle it out. Built with vanilla JavaScript, HTML, and CSS - no external dependencies required.

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
  - Levels 1-3: Fast custom AI with alpha-beta pruning (beginner to intermediate)
  - Levels 4-20: Stockfish chess engine (intermediate to grandmaster level)
  - Configurable search depth and thinking time
  
- **User Interface**
  - Clean, responsive design that works on desktop and mobile
  - Visual move hints and highlights
  - Move history and captured pieces display
  - Undo moves and flip board functionality
  - Game status indicators

## Quick Start

### Option 1: Open Directly in Browser
Simply open the `index.html` file in any modern web browser:

```bash
# On Linux/Mac
xdg-open index.html        # Linux
open index.html            # Mac

# On Windows
start index.html
```

Or drag and drop `index.html` into your browser window.

### Option 2: Use a Local Web Server
For the best experience, serve the files using a local web server:

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if http-server is installed)
npx http-server -p 8000
```

Then open your browser and navigate to `http://localhost:8000`

## How to Play

1. **Select Game Mode**: Choose between "Human vs AI" or "AI vs AI"
2. **Choose Difficulty**: Select a level from 1-20 using the slider
   - Levels 1-3: Custom AI (fast, good for beginners)
   - Levels 4-20: Stockfish engine (strong, grandmaster level at 20)
3. **Pick Your Side** (Human vs AI only): Choose to play as White or Black
4. **Make Moves**: Click on a piece to select it, then click on a valid square to move
5. **Special Moves**: 
   - Castling: Move your king two squares toward a rook
   - En Passant: Capture a pawn that moved two squares forward
   - Promotion: Pawns automatically promote to queens when reaching the opposite end

## Controls

- **Click**: Select and move pieces
- **Undo**: Take back the last move
- **Flip Board**: Rotate the board view
- **New Game**: Start a fresh game
- **Difficulty Selector**: Change AI strength during gameplay

## File Structure

```
/workspace/
├── index.html      # Main HTML page
├── styles.css      # Styling and responsive design
├── chess.js        # Chess game logic and rules
├── ai.js           # AI implementation with minimax
├── game.js         # UI controller and event handling
└── README.md       # This file
```

## Technical Details

- **Hybrid AI System**: 
  - Levels 1-3: Custom minimax with alpha-beta pruning and positional evaluation
  - Levels 4-20: Stockfish chess engine (via stockfish.js CDN)
- **No Local Dependencies**: Pure vanilla JavaScript, Stockfish loaded from CDN
- **Responsive Design**: Works on all screen sizes
- **Complete Rule Set**: Implements all FIDE chess rules
- **FEN Support**: Board state export for engine integration

## License

This project is open source and available under the MIT License.
