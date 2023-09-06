//@ts-check

import { test } from "@playwright/test";
test('Checkers', async ({ page }) => {
    const bot = new CheckersBot(page);
    await bot.play();
    await page.locator("a[href='./']").click();
  });
class CheckersBot {
  constructor(page) {
    this.page = page;
  }

  async play() {
    await this.page.goto('https://www.gamesforthebrain.com/game/checkers/');
    let moveNumber = 0;
    while (moveNumber < 10) {
      const board = await this.getBoard();
      const validMoves = await this.findValidMoves(board);
      const chosenMove = await this.selectMove(validMoves);

      if (chosenMove) {
        await this.makeMove(chosenMove);
        moveNumber++;
      }

      await this.waitForMove();
    }
  }

  async getBoard() {
    const tableRows = await this.page.$$eval('div.line', rows => {
      return rows.map(row => {
        const cells = Array.from(row.querySelectorAll("img"));
        return cells.map(cell => cell.src);
      });
    });
  
    const board = await tableRows.map(row => {
      return row.map(cellSrc => {
        if (cellSrc.includes('me1.gif')) return 'B';
        else if (cellSrc.includes('you1.gif')) return 'W';
        else return null; // blank cells
      });
    });
  
    return board;
  }
  

  async findValidMoves(board) {
    const validMoves = [];
  
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const legalMoves = await this.getLegalMoves(board, row, col);
        if (legalMoves) {
          validMoves.push({ row, col, legalMoves });
        }
      }
    }
  
    return validMoves;
  }
  
  async getLegalMoves(board, row, col) {
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

  async findCaptureMoves(board, row, col) {
    const piece = board[row][col];
    const captureMoves = [];

    if (piece === 'W') {
      // Check diagonal left capture
      if (row > 1 && col > 1 && board[row - 1][col - 1] === 'B' && board[row - 2][col - 2] === null) {
        captureMoves.push([row - 2, col - 2]);
      }
      // Check diagonal right capture
      if (row > 1 && col < 6 && board[row - 1][col + 1] === 'B' && board[row - 2][col + 2] === null) {
        captureMoves.push([row - 2, col + 2]);
      }
      // Additional logic for kings
      // Uhh... We'll see...
    }

    return captureMoves;
  }
  async   getRandomMove(moves) {
    return moves[Math.floor(Math.random() * moves.length)];
  }
  async selectMove(validMoves) {
    for (const { row, col, legalMoves } of validMoves) {
      const capturingMoves = await this.findCaptureMoves(row, col, legalMoves);
  
      if (capturingMoves.length > 0) {
        const chosenMove = this.getRandomMove(capturingMoves);
        return { source: { row, col }, destination: chosenMove };
      } else if (legalMoves.length > 0) {
        const chosenMove = this.getRandomMove(legalMoves);
        return { source: { row, col }, destination: chosenMove };
      }
    }
  
    return null; // No valid move found
  }
  

  async makeMove(sourceRow, sourceCol, destRow, destCol) {
    const sourcePiece = await this.page.locator(`div.line:nth-child(${sourceRow + 1}) img:nth-child(${sourceCol + 1})`);
    const destPiece = await this.page.locator(`div.line:nth-child(${destRow + 1}) img:nth-child(${destCol + 1})`);
  
    await sourcePiece.click();
    await destPiece.click();
  
    console.log(`Selected piece at ${sourceRow},${sourceCol} to move to ${destRow},${destCol}`);
  }
  

  async waitForMove() {
    //this text routinely gets stuck on 'please wait' when it's expecting a move. Hard wait was VERY reluctantly implemented.
    let moveText = await this.page.locator('#message').innerText()
    console.log(moveText)
    if (moveText !== 'Make a move.' && moveText !== 'Select an orange piece to move.') {
      await this.page.waitForTimeout(1000)
    }
  
  }

}
