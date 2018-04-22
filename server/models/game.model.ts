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

    AIMove = function (level,turno) 
    {
        let result = this.minMax(this, level,turno)[0];
        if (result[1]==null)
            return [result,"t"];
        else
            return [this.getCellInGrid(result[1],turno),this.isNConnected(result[0],result[1],turno)];
    }
    minMax = function (tablero : gameModel, level, turno){
        let score = null;
        let bestMove = [null,null];
        if (level==0){
            for(let x=0;x<tablero.gridSize;x++){
                let moveSc = 0;
                let movidaAI = tablero.getCellInGrid(x,turno);if (movidaAI == null)
                    continue;
                let moveStAI = tablero.isNConnected(movidaAI[0],movidaAI[1],turno)
                
                if(movidaAI[0]==tablero.gridSize-1 && 
                    (movidaAI[1]-1==-1 || tablero.charGrid[movidaAI[0]][movidaAI[1]-1]==-1)&&
                    (movidaAI[1]+1==tablero.gridSize || tablero.charGrid[movidaAI[0]][movidaAI[1]+1]==-1)){
                        moveSc =0;
                    }
                else if (moveStAI=="w"){
                    moveSc = 1;
                }
                else if (moveStAI=="t"){
                    moveSc = 0;
                }
                else{
                    for (let y=0;y<tablero.gridSize;y++){
                        let movida = tablero.getCellInGrid(y,Math.abs(turno-1));
                        if (movida == null)
                            continue;
                        let moveSt = tablero.isNConnected(movida[0],movida[1],Math.abs(turno-1));
                        if(!(movida[0]==tablero.gridSize-1 && 
                            (movida[1]-1==-1 || tablero.charGrid[movida[0]][movida[1]-1]==-1)&&
                            (movida[1]+1==tablero.gridSize || tablero.charGrid[movida[0]][movida[1]+1]==-1)))
                            if (moveSt=="w"){
                                moveSc=-1;
                                tablero.charGrid[movida[0]][movida[1]] = -1;
                                break;
                            }
                            else{
                                moveSc = 0;
                            }
                        tablero.charGrid[movida[0]][movida[1]] = -1;
                    }
                }
                if (score == null || score < moveSc){
                    score = moveSc;
                    bestMove = movidaAI;
                }
                tablero.charGrid[movidaAI[0]][movidaAI[1]] = -1;
            }
            return [bestMove,score];
        }
        else{
            for (let x = 0;x<tablero.gridSize;x++){
                let moveSc = 0;
                let movidaAI = tablero.getCellInGrid(x,turno);if (movidaAI == null)
                    continue;
                let moveStAI = tablero.isNConnected(movidaAI[0],movidaAI[1],turno)
                
                if(movidaAI[0]==tablero.gridSize-1 && 
                    (movidaAI[1]-1==-1 || tablero.charGrid[movidaAI[0]][movidaAI[1]-1]==-1)&&
                    (movidaAI[1]+1==tablero.gridSize || tablero.charGrid[movidaAI[0]][movidaAI[1]+1]==-1)){
                    moveSc =0;
                }
                else if(moveStAI=="w"){
                    moveSc=1;
                }
                else if (moveStAI=="t" && moveSc ==null){
                    moveSc = 0;
                }
                else{
                    for (let y=0;y<tablero.gridSize;y++){
                        let movida = tablero.getCellInGrid(y,0);
                        if (movida == null)
                            continue;
                        let moveSt = tablero.isNConnected(movida[0],movida[1],Math.abs(turno-1));
                        if(!(movida[0]==tablero.gridSize-1 && 
                            (movida[1]-1==-1 || tablero.charGrid[movida[0]][movida[1]-1]==-1)&&
                            (movida[1]+1==tablero.gridSize || tablero.charGrid[movida[0]][movida[1]+1]==-1)))
                            if (moveSt=="w"){
                                moveSc=-1;
                                tablero.charGrid[movida[0]][movida[1]] = -1;
                                break;
                            }
                            else{
                                moveSc += (tablero.minMax(tablero, level-1, turno)[1]/tablero.gridSize)/tablero.gridSize;
                            }
                        tablero.charGrid[movida[0]][movida[1]] = -1;
                    }
                }
                tablero.charGrid[movidaAI[0]][movidaAI[1]] = -1;
                if (score == null || score < moveSc){
                    if (!(Math.random()*10<2-level && score!=null)){
                        score = moveSc;
                        bestMove = movidaAI;
                    }
                }
                else if(Math.random()*10<2-level){
                    score = moveSc;
                    bestMove = movidaAI;
                }
            }
            return [bestMove,score];
        }
    }
}
