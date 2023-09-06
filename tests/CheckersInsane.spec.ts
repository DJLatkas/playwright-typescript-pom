//@ts-check

import { test } from "@playwright/test";
   test('CheckersAgain', async ({ page }) => {
    class BoardImporter {
        async importTable() {
            const tableRows = await page.$$eval('div.line', rows => {
              return rows.map(row => {
                const cells = Array.from(row.querySelectorAll("img"));
                return cells.map(cell => cell.src);
              });
            });
    
            const board = tableRows.map(row => row.map(cellSrc => {
              if (cellSrc.includes('me1.gif')) return 'B';
              else if (cellSrc.includes('you1.gif')) return 'W';
              else return 'E';
            }));
    
            console.log(board);
            return board;
        }
    }
    
    class CheckersBoard {
        board: string[][];
        rows: number;
        columns: number;
        legalMoves: any[];
        captureMoves: any[];
        currentPlayer: string;
    
        constructor(initialBoard: string[][]) {
            this.board = initialBoard;
            this.rows = this.board.length;
            this.columns = this.board[0].length;
            this.legalMoves = [];
            this.captureMoves = [];
            this.currentPlayer = 'W';
        }
    
        isMoveValid(sourceX: number, sourceY: number, targetX: number, targetY: number, currentPlayer: string) {
            if (!this.isPositionValid(targetX, targetY)) return false;
    
            const sourcePiece = this.getPieceAtPosition(sourceX, sourceY);
            const targetPiece = this.getPieceAtPosition(targetX, targetY);
    
            if (sourcePiece !== currentPlayer || targetPiece !== 'E') return false;
    
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
    
            if (currentPlayer === 'W' && dy > 0) return false;
            if (currentPlayer === 'B' && dy < 0) return false;
    
            const distance = Math.abs(dx);
            if (distance === 1 && Math.abs(dy) === 1) return true;
    
            if (distance === 2 && Math.abs(dy) === 2) {
                const midPiece = this.getPieceAtPosition(sourceX + dx / 2, sourceY + dy / 2);
                return midPiece && midPiece !== 'E' && midPiece !== currentPlayer;
            }
    
            return false;
        }
    
        isPositionValid(x: number, y: number): boolean {
            return x >= 0 && x < this.columns && y >= 0 && y < this.rows;
        }
    
        getPieceAtPosition(x: number, y: number): string {
            return this.board[y][x];
        }
    
        getLegalMovesForPiece(x: number, y: number, currentPlayer: string) {
            this.legalMoves = [];
    
            if ((x + y) % 2 === 0) return this.legalMoves; // Skip irrelevant squares
    
            for (let dx = -2; dx <= 2; dx += 2) {
                for (let dy = -2; dy <= 2; dy += 2) {
                    const targetX = x + dx;
                    const targetY = y + dy;
                    
                    if (this.isMoveValid(x, y, targetX, targetY, currentPlayer)) {
                        this.legalMoves.push({ sourceX: x, sourceY: y, targetX, targetY });
                    }
                }
            }
    
            return this.legalMoves;
        }

        getAllLegalMoves(board: CheckersBoard, currentPlayer: string): { sourceX: number; sourceY: number; targetX: number; targetY: number; }[] {
            const legalMoves = [];
            
            for (let y = 0; y < board.rows; y++) {
                for (let x = 0; x < board.columns; x++) {
                    const piece = board.getPieceAtPosition(x, y);
                    
                    if (piece !== 'E' && piece === currentPlayer) {
                        const moves = board.getLegalMovesForPiece(x, y, currentPlayer);
                        legalMoves.push(...moves);
                    }
                }
            }
            return legalMoves;
        }
    
            // a function to get all the legal CAPTURE moves for a piece
        getCaptureMovesForPiece(x: number, y: number, currentPlayer: string): { sourceX: number; sourceY: number; targetX: number; targetY: number; }[] {
                const captureMoves = [];
                const directions = [
                    {dx: -2, dy: -2},
                    {dx: 2, dy: -2},
                    {dx: -2, dy: 2},
                    {dx: 2, dy: 2},
                ];

                for (const {dx, dy} of directions) {
                    const targetX = x + dx;
                    const targetY = y + dy;

                    if (this.isMoveValid(x, y, targetX, targetY, currentPlayer) && this.isCaptureMove(x, y, targetX, targetY)) {
                        captureMoves.push({ sourceX: x, sourceY: y, targetX, targetY });
                    }
                }
            
            return captureMoves;
        }

        isCaptureMove(x: number, y: number, targetX: number, targetY: number): boolean {
            if (Math.abs(targetX - x) !== 2 || Math.abs(targetY - y) !== 2) {
                return false; // The move is not a capture move if it's not moving 2 steps diagonally
            }
            
            const captureX = (x + targetX) / 2;
            const captureY = (y + targetY) / 2;
            const capturePiece = this.isPositionValid(captureX, captureY) ? this.board[captureY][captureX] : null;
    
            return capturePiece === (this.currentPlayer === 'W' ? 'B' : 'W');
        }
    
        // Get all the capture moves for the current player
        getAllCaptureMoves(board: CheckersBoard, currentPlayer: string) {
            const captureMoves = [];

            for (let y = 0; y < board.rows; y++) {
                for (let x = (y % 2 === 0) ? 0 : 1; x < board.columns; x += 2) {
                    const piece = board.getPieceAtPosition(x, y);

                    if (piece !== 'E' && piece === currentPlayer) {
                        const moves = board.getCaptureMovesForPiece(x, y, piece);
                        captureMoves.push(...moves);
                    }
                }
            }
            
            return captureMoves;
        }

        // Make a move and prioritize captures over normal moves
        chooseMove(board: CheckersBoard): { sourceX: number; sourceY: number; targetX: number; targetY: number; } {
            const captureMoves = this.getAllCaptureMoves(board, this.currentPlayer);
            if (captureMoves.length > 0) {
                return this.randomMove(captureMoves);
            } else {
                const legalMoves = this.getAllLegalMoves(board, this.currentPlayer);
                if (legalMoves.length > 0) {
                    return this.randomMove(legalMoves);
                } else {
                    return { sourceX: 0, sourceY: 0, targetX: 0, targetY: 0 };
                }
            }
        }
        
        
        // use RNG to pick a move from the moves provided
        randomMove(moves: { sourceX: number; sourceY: number; targetX: number; targetY: number; }[]): { sourceX: number; sourceY: number; targetX: number; targetY: number; } {
            return moves[Math.floor(Math.random() * moves.length)];
        }    
        
            // Other board management methods
            // ...
    }
    

    
    // Board used for testing, never know when you'll need it again
    // const initialBoard = [
    //       //  0    1    2    3    4    5    6    7    <- x (column)
    //         ['E', 'B', 'E', 'B', 'E', 'B', 'E', 'B'], // 0 (row)
    //         ['B', 'E', 'B', 'E', 'B', 'E', 'B', 'E'], // 1
    //         ['E', 'B', 'E', 'B', 'E', 'B', 'E', 'B'], // 2
    //         ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'], // 3
    //         ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'], // 4
    //         ['W', 'E', 'W', 'E', 'W', 'E', 'W', 'E'], // 5
    //         ['E', 'W', 'E', 'W', 'E', 'W', 'E', 'W'], // 6
    //         ['W', 'E', 'W', 'E', 'W', 'E', 'W', 'E']  // 7
    //     ];  
        
        


    await page.goto('https://www.gamesforthebrain.com/game/checkers/');
    const importer = new BoardImporter();
    //loop for 20 turns
    for (let i = 0; i < 20; i++) {
        const initialBoard = await importer.importTable();
        const board =  new CheckersBoard(initialBoard);
        const legalMove = board.chooseMove(board);
        //All that for this... When did I flip X's and Y's?
        const sourcePiece = page.locator(`div.line:nth-child(${legalMove.sourceY+1})>img:nth-child(${legalMove.sourceX+1})`);
        const destPiece = page.locator(`div.line:nth-child(${legalMove.targetY+1})>img:nth-child(${legalMove.targetX+1})`);
        await sourcePiece.click();
        await destPiece.click();

        //At this point I'd have submitted a bug report for this element since it keeps getting stuck on 'Please Wait...'
        const moveText = await page.locator('#message').innerText()
        if (moveText !== 'Make a move.' && moveText !== 'Select an orange piece to move.') {
        await page.waitForTimeout(500)
        }
    }
    page.locator("a[href='./']").click();
    
    await page.waitForTimeout(500)

});
