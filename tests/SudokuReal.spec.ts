//@ts-check
import { Page, expect, test } from "@playwright/test";



class SudokuSolver {
    private grid: number[][];
    private solutionGrid: number[][];

    constructor(grid: number[][]) {
        this.grid = grid;
        this.solutionGrid = Array.from({length: 9}, () => Array(9).fill(0));
    }

    public solve(): boolean {
        let emptyCell = this.findEmptyCell();
        if (!emptyCell) {
            return true; // Sudoku is solved when we have no empty cells
        }

        let [row, col] = emptyCell;

        for (let num = 1; num <= 9; num++) {
            if (this.isSafe(num, row, col)) {
                this.grid[row][col] = num;
                this.solutionGrid[row][col] = num;  // Store solution

                if (this.solve()) {
                    return true;
                }

                this.grid[row][col] = 0; // reset cell, backtrack
                this.solutionGrid[row][col] = 0; // Reset solution
            }
        }

        return false; // no solution
    }

    public getSolutionGrid(): number[][] {
        return this.solutionGrid;
    }

    private findEmptyCell(): [number, number] | null {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (this.grid[row][col] === 0) {
                    return [row, col];
                }
            }
        }
        return null; // no empty cells
    }

    // Check if 'num' is not in current row, column, or 3x3 box
    private isSafe(num: number, row: number, col: number): boolean {
        return !this.isInRow(row, num) && !this.isInCol(col, num) && !this.isInBox(row - (row % 3), col - (col % 3), num);
    }

    private isInRow(row: number, num: number): boolean {
        return this.grid[row].includes(num);
    }

    private isInCol(col: number, num: number): boolean {
        return this.grid.some(row => row[col] === num);
    }

    private isInBox(startRow: number, startCol: number, num: number): boolean {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                if (this.grid[row + startRow][col + startCol] === num) {
                    return true;
                }
            }
        }
        return false;
    }

    public getGrid(): number[][] {
        return this.grid;
    }
}




test.describe('Suduku', async () => {
    class SudokuPage {
        //pulls the board from the page
        public async getBoard(page: Page): Promise<number[][]> {
            const board: number[][] = await page.$$eval('tr', rows => {
                return rows.map(row => {
                    //pulls and maps the values from the pre-filled (hidden) input fields
                    const cells = Array.from(row.querySelectorAll('input[type="hidden"], input[type="text"]'));
                    return cells.map(cell => parseInt((cell as HTMLInputElement).value, 10) || 0);
                });
            });
    
            return board;
        }
        //fills the board with the solved board
        public async fillSolvedBoard(page: Page, solvedGrid: number[][]): Promise<void> {
            await page.$$eval('tr', (rows, solvedGrid) => {
                rows.forEach((row, rowIndex) => {
                    const cells = Array.from(row.querySelectorAll('input[type="hidden"], input[type="text"]'));
                    cells.forEach((cell, cellIndex) => {
                        if(solvedGrid[rowIndex][cellIndex] !== 0){
                        (cell as HTMLInputElement).value = solvedGrid[rowIndex][cellIndex].toString();
                        }
                    });
                });
            }, solvedGrid);
        }
    }

    test('Sudoku', async ({ page }) => {

        await page.goto('https://www.gamesforthebrain.com/game/sudoku/');
        const sudokuPage = new SudokuPage();
        const board = await sudokuPage.getBoard(page);
        // console.log(board);
        const solver = new SudokuSolver(board);
        solver.solve();
        // console.log(solver.getSolutionGrid());
        await sudokuPage.fillSolvedBoard(page, solver.getSolutionGrid());
        await page.waitForTimeout(1500)
        await page.locator('#continueButton').click();
        await page.waitForLoadState('domcontentloaded')
        await page.waitForTimeout(1500)

        //'Your solution is right, congratulations! (+100 points)'
        expect(await page.locator('.content>p').innerText()).toBe('Your solution is right, congratulations! (+100 points)');
    });
});

    //sample sudoku board
    const testBoard = [
        [0, 0, 0, 0, 0, 0, 6, 8, 0],
        [0, 0, 0, 0, 7, 3, 0, 0, 9],
        [3, 0, 9, 0, 0, 0, 0, 4, 5],
        [4, 9, 0, 0, 0, 0, 0, 0, 0],
        [8, 0, 3, 0, 5, 0, 9, 0, 2],
        [0, 0, 0, 0, 0, 0, 0, 3, 6],
        [9, 6, 0, 0, 0, 0, 3, 0, 8],
        [7, 0, 0, 6, 8, 0, 0, 0, 0],
        [0, 2, 8, 0, 0, 0, 0, 0, 0]
    ];
    //solved sample sudoku board
    const solvedBoard = [
        [1, 7, 2, 5, 4, 9, 6, 8, 3],
        [6, 4, 5, 8, 7, 3, 2, 1, 9],
        [3, 8, 9, 2, 6, 1, 7, 4, 5],
        [4, 9, 6, 3, 2, 7, 8, 5, 1],
        [8, 1, 3, 4, 5, 6, 9, 7, 2],
        [2, 5, 7, 1, 9, 8, 4, 3, 6],
        [9, 6, 4, 7, 1, 5, 3, 2, 8],
        [7, 3, 1, 6, 8, 2, 5, 9, 4],
        [5, 2, 8, 9, 3, 4, 1, 6, 7]
    ];

    //single cell unit test(1 possible solution)
    const testRow1 = [1, 3, 4, 7, 2, 5, 6, 8, 0];
    //single row unit test (2 possible solution)
    const testRow2 = [1, 3, 4, 7, 2, 0, 6, 8, 0];
    //single row unit test (3 possible solution)
    const testRow3 = [1, 3, 4, 7, 0, 0, 6, 8, 0];
    const solvedRow = [1, 3, 4, 7, 2, 5, 6, 8, 9];

    //single column unit test (1 possible solution)
    const testCol1 = [1, 3, 4, 7, 2, 5, 6, 8, 0];
    //single column unit test (2 possible solution)
    const testCol2 = [1, 3, 4, 7, 2, 0, 6, 8, 0];
    //single column unit test (3 possible solution)
    const testCol3 = [1, 3, 4, 7, 0, 0, 6, 8, 0];
    const solvedCol = [1, 3, 4, 7, 2, 5, 6, 8, 9];

    //single box unit test (1 possible solution)
    const testBox3 = 
        [1, 2, 4,
        7, 5, 9,
        0, 3, 6];
    //single box unit test (2 possible solution)
    const testBox2 = 
        [1, 2, 4,
        7, 5, 0,
        0, 3, 6];
    //single box unit test (3 possible solution)
    const testBox1 = 
        [1, 2, 4,
        7, 0, 0,
        0, 3, 6];
    const solvedBox = 
        [1, 2, 4,
        7, 5, 9,
        8, 3, 6];
