import { randomBytes } from "crypto";

export class BuildTablero{
    //in the board are col-row filled
    //this is row-col
    buttonIDs:Array<any>

    //this need to set col-row filled
    charGrid:Array<any>
    tam:number = 9
    nSize:number = 4

    //inicial values current first player
    playerTurn:boolean = true

    constructor(){
        this.buttonIDs = []
        this.charGrid = []
    }

    fill() {
        let c = 1
        for (let i = 0; i < this.tam; i++) {
            this.buttonIDs.push([])
            this.charGrid.push([])

            for (let j = 0; j < this.tam; j++) {
                this.buttonIDs[i][j] = c
                this.charGrid[i][j] = "n"
                c++
            }
        }
    }

    getIdButtonCells(){
        return this.buttonIDs
    }

    getGridCharCells(){
        return this.charGrid
    }

    getUpdateGridLayout(id){
        // console.log(this.buttonIDs)
        // console.log(this.charGrid)
        for (let i = 0; i < this.tam; i++) {
            for (let j = 0; j < this.tam; j++) {
                //if id is found, then we need the column
                if(this.buttonIDs[i][j] == id){
                    // console.log("columna... "+i)
                    // console.log("id but... "+this.buttonIDs[i][j])
                    return this.setCellInGrid(i)
                }
            }
        }
    }

    switchPlayer(){
        this.playerTurn = !this.playerTurn
    }

    getPlayerTurn(){
        return this.playerTurn ? "1" : "2"
    }

    getColorTurn(){
        let color1 = "#fff125"
        let color2 = "#f177ff"
        return this.playerTurn ? color1 : color2
    }

    setCellInGrid(col:number){
        for (let i = 0; i < this.tam; i++) {
            if(this.charGrid[col][i] != "n"){
                //find where the button need to be set and update the grid
                this.charGrid[col][i-1] = this.getPlayerTurn()
                //return button id to set color
                return this.buttonIDs[col][i-1]
            }
        }
        //when it is the fisrt piece to be droped
        this.charGrid[col][this.tam-1] = this.getPlayerTurn()  
        return this.buttonIDs[col][this.tam-1]
    }

    /**is called in the tablero.component.ts**/
    isNConnected(){
        //verify if is N connected
        

        for (let i = this.tam-1; i >= 0; i--) {
            for (let j = this.tam-1; j >= 0; j--) {
                //function verify if it has a line
                //console.log("fila: "+i, "col: "+j)
                if(this.charGrid[j][i] == this.getPlayerTurn()){
                    console.log("fila: "+i, "col: "+j+" ----> "+this.charGrid[j][i])
                }
                this.verifyNLine(i,j)
            }
        }
    }

    verifyNLine(col:number,row:number){
        //H
        /* if(this.horizontalWin(row,col)){
            console.log("winner: "+this.getPlayerTurn())
            return
        } 
        else */ 
        if(this.verticalWin(row,col)){
            console.log("winner: "+this.getPlayerTurn())
            return
        } 
        /*else if(this.horizontalWin(row,col)){
            console.log("winner: "+this.getPlayerTurn())
            return
        } else if(this.horizontalWin(row,col)){
            console.log("winner: "+this.getPlayerTurn())
            return
        }  */
            
        //V
        //DL
        //DR
    }

    verticalWin(row:number,col:number){
        for (let i = this.tam - 1; ; i--) {
            if(this.charGrid[col][i] != this.getPlayerTurn()){
                return false;
            }
        }
        return true;
    }

    diagonalLeft(){

    }

    diagonalRight(){

    }

    horizontalWin(row:number,col:number){
        for (let i = col; i < this.nSize; i++) {
            if(this.getGridCharCells[i][row] != this.getPlayerTurn()){
                return false;
            }
        }
        return true;
    }
}