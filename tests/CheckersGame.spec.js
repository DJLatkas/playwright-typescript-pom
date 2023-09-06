
// @ts-check

import {test, expect} from "@playwright/test";
//todo: make it check for 
test('Checkers', async ({ page }) => {

  
  await page.goto('https://www.gamesforthebrain.com/game/checkers/');
  
  for (let moveNumber = 0; moveNumber < 10; moveNumber++) {
    //Import board cells src address into tableRows array
    const tableRows = await page.$$eval('div.line', rows => {
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll("img"));
        return cells.map(cell => cell.src);
      });
    });

    //trimming and parsing the cell src data. Then turning You's and Me's into W's and B's on the board 
    const board = tableRows.map(row => {
      return row.map(cellSrc => {
        if (cellSrc.includes('me1.gif')) {return 'B'} //Blue 
        else if (cellSrc.includes('you1.gif')) {return 'W'} //Orange?
        else {return null}; //blank cells
      });
    });
    let chosenMove = [];
    let sourceMove = [];
    let sourcePiece;
    let destPiece;
    //
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        sourceMove = [row, col];
        const legalMoves = getLegalMoves(row, col);
        if (legalMoves) {
          const capturingMoves = legalMoves.filter(move => {
            const destRow = move[0];
            const destCol = move[1];
            return isCaptureMove(col, row, destRow, destCol); // Check if move is a capture
          });
          //Select a random piece and move from the avaliable options. Prioritize capturingMoves over legalMoves
          if (capturingMoves.length > 0) {
            chosenMove = capturingMoves;
          } else {
            chosenMove = getRandomMove(legalMoves);
          } 
          console.log(chosenMove);       
          if (chosenMove) {
            sourcePiece = await page.locator(`div.line:nth-child(${sourceMove[0] + 1}) img:nth-child(${sourceMove[1] + 1})`);
            destPiece = await page.locator(`div.line:nth-child(${chosenMove[0] + 1}) img:nth-child(${chosenMove[1] + 1})`);
            break;
          }
        }
      }
      if (chosenMove.length > 0) {
        break;
      }
    };

    //All that for this?
    if (chosenMove.length > 0 && sourcePiece && destPiece) {
      await sourcePiece.click();
      await destPiece.click();
      console.log(`Selected piece at ${sourceMove[0]},${sourceMove[1]} to move to ${chosenMove[0]},${chosenMove[1]}`);
    };
    //this text routinely gets stuck on 'please wait' when it's expecting a move. Hard wait was VERY reluctantly implemented.
    let moveText = await page.locator('#message').innerText()
    console.log(moveText)
    if (moveText !== 'Make a move.' && moveText !== 'Select an orange piece to move.') {
      await page.waitForTimeout(1000)
    }

    

    //Picks and returns a random move from moves
    function getRandomMove(moves) {
      return moves[Math.floor(Math.random() * moves.length)];
    }
    function isCaptureMove(sourceCol, sourceRow, destCol, destRow) {
      const dx = Math.abs(destCol - sourceCol);
      const dy = destRow - sourceRow;
      const piece = board[sourceRow][sourceCol];
    
      if (piece === 'W') {
        if (dx === 2 && dy === -2 && board[sourceRow - 1][sourceCol - 1] === 'B' && board[destRow][destCol] === null) {
          return [destRow, destCol]; // Return the move if it's a capture
        }
        if (dx === 2 && dy === -2 && board[sourceRow - 1][sourceCol + 1] === 'B' && board[destRow][destCol] === null) {
          return [destRow, destCol]; // Return the move if it's a capture
        }
      }
      else return null; // Not a capture move
    }
    //If there is a white (orange) piece at (row, col) then return all valid moves for that piece
    function getLegalMoves(row, col) {
      const piece = board[row][col];
      const legalMoves = [];
    
      if (piece === null) {
        return null;
      } else if (piece === 'W') {
        // Check for capturing moves
        if (row > 1) {
          // Check diagonal left capture
          if (col > 1 && board[row - 1][col - 1] === 'B' && board[row - 2][col - 2] === null) {
            legalMoves.push([row - 2, col - 2]);
          }
          // Check diagonal right capture
          if (col < 6 && board[row - 1][col + 1] === 'B' && board[row - 2][col + 2] === null) {
            legalMoves.push([row - 2, col + 2]);
          }
        }
        // Check diagonal left move
        if (row > 0 && col > 0 && board[row - 1][col - 1] === null) {
          legalMoves.push([row - 1, col - 1]);
        }
        // Check diagonal right move
        if (row > 0 && col < 7 && board[row - 1][col + 1] === null) {
          legalMoves.push([row - 1, col + 1]);
        }
        // Additional logic for kings
        // Uhh... We'll see...
      }
      // Only return legalMoves array if there are legal moves
      if (legalMoves.length > 0) {
        return legalMoves;
      }
    
    }
  }
  await page.locator("a[href='./']").click
  
});

