/**
 * Chess Game UI and Controller
 * Handles user interaction, board rendering, and game flow
 */

class ChessUI {
    constructor() {
        this.game = new ChessGame();
        this.ai = new ChessAI(this.game, 2);
        
        this.selectedSquare = null;
        this.validMoves = [];
        this.isFlipped = false;
        this.gameMode = 'human-vs-ai';
        this.playerColor = 'white';
        this.isAiThinking = false;
        
        this.pieceSymbols = {
            'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
            'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
        };
        
        this.initElements();
        this.bindEvents();
        this.renderBoard();
    }
    
    initElements() {
        this.boardElement = document.getElementById('chessboard');
        this.statusElement = document.getElementById('status');
        this.moveHistoryElement = document.getElementById('moveHistory');
        this.capturedWhiteElement = document.getElementById('capturedWhite');
        this.capturedBlackElement = document.getElementById('capturedBlack');
        this.gameModeSelect = document.getElementById('gameMode');
        this.playerColorSelect = document.getElementById('playerColor');
        this.aiDifficultySelect = document.getElementById('aiDifficulty');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.flipBoardBtn = document.getElementById('flipBoardBtn');
    }
    
    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.undoBtn.addEventListener('click', () => this.undoMove());
        this.flipBoardBtn.addEventListener('click', () => this.flipBoard());
        
        this.gameModeSelect.addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.playerColorSelect.disabled = this.gameMode === 'ai-vs-ai';
            this.startNewGame();
        });
        
        this.playerColorSelect.addEventListener('change', (e) => {
            this.playerColor = e.target.value;
            this.startNewGame();
        });
        
        this.aiDifficultySelect.addEventListener('change', (e) => {
            this.ai.setDifficulty(parseInt(e.target.value));
        });
    }
    
    startNewGame() {
        this.game.reset();
        this.ai = new ChessAI(this.game, parseInt(this.aiDifficultySelect.value));
        this.selectedSquare = null;
        this.validMoves = [];
        this.isAiThinking = false;
        this.isFlipped = false;
        
        this.updateStatus();
        this.renderBoard();
        this.updateCapturedPieces();
        this.updateMoveHistory();
        
        // If AI vs AI or player is black, AI makes first move
        if (this.gameMode === 'ai-vs-ai' || 
            (this.gameMode === 'human-vs-ai' && this.playerColor === 'black')) {
            setTimeout(() => this.makeAiMove(), 500);
        }
    }
    
    flipBoard() {
        this.isFlipped = !this.isFlipped;
        this.renderBoard();
    }
    
    renderBoard() {
        this.boardElement.innerHTML = '';
        this.boardElement.className = this.isFlipped ? 'board-flipped' : '';
        
        const rows = this.isFlipped ? [7,6,5,4,3,2,1,0].reverse() : [0,1,2,3,4,5,6,7];
        const cols = this.isFlipped ? [7,6,5,4,3,2,1,0].reverse() : [0,1,2,3,4,5,6,7];
        
        for (const row of rows) {
            for (const col of cols) {
                const square = document.createElement('div');
                const isLight = (row + col) % 2 === 0;
                square.className = `square ${isLight ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const piece = this.game.getPiece(row, col);
                if (piece) {
                    const pieceSpan = document.createElement('span');
                    pieceSpan.className = 'piece';
                    pieceSpan.textContent = this.pieceSymbols[piece];
                    pieceSpan.style.color = this.game.isWhite(piece) ? '#fff' : '#000';
                    pieceSpan.style.textShadow = this.game.isWhite(piece) 
                        ? '0 0 2px #000, 0 0 2px #000' 
                        : '0 0 2px #fff, 0 0 2px #fff';
                    square.appendChild(pieceSpan);
                }
                
                // Highlight selected square
                if (this.selectedSquare && 
                    this.selectedSquare.row === row && 
                    this.selectedSquare.col === col) {
                    square.classList.add('selected');
                }
                
                // Highlight valid moves
                const isValidMove = this.validMoves.some(m => 
                    m.to.row === row && m.to.col === col
                );
                if (isValidMove) {
                    const targetPiece = this.game.getPiece(row, col);
                    if (targetPiece) {
                        square.classList.add('valid-capture');
                    } else {
                        square.classList.add('valid-move');
                    }
                }
                
                // Highlight last move
                if (this.game.moveHistory.length > 0) {
                    const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1].move;
                    if ((lastMove.from.row === row && lastMove.from.col === col) ||
                        (lastMove.to.row === row && lastMove.to.col === col)) {
                        square.classList.add('last-move');
                    }
                }
                
                // Highlight king in check
                if (this.game.isInCheck(this.game.currentTurn)) {
                    const kingPos = this.game.findKing(this.game.currentTurn);
                    if (kingPos && kingPos.row === row && kingPos.col === col) {
                        square.classList.add('check');
                    }
                }
                
                square.addEventListener('click', () => this.handleSquareClick(row, col));
                this.boardElement.appendChild(square);
            }
        }
    }
    
    handleSquareClick(row, col) {
        if (this.isAiThinking) return;
        if (this.game.gameOver) return;
        
        // In AI vs AI mode, ignore clicks
        if (this.gameMode === 'ai-vs-ai') return;
        
        // In human vs AI mode, only allow clicks for player's color
        if (this.gameMode === 'human-vs-ai' && 
            this.game.currentTurn !== this.playerColor) {
            return;
        }
        
        const clickedPiece = this.game.getPiece(row, col);
        const isOwnPiece = clickedPiece && 
            this.game.getPieceColor(clickedPiece) === this.game.currentTurn;
        
        // If clicking on a valid move destination
        const move = this.validMoves.find(m => 
            m.to.row === row && m.to.col === col
        );
        
        if (move) {
            this.makeMove(move);
            return;
        }
        
        // If clicking on own piece, select it
        if (isOwnPiece) {
            this.selectedSquare = { row, col };
            this.validMoves = this.game.getLegalMoves(row, col);
            this.renderBoard();
        } else {
            // Deselect
            this.selectedSquare = null;
            this.validMoves = [];
            this.renderBoard();
        }
    }
    
    makeMove(move) {
        const notation = this.game.getMoveNotation(move);
        this.game.makeMove(move);
        
        this.selectedSquare = null;
        this.validMoves = [];
        
        this.updateStatus();
        this.renderBoard();
        this.updateCapturedPieces();
        this.updateMoveHistory(notation);
        
        // Handle AI move after human move
        if (!this.game.gameOver) {
            if (this.gameMode === 'ai-vs-ai') {
                setTimeout(() => this.makeAiMove(), 500);
            } else if (this.gameMode === 'human-vs-ai' && 
                       this.game.currentTurn !== this.playerColor) {
                setTimeout(() => this.makeAiMove(), 500);
            }
        }
    }
    
    makeAiMove() {
        if (this.game.gameOver) return;
        
        this.isAiThinking = true;
        this.updateStatus();
        
        // Use setTimeout to allow UI to update before AI thinks
        setTimeout(() => {
            const aiColor = this.game.currentTurn;
            const move = this.ai.getBestMove(aiColor);
            
            if (move) {
                const notation = this.game.getMoveNotation(move);
                this.game.makeMove(move);
                
                this.updateStatus();
                this.renderBoard();
                this.updateCapturedPieces();
                this.updateMoveHistory(notation);
                
                // Continue AI vs AI
                if (!this.game.gameOver && this.gameMode === 'ai-vs-ai') {
                    setTimeout(() => this.makeAiMove(), 500);
                }
            }
            
            this.isAiThinking = false;
            this.updateStatus();
        }, 100);
    }
    
    undoMove() {
        if (this.isAiThinking) return;
        
        if (this.gameMode === 'human-vs-ai') {
            // Undo both AI and human moves
            this.game.undoMove();
            this.game.undoMove();
        } else {
            // AI vs AI: just undo one move
            this.game.undoMove();
        }
        
        this.selectedSquare = null;
        this.validMoves = [];
        
        this.updateStatus();
        this.renderBoard();
        this.updateCapturedPieces();
        this.updateMoveHistory();
    }
    
    updateStatus() {
        let statusText = '';
        
        if (this.game.gameOver) {
            if (this.game.gameResult.type === 'checkmate') {
                const winner = this.game.gameResult.winner;
                statusText = `Checkmate! ${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`;
                this.statusElement.classList.add('game-over');
            } else if (this.game.gameResult.type === 'stalemate') {
                statusText = 'Stalemate! Draw.';
                this.statusElement.classList.add('game-over');
            } else {
                statusText = 'Draw by fifty-move rule.';
                this.statusElement.classList.add('game-over');
            }
        } else {
            const turn = this.game.currentTurn.charAt(0).toUpperCase() + 
                        this.game.currentTurn.slice(1);
            statusText = `${turn}'s turn`;
            
            if (this.game.isInCheck(this.game.currentTurn)) {
                statusText += ' - Check!';
            }
            
            if (this.isAiThinking) {
                statusText += ' (AI thinking...)';
            }
            
            this.statusElement.classList.remove('game-over');
        }
        
        this.statusElement.textContent = statusText;
    }
    
    updateCapturedPieces() {
        const whiteCaptured = this.game.capturedPieces.white;
        const blackCaptured = this.game.capturedPieces.black;
        
        this.capturedWhiteElement.innerHTML = whiteCaptured
            .map(p => `<span style="color: #000; text-shadow: 0 0 2px #fff;">${this.pieceSymbols[p]}</span>`)
            .join('');
        
        this.capturedBlackElement.innerHTML = blackCaptured
            .map(p => `<span style="color: #fff; text-shadow: 0 0 2px #000;">${this.pieceSymbols[p]}</span>`)
            .join('');
    }
    
    updateMoveHistory(newMove = null) {
        if (!newMove) {
            // Rebuild entire history
            const moves = this.game.moveHistory.map((entry, index) => {
                const moveNum = Math.floor(index / 2) + 1;
                const notation = entry.move.castling === 'kingSide' ? 'O-O' :
                                entry.move.castling === 'queenSide' ? 'O-O-O' :
                                this.game.getMoveNotation(entry.move);
                
                if (index % 2 === 0) {
                    return `${moveNum}. ${notation}`;
                } else {
                    return notation;
                }
            });
            this.moveHistoryElement.textContent = 'Moves: ' + moves.join(' ');
        } else {
            // Append new move
            const totalMoves = this.game.moveHistory.length;
            const moveNum = Math.floor((totalMoves - 1) / 2) + 1;
            
            if ((totalMoves - 1) % 2 === 0) {
                this.moveHistoryElement.textContent += ` ${moveNum}. ${newMove}`;
            } else {
                this.moveHistoryElement.textContent += ` ${newMove}`;
            }
        }
        
        // Auto-scroll to end
        this.moveHistoryElement.scrollTop = this.moveHistoryElement.scrollHeight;
    }
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.chessUI = new ChessUI();
});
