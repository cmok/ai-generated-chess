/**
 * Chess AI
 * Implements minimax algorithm with alpha-beta pruning
 */

class ChessAI {
    constructor(game, difficulty = 2) {
        this.game = game;
        this.difficulty = difficulty;
        
        // Piece values for evaluation
        this.pieceValues = {
            'P': 100,
            'N': 320,
            'B': 330,
            'R': 500,
            'Q': 900,
            'K': 20000
        };
        
        // Piece-square tables for positional evaluation
        this.pawnTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [50, 50, 50, 50, 50, 50, 50, 50],
            [10, 10, 20, 30, 30, 20, 10, 10],
            [5,  5, 10, 25, 25, 10,  5,  5],
            [0,  0,  0, 20, 20,  0,  0,  0],
            [5, -5,-10,  0,  0,-10, -5,  5],
            [5, 10, 10,-20,-20, 10, 10,  5],
            [0,  0,  0,  0,  0,  0,  0,  0]
        ];
        
        this.knightTable = [
            [-50,-40,-30,-30,-30,-30,-40,-50],
            [-40,-20,  0,  0,  0,  0,-20,-40],
            [-30,  0, 10, 15, 15, 10,  0,-30],
            [-30,  5, 15, 20, 20, 15,  5,-30],
            [-30,  0, 15, 20, 20, 15,  0,-30],
            [-30,  5, 10, 15, 15, 10,  5,-30],
            [-40,-20,  0,  5,  5,  0,-20,-40],
            [-50,-40,-30,-30,-30,-30,-40,-50]
        ];
        
        this.bishopTable = [
            [-20,-10,-10,-10,-10,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5, 10, 10,  5,  0,-10],
            [-10,  5,  5, 10, 10,  5,  5,-10],
            [-10,  0, 10, 10, 10, 10,  0,-10],
            [-10, 10, 10, 10, 10, 10, 10,-10],
            [-10,  5,  0,  0,  0,  0,  5,-10],
            [-20,-10,-10,-10,-10,-10,-10,-20]
        ];
        
        this.rookTable = [
            [0,  0,  0,  0,  0,  0,  0,  0],
            [5, 10, 10, 10, 10, 10, 10,  5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [-5,  0,  0,  0,  0,  0,  0, -5],
            [0,  0,  0,  5,  5,  0,  0,  0]
        ];
        
        this.queenTable = [
            [-20,-10,-10, -5, -5,-10,-10,-20],
            [-10,  0,  0,  0,  0,  0,  0,-10],
            [-10,  0,  5,  5,  5,  5,  0,-10],
            [-5,  0,  5,  5,  5,  5,  0, -5],
            [0,  0,  5,  5,  5,  5,  0, -5],
            [-10,  5,  5,  5,  5,  5,  0,-10],
            [-10,  0,  5,  0,  0,  0,  0,-10],
            [-20,-10,-10, -5, -5,-10,-10,-20]
        ];
        
        this.kingMiddleGameTable = [
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-30,-40,-40,-50,-50,-40,-40,-30],
            [-20,-30,-30,-40,-40,-30,-30,-20],
            [-10,-20,-20,-20,-20,-20,-20,-10],
            [20, 20,  0,  0,  0,  0, 20, 20],
            [20, 30, 10,  0,  0, 10, 30, 20]
        ];
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    // Get the best move for the current position
    getBestMove(color) {
        const depth = this.difficulty;
        const isMaximizing = color === 'white';
        
        const moves = this.game.getAllLegalMoves(color);
        
        if (moves.length === 0) return null;
        if (moves.length === 1) return moves[0];
        
        // Sort moves for better alpha-beta pruning
        this.sortMoves(moves);
        
        let bestMove = null;
        let bestValue = isMaximizing ? -Infinity : Infinity;
        let alpha = -Infinity;
        let beta = Infinity;
        
        for (const move of moves) {
            const savedState = this.game.saveState();
            this.game.makeMoveInternal(move);
            
            const value = this.minimax(depth - 1, alpha, beta, !isMaximizing);
            
            this.game.restoreState(savedState);
            
            if (isMaximizing) {
                if (value > bestValue) {
                    bestValue = value;
                    bestMove = move;
                }
                alpha = Math.max(alpha, bestValue);
            } else {
                if (value < bestValue) {
                    bestValue = value;
                    bestMove = move;
                }
                beta = Math.min(beta, bestValue);
            }
            
            if (beta <= alpha) break;
        }
        
        return bestMove || moves[0];
    }

    minimax(depth, alpha, beta, isMaximizing) {
        if (depth === 0) {
            return this.evaluateBoard();
        }
        
        const color = isMaximizing ? 'white' : 'black';
        const moves = this.game.getAllLegalMoves(color);
        
        if (moves.length === 0) {
            if (this.game.isInCheck(color)) {
                return isMaximizing ? -100000 : 100000; // Checkmate
            }
            return 0; // Stalemate
        }
        
        this.sortMoves(moves);
        
        if (isMaximizing) {
            let maxValue = -Infinity;
            for (const move of moves) {
                const savedState = this.game.saveState();
                this.game.makeMoveInternal(move);
                
                const value = this.minimax(depth - 1, alpha, beta, false);
                
                this.game.restoreState(savedState);
                
                maxValue = Math.max(maxValue, value);
                alpha = Math.max(alpha, value);
                
                if (beta <= alpha) break;
            }
            return maxValue;
        } else {
            let minValue = Infinity;
            for (const move of moves) {
                const savedState = this.game.saveState();
                this.game.makeMoveInternal(move);
                
                const value = this.minimax(depth - 1, alpha, beta, true);
                
                this.game.restoreState(savedState);
                
                minValue = Math.min(minValue, value);
                beta = Math.min(beta, value);
                
                if (beta <= alpha) break;
            }
            return minValue;
        }
    }

    sortMoves(moves) {
        // Simple move ordering: captures first, then others
        moves.sort((a, b) => {
            const aCapture = this.game.getPiece(a.to.row, a.to.col) ? 1 : 0;
            const bCapture = this.game.getPiece(b.to.row, b.to.col) ? 1 : 0;
            return bCapture - aCapture;
        });
    }

    evaluateBoard() {
        let score = 0;
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = this.game.getPiece(row, col);
                if (!piece) continue;
                
                const pieceType = this.game.getPieceType(piece);
                const isWhite = this.game.isWhite(piece);
                const value = this.pieceValues[pieceType];
                
                // Add material value
                score += isWhite ? value : -value;
                
                // Add positional value
                const tableValue = this.getPositionalValue(pieceType, row, col, isWhite);
                score += isWhite ? tableValue : -tableValue;
            }
        }
        
        return score;
    }

    getPositionalValue(pieceType, row, col, isWhite) {
        let table;
        
        switch (pieceType) {
            case 'P':
                table = this.pawnTable;
                break;
            case 'N':
                table = this.knightTable;
                break;
            case 'B':
                table = this.bishopTable;
                break;
            case 'R':
                table = this.rookTable;
                break;
            case 'Q':
                table = this.queenTable;
                break;
            case 'K':
                table = this.kingMiddleGameTable;
                break;
            default:
                return 0;
        }
        
        // Flip table for black pieces
        if (isWhite) {
            return table[row][col];
        } else {
            return table[7 - row][col];
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChessAI;
}
