//@ts-check
import { expect, test } from "@playwright/test";

//class to represent a sudoku board
class Cell {
    value: number;
    possibilities: Set<number>;
    rowIndex: number;
    colIndex: number;
    boxIndex: number;

    constructor(value: number, rowIndex: number, colIndex: number, boxIndex: number) {
        this.value = value;
        this.rowIndex = rowIndex;
        this.colIndex = colIndex;
        this.boxIndex = boxIndex;
        this.possibilities = new Set<number>();
        if(value === 0) {
            this.possibilities = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        }
    }

    removePossibility(val: number) {
        this.possibilities.delete(val);
    }
    
}

class Row {
    cells: Cell[] = [];

    addCell(cell: Cell) {
        this.cells.push(cell);
    }
}

class Column {
    cells: Cell[] = [];

    addCell(cell: Cell) {
        this.cells.push(cell);
    }
}

class Box {
    cells: Cell[] = [];

    addCell(cell: Cell) {
        this.cells.push(cell);
    }
}

class Fulldoku {
    testBoard: number[][];
    rows: Row[] = [];
    columns: Column[] = [];
    boxes: Box[] = [];

    constructor(initialBoard: number[][]) {
        this.testBoard = initialBoard;

        // Initialize rows, columns, and boxes with instances
        for (let i = 0; i < 9; i++) {
            this.rows.push(new Row());
            this.columns.push(new Column());
            this.boxes.push(new Box());
        }

        // Fill rows, columns, and boxes with Cell instances
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                let boxIndex = Math.floor(i / 3) * 3 + Math.floor(j / 3);
                let cell = new Cell(initialBoard[i][j], i, j, boxIndex);
                
                this.rows[i].addCell(cell);
                this.columns[j].addCell(cell);
                this.boxes[boxIndex].addCell(cell);
            }
        }
    }

    evaluateCell(rowIndex: number, colIndex: number): number[] {
        let cell = this.rows[rowIndex].cells[colIndex];
        cell.possibilities = new Set<number>([1, 2, 3, 4, 5, 6, 7, 8, 9]);

        // Check row and remove possibilities
        for(let i = 0; i < 9; i++) {
            cell.possibilities.delete(this.rows[rowIndex].cells[i].value);
        }

        // Check column and remove possibilities
        for(let i = 0; i < 9; i++) {
            cell.possibilities.delete(this.columns[colIndex].cells[i].value);
        }

        // Check box and remove possibilities
        let boxIndex = cell.boxIndex;
        for(let i = 0; i < 9; i++) {
            cell.possibilities.delete(this.boxes[boxIndex].cells[i].value);
        }
        
        console.log(`Possible candidates for cell [${rowIndex},${colIndex}] are: ${[...cell.possibilities].join(', ')}`);
        return [...cell.possibilities];
    }
}


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
const testBox3 = [1, 2, 4, 
                    7, 5, 9, 
                    0, 3, 6];
//single box unit test (2 possible solution)
const testBox2 = [1, 2, 4, 
                    7, 5, 0, 
                    0, 3, 6];
//single box unit test (3 possible solution)
const testBox1 = [1, 2, 4, 
                    7, 0, 0, 
                    0, 3, 6];
const solvedBox = [1, 2, 4, 
                    7, 5, 9, 
                    8, 3, 6];

test.describe('Suduku', async () => {

    
    test('Sudoku', async ({ }) => {

        const dokuBoard = new Fulldoku(testBoard);
        expect(dokuBoard.evaluateCell(0, 0)).toEqual([1, 2, 5]);
        expect(dokuBoard.evaluateCell(0, 1)).toEqual([1, 2, 4, 5, 7]);
        expect(dokuBoard.evaluateCell(0, 2)).toEqual([1, 2, 4, 5, 7]);
        expect(dokuBoard.evaluateCell(0, 3)).toEqual([1, 2, 4, 5, 7]);
        
    });
});

 