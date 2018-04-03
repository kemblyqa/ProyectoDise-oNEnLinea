export default class gameModel{
    charGrid:Array<any>;
    gridSize:number;
    nSize:number;
    constructor(tablero, sizeN) {
        this.charGrid = tablero;
        this.gridSize = tablero.length;
        this.nSize = sizeN;
    }
    getCellInGrid(colParam, playerTurn) {
        if (this.charGrid[0][colParam] != -1) {
            return null;
        }
        for (var rowItem = 0; rowItem < this.gridSize; rowItem++) {
            if (this.charGrid[rowItem][colParam] != -1) {
                //find where the button need to be set and update the grid
                this.charGrid[rowItem - 1][colParam] = playerTurn;
                //return button id to set color
                return [rowItem - 1, colParam];
            }
        }
        //when it is the fisrt piece to be droped
        this.charGrid[this.gridSize - 1][colParam] = playerTurn;
        return [this.gridSize - 1, colParam];
    };
    isNConnected = function (row, col, playerTurn) {
        //verify if is N connected
        if (this.verticalWin(row, col, playerTurn) ||
            this.horizontalWin(row, col, playerTurn) ||
            this.diagonalRightWin(row, col, playerTurn) ||
            this.diagonalLeftWin(row, col, playerTurn)) {
            return "w";
        }
        if (!this.isTie())
            return "p";
        else
            return "t";
    };
    isTie = function () {
        for (var i = 0; i < this.gridSize; i++) {
            for (var j = 0; j < this.gridSize; j++) {
                if (this.charGrid[i][j] == -1) {
                    return false;
                }
            }
        }
        return true;
    };
    horizontalWin = function (row, col, playerTurn) {
        var count = 0;
        //to right
        for (var i = col; i < this.gridSize; i++) {
            if (this.charGrid[row][i] == playerTurn) {
                count++;
            }
            else {
                break;
            }
        }
        //to left
        for (var j = col - 1; j >= 0; j--) {
            if (this.charGrid[row][j] == playerTurn) {
                count++;
            }
            else {
                break;
            }
        }
        return count >= this.nSize ? true : false;
    };
    verticalWin = function (row, col, playerTurn) {
        var count = 0;
        //to down
        for (var i = row; i < this.gridSize; i++) {
            if (this.charGrid[i][col] == playerTurn) {
                count++;
            }
            else {
                break;
            }
        }
        //to up
        for (var j = row - 1; j >= 0; j--) {
            if (this.charGrid[j][col] == playerTurn) {
                count++;
            }
            else {
                break;
            }
        }
        return count >= this.nSize ? true : false;
    };
    diagonalRightWin = function (row, col, playerTurn) {
        return this.verDiagRightDown(row, col, playerTurn) + this.verDiagRightUp(row - 1, col - 1, playerTurn) >= this.nSize ? true : false;
    };
    diagonalLeftWin = function (row, col, playerTurn) {
        return this.verDiagLeftUp(row, col, playerTurn) + this.verDiagLeftDown(row + 1, col - 1, playerTurn) >= this.nSize ? true : false;
    };
    verDiagRightDown = function (row, col, playerTurn) {
        var count = 0;
        for (var i = row; i < this.gridSize; i++) {
            if (this.charGrid[i][col] == playerTurn) {
                col++;
                count++;
            }
            else {
                break;
            }
        }
        return count;
    };
    verDiagRightUp = function (row, col, playerTurn) {
        var count = 0;
        for (var j = row; j >= 0; j--) {
            if (this.charGrid[j][col] == playerTurn) {
                col--;
                count++;
            }
            else {
                break;
            }
        }
        return count;
    };
    verDiagLeftUp = function (row, col, playerTurn) {
        var count = 0;
        for (var i = row; i >= 0; i--) {
            if (this.charGrid[i][col] == playerTurn) {
                col++;
                count++;
            }
            else {
                break;
            }
        }
        return count;
    };
    verDiagLeftDown = function (row, col, playerTurn) {
        var count = 0;
        for (var j = row; j < this.gridSize; j++) {
            if (this.charGrid[j][col] == playerTurn) {
                col--;
                count++;
            }
            else {
                break;
            }
        }
        return count;
    }
}
