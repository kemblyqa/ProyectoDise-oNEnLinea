export class BuildBoard{
    //in the board are filled
    buttonIDs:Array<any>

    //sidebar
    private sideBarItems: Array<any>

    //this need to set col-row filled
    activeStatus:boolean
    nSize:number
    gridSize:number
    nRounds:number
    lastRound:any
    gridBoard:Array<any>
    users:Array<any>    
    gameStatus:string
    turn:any

    //inicial values current first player [0]
    playerTurn:boolean = true

    constructor(
        gridSize:number, 
        nSize:number,
        activeStatus:boolean,
        roundSize:number,
        usersIDsColors:Array<any>
    ){        
        //init arrays
        this.buttonIDs = []
        this.gridBoard = []
        this.users = []

        //params
        this.activeStatus = activeStatus
        this.gridSize = gridSize
        this.nSize = nSize
        this.nRounds = roundSize
        this.users[0] = [usersIDsColors[0][0], usersIDsColors[0][1]]
        this.users[1] = [usersIDsColors[1][0], usersIDsColors[1][1]]
        
        //sidebar elems
        this.sideBarItems = [{
            id:1,
            text:"Abandonar partida",
            href:"/menu"
        },{
            id:2,
            text:"Volver al menú",
            href:"/menu"
        }]
        this.fill()
    }

    fill() {
        let c = 1
        for (let i = 0; i < this.gridSize; i++) {
            this.buttonIDs.push([])
            for (let j = 0; j < this.gridSize; j++) {
                this.buttonIDs[i][j] = c
                c++
            }
        }
    }

    setTurn(turn:any){
        this.turn = turn
    }

    getTurn(){
        return this.turn
    }

    setActiveRound(lastR:any){
        this.lastRound = lastR
    }

    getActiveRound(){
        return this.lastRound
    }

    getSideBarItems(){
        return this.sideBarItems
    }

    setGrid(grid: any){
        this.gridBoard = grid
        this.updateBoardGrid()
    }

    getIdButtonCells(){
        return this.buttonIDs
    }

    getGridCharCells(){
        return this.gridBoard
    }

    setGameStatus(status: any){
        this.gameStatus = status
    }

    getGameStatus(){
        return this.gameStatus;
    }

    getRowColButtonID(id){
        for (let rowI = 0; rowI < this.gridSize; rowI++) {
            for (let colI = 0; colI < this.gridSize; colI++) {
                if(this.buttonIDs[rowI][colI] == id){
                    return [rowI, colI]
                }
            }
        }
    }

    updateBoardGrid(){
        //fill the buttons with players
        for (let rowI = 0; rowI < this.gridSize; rowI++) {
            for (let colI = 0; colI < this.gridSize; colI++) {
                if(this.gridBoard[rowI][colI] != -1){
                    this.gridBoard[rowI][colI] != 0 ? document.getElementById(this.buttonIDs[rowI][colI]).style.backgroundColor = this.users[1][1] : document.getElementById(this.buttonIDs[rowI][colI]).style.backgroundColor = this.users[0][1]                    
                }
            }
        }
    }

    //show in the board the status of turn
    verifyGameTurn(turn:any):any{
        //turno: [0] No es mi turno, [1] Si es mi turno, [-1] Juego terminado
        if(turn == 0){
            return "Es del jugador"
        } else if (turn == 1){
            return "Es mio ahora"
        } else {
            return "Juego terminado"
        }
    }

    //finalizador: winner or last move before end game
    //show if win, lose, tie, or leave
    verifyIfGameIsEnded(status: any){
        this.gameStatus = status
        return this.gameStatus["causa"] !== "" ? true : false
    }

    verifyReasonEndGame(playerID: any, botStatus: boolean){
        if(botStatus){
            return "r"
        }
        if(this.gameStatus["finalizador"] == playerID){
            return this.gameStatus["causa"]
        } else {
            if(this.gameStatus["causa"] == "w"){
                return "l"
            } else{
                return this.gameStatus["causa"]
            }
        }
    }
}