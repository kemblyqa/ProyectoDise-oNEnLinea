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
    }

    getIdButtonCells(){
        this.fill()
        return this.buttonIDs
    }

    getGridCharCells(){
        return this.gridBoard
    }

    getReasonStatus(){
        return this.gameStatus;
    }

    switchPlayer(){
        this.playerTurn = !this.playerTurn
    }

    getPlayerTurn(){
        return this.playerTurn ? this.users[0][0] : this.users[1][0]
    }

    getColorUser(){
        return this.playerTurn ? this.users[0][1] : this.users[1][1]
    }

    getRowColButtonID(id){
        for (let rowI = 0; rowI < this.gridSize; rowI++) {
            for (let colI = 0; colI < this.gridSize; colI++) {
                //if id is found, then we need the column
                if(this.buttonIDs[rowI][colI] == id){
                    return [rowI, colI]
                }
            }
        }
    }

    updateBoardGrid(status:any, board: Array<any>, turn:any){
        //fill the buttons with players
        for (let rowI = 0; rowI < this.gridSize; rowI++) {
            for (let colI = 0; colI < this.gridSize; colI++) {
                if(board[rowI][colI] != -1){
                    board[rowI][colI] != 0 ? document.getElementById(this.buttonIDs[rowI][colI]).style.backgroundColor = this.users[0][1] : document.getElementById(this.buttonIDs[rowI][colI]).style.backgroundColor = this.users[1][1]                    
                }
            }
        }
        //change the player [testing]
        //this.switchPlayer()
    }
}