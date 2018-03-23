export class BuildTablero{
    //in the board are col-row filled
    //this is row-col
    buttonIDs:Array<any>
    private sideBarItems: Array<any>

    //this need to set col-row filled
    charGrid:Array<any>
    gridSize:number
    nSize:number
    status:string

    //inicial values current first player
    playerTurn:boolean = true

    constructor(gridSize:number, nSize:number){
        this.buttonIDs = []
        this.charGrid = []
        this.gridSize = gridSize
        this.nSize = nSize
        this.status = "p"
        this.sideBarItems = [{
            id:1,
            text:"Nueva partida",
            href:"/menu"
        },{
            id:2,
            text:"En curso",
            href:"/menu"
        },{
            id:3,
            text:"Buscar partida",
            href:"/menu"
        },{
            id:4,
            text:"Jugadores",
            href:"/menu"
        },{
            id:5,
            text:"Amigos",
            href:"/menu"
        },{
            id:6,
            text:"Perfil",
            href:"/menu"
        },{
            id:7,
            text:"Cerrar",
            href:"/menu"
        }]
    }

    getSideBarItems(){
        return this.sideBarItems
    }

    fill() {
        let c = 1
        for (let i = 0; i < this.gridSize; i++) {
            this.buttonIDs.push([])
            this.charGrid.push([])

            for (let j = 0; j < this.gridSize; j++) {
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

    getGameStatus(){
        return this.status;
    }

    getUpdateGridLayout(id){
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                //if id is found, then we need the column
                if(this.buttonIDs[i][j] == id){
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
        for (let i = 0; i < this.gridSize; i++) {
            if(this.charGrid[col][i] != "n"){
                //find where the button need to be set and update the grid
                this.charGrid[col][i-1] = this.getPlayerTurn()
                //verify if is connected
                this.isNConnected(col,i-1)
                //return button id to set color
                return this.buttonIDs[col][i-1]
            }
        }
        //when it is the fisrt piece to be droped
        this.charGrid[col][this.gridSize-1] = this.getPlayerTurn()  
        this.isNConnected(col,this.gridSize-1)
        return this.buttonIDs[col][this.gridSize-1]
    }

    /**is called in the tablero.component.ts**/
    isNConnected(col:number, row:number){
        //verify if is N connected
        if(this.verticalWin(row,col)  || 
        this.horizontalWin(row,col)   ||
        this.diagonalRightWin(row,col)  ||
        this.diagonalLeftWin(row,col))
        {
            this.status = "w"
            return
        } 
        
        if (!this.isTie())
            this.status = "p"
        else 
            this.status = "t"
    }
    
    isTie(){
        for (let i = 0; i < this.gridSize; i++) {
            for (let j = 0; j < this.gridSize; j++) {
                if(this.charGrid[i][j] == "n"){
                    return false;
                }
            }
        }
        return true;
    }

    horizontalWin(row:number,col:number){
        var count = 0
        //to right
        for (let i = col; i < this.gridSize; i++) {
            if(this.charGrid[i][row] == this.getPlayerTurn()){
                //console.log("right.. "+this.charGrid[i][row])
                count++
            } else {
                break
            }
        }
        //to left
        for (let j = col - 1; j >= 0; j--) {
            if(this.charGrid[j][row] == this.getPlayerTurn()){
                //console.log("left.. "+this.buttonIDs[j][row])
                count++
            } else {
                break
            }
        }
        return count >= this.nSize ? true : false
    }

    verticalWin(row:number,col:number){
        var count = 0
        //to down
        for (let i = row; i < this.gridSize; i++) {
            if(this.charGrid[col][i] == this.getPlayerTurn()){
                //console.log("down.. "+this.buttonIDs[col][i])
                count++
            } else {
                break
            }
        }
        //to up
        for (let j = row - 1; j >= 0; j--) {
            if(this.charGrid[col][j] == this.getPlayerTurn()){
                //console.log("up.. "+this.buttonIDs[col][j])
                count++
            } else {
                break
            }
        }
        return count >= this.nSize ? true : false
    }

    diagonalRightWin(row:number, col:number){
        return this.verDiagRightDown(row,col)+this.verDiagRightUp(row-1,col-1) >= this.nSize ? true : false
    }

    diagonalLeftWin(row:number, col:number){
        return this.verDiagLeftUp(row,col)+this.verDiagLeftDown(row+1,col-1) >= this.nSize ? true : false
    }

    verDiagRightDown(row:number, col:number){
        var count = 0;
        for (let i = col; i < this.gridSize; i++) {
            if(this.charGrid[i][row] == this.getPlayerTurn()){
                row++;count++
            } else {
                break
            }
        }
        return count;
    }

    verDiagRightUp(row:number,col:number){
        var count = 0;
        for (let j = col; j >= 0; j--) {
            if(this.charGrid[j][row] == this.getPlayerTurn()){
                row--;count++
            } else {
                break
            }
        }
        return count;
    }

    verDiagLeftUp(row:number,col:number){
        var count = 0;
        for (let i = col; i < this.gridSize; i++) {
            if(this.charGrid[i][row] == this.getPlayerTurn()){
                console.log("col++..."+i+" row--..."+row)
                row--;count++
            } else {
                break
            }
        }
        return count
    }

    verDiagLeftDown(row:number,col:number){
        var count=0;
        for (let j = col; j >= 0; j--) {
            if(this.charGrid[j][row] == this.getPlayerTurn()){
                console.log("col--..."+j+" row++..."+row)
                row++;count++
            } else {
                break
            }
        }
        return count;
    }
}