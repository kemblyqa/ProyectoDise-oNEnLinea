import { UserDetails } from "./user.model";

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

    /* get the other player id */
    getOtherPlayer(){
        return UserDetails.Instance.getUserID() == this.users[0][0] ? this.users[1][0] : this.users[0][0]
    }

    /* parse the json of Google API response to get the profile picture link */
    parseProfilePhotos(response: any){
        return response["entry"]["gphoto$thumbnail"]["$t"]
    }

    /* get the position id of cells grid to paint the button */
    getRowColButtonID(id){
        for (let rowI = 0; rowI < this.gridSize; rowI++) {
            for (let colI = 0; colI < this.gridSize; colI++) {
                if(this.buttonIDs[rowI][colI] == id){
                    return [rowI, colI]
                }
            }
        }
    }
    /* updates the board with the colors of players */
    updateBoardGrid(){
        for (let rowI = 0; rowI < this.gridSize; rowI++) {
            for (let colI = 0; colI < this.gridSize; colI++) {
                if(this.gridBoard[rowI][colI] != -1){
                    this.gridBoard[rowI][colI] != 0 ? document.getElementById(this.buttonIDs[rowI][colI]).style.backgroundColor = this.users[1][1] : document.getElementById(this.buttonIDs[rowI][colI]).style.backgroundColor = this.users[0][1]                    
                }
            }
        }
    }

    /* resets the board with no colors */
    resetBoardGrid(){
        for (let rowI = 0; rowI < this.gridSize; rowI++) {
            for (let colI = 0; colI < this.gridSize; colI++) {
                document.getElementById(this.buttonIDs[rowI][colI]).style.backgroundColor="#FFFFFF"
            }
        }
    }

    /* show in the board the status of turn */
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

    /* check if game is ended */
    verifyIfGameIsEnded(status: any){
        this.gameStatus = status
        return this.gameStatus["causa"] !== "" ? true : false
    }

    /* check the ended game reason */
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