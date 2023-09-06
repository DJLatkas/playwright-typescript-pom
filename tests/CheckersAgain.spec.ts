//@ts-check

import { test } from "@playwright/test";
   test('CheckersAgain', async ({ page }) => {
    class BoardImporter {
        async importTable() {
                //Import board cells src address into tableRows array
                const tableRows = await page.$$eval('div.line', rows => {
                  return rows.map(row => {
                    const cells = Array.from(row.querySelectorAll("img"));
                    return cells.map(cell => cell.src);
                  });
                });
                const board = tableRows.map(row => {
                    return row.map(cellSrc => {
                      if (cellSrc.includes('me1.gif')) {return 'B'} //Blue 
                      else if (cellSrc.includes('you1.gif')) {return 'W'} //Orange?
                      else {return 'E'}; //blank cells
                    });
                  });
            console.log(board);
            return board;
              
        }
    }
    class CheckersBoard {
        board: string[][];
        rows: number;
        columns: number;
        legalMoves: any;
        captureMoves: any;
        currentPlayer: string;
        constructor(initialBoard: string[][]) {
            this.board = initialBoard;
            this.rows = this.board.length;
            this.columns = this.board[0].length;
            this.legalMoves = [];
            this.captureMoves = [];

            //Bot only needs to handle white (orange) pieces, but co-pilot insists on making code that handles both
            //this is easier than fighting with it
            this.currentPlayer = 'W';


        }
        isMoveValid(sourceX: number, sourceY: number, targetX: number, targetY: number, currentPlayer: string) {
            if (!this.isPositionValid(targetX, targetY)) {
                return false;
            }
            
            const sourcePiece = this.board[sourceY][sourceX];
            const targetPiece = this.board[targetY][targetX];
    
            // Check if the target position is within the board bounds

            // check if vertical move direction is valid for player
            if (currentPlayer === 'W' && targetY > sourceY) {
                return false;
            } else if (currentPlayer === 'B' && targetY < sourceY) {
                return false;
            }
            // Check if the target position is empty and the move is diagonal
            const dx = Math.abs(targetX - sourceX);
            const dy = Math.abs(targetY - sourceY);
    
            if (targetPiece !== 'E' || dx !== dy) {
                return false;
            }
            
            // Check for capturing moves
            if (dx === 2) {
                const captureX = Math.floor((sourceX + targetX) / 2);
                const captureY = Math.floor((sourceY + targetY) / 2);
                const capturePiece = this.isPositionValid(captureX, captureY) ? this.board[captureY][captureX] : null;

                // Check if the capturePiece is an opponent's piece
                if (capturePiece === 'B') {
                    return true;
                }
            }
            // Check if the move is valid for the current player's piece
            if (currentPlayer === 'W' && sourcePiece !== 'W') {
                return false;
            } else if (currentPlayer === 'B' && sourcePiece !== 'B') {
                return false;
            }
    
            // Check if targetPiece is empty and 1 diagonal away (normal move)
            else if (targetPiece === 'E' && dx === dy && dx === 1) {
                return true;
            }
            return false;
        }

        isPositionValid(x: number, y: number): boolean {
            return x >= 0 && x < this.columns && y >= 0 && y < this.rows;
        }
        getPieceAtPosition(x:number, y:number): string {
            return this.board[y][x];
        }
        // a function to get all the legal moves for a piece
         getLegalMovesForPiece(x: number, y: number, currentPlayer: string) {
            
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) {
                        continue;
                    }
                    
                    const targetX = x + dx;
                    const targetY = y + dy;
                    
                    if (this.isMoveValid(x, y, targetX, targetY, currentPlayer)) {
                        this.legalMoves.push({ sourceX: x, sourceY: y, targetX, targetY });
                    }
                }
            }
            
            return this.legalMoves;
        }
        
        // a function to get all the legal CAPTURE moves for a piece
        getCaptureMovesForPiece(x: number, y: number, currentPlayer: string): { sourceX: number; sourceY: number; targetX: number; targetY: number; }[] {
            const captureMoves = [];
            
            for (let dx = -2; dx <= 2; dx++) {
                for (let dy = -2; dy <= 2; dy++) {
                    if (dx === 0 && dy === 0) {
                        continue;
                    }
                    
                    const targetX = x + dx;
                    const targetY = y + dy;
                    
                    if (this.isMoveValid(x, y, targetX, targetY, currentPlayer) && this.isCaptureMove(x, y, targetX, targetY)) {
                        captureMoves.push({ sourceX: x, sourceY: y, targetX, targetY });
                    }
                }
            }
            
            return captureMoves;
        }
        // a function to check if a move is a capture move for the current player
        isCaptureMove(x: number,y: number,targetX: number,targetY: number) {
            const captureX = Math.floor((x + targetX) / 2);
            const captureY = Math.floor((y + targetY) / 2);
            const capturePiece = this.isPositionValid(captureX, captureY) ? this.board[captureY][captureX] : null;
            
            return capturePiece === (this.currentPlayer === 'W' ? 'B' : 'W');

        }

        // Make a move and prioritize captures over normal moves
        chooseMove(board: CheckersBoard) {
            const legalMoves = this.getAllLegalMoves(board, this.currentPlayer);
            const captureMoves = this.getAllCaptureMoves(board, this.currentPlayer);;
            if (captureMoves.length > 0) {
                return this.randomMove(captureMoves);
            } else {
                return this.randomMove(legalMoves);
            }
        }
        
        //use RNG to pick a move from the moves provided
        randomMove(moves: any) {
            return moves[Math.floor(Math.random() * moves.length)];
        }
        getAllLegalMoves(board: CheckersBoard, currentPlayer: string) {
            const legalMoves = [];
            
            for (let y = 0; y < board.rows; y++) {
                for (let x = 0; x < board.columns; x++) {
                    const piece = board.getPieceAtPosition(x, y);
                    
                    if (piece !== 'E' && piece === currentPlayer) {
                        const moves = board.getLegalMovesForPiece(x, y, piece);
                        legalMoves.push(...moves);
                    }
                }
            }
            return legalMoves;
        }
        // Get all the capture moves for the current player
        getAllCaptureMoves(board: CheckersBoard, currentPlayer: string) {
            
            for (let y = 0; y < board.rows; y++) {
                for (let x = 0; x < board.columns; x++) {
                    const piece = board.getPieceAtPosition(x, y);
                    
                    if (piece !== 'E' && piece === currentPlayer) {
                        const moves = board.getCaptureMovesForPiece(x, y, piece);
                        this.captureMoves.push(...moves);
                    }
                }
            }
            
            return this.captureMoves;
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
    //loop for 10 turns
    for (let i = 0; i < 10; i++) {
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
    page.locator("a[href='./']").click
    
    await page.waitForTimeout(500)

});
