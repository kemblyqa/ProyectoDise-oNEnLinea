import { UserDetails } from './../models/user.model';
import { Service } from './../services/connect4.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
declare var jquery:any;
declare var $ :any;
//models
import { BuildBoard } from "../models/board.model";

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.css']
})
export class TableroComponent {

  /* server data url */
  userUrl:any
  gameUrl:any

  /* board model and interval time */
  tab:BuildBoard
  timer:any

  /* needed in build of the board */
  sideBarItems: Array<any> 
  wrapButton:boolean
  buttonIDs:Array<any>
  nSize:number
  movePosition:Array<any>
  botGameStatus:boolean
  
  /* player game board */
  playerTurn:any
  playerNickname:any
  playerSecondNickname:any
  playerRound:any
  playerIdGame:any
  playerID:any
  
  /* needed in dialogs and notifications */
  dialogTitleEndGame:string
  dialogEndGame:string
  notMsg:string
  notTittle:string

  /* chat render */
  chatLog:Array<any>
  replyMessage:any
  profilePicture:string
  secondPlayerNickname:string

  /* watching mode */
  jugadas:Array<any>
  counterJugadas:number
  moveFlag:boolean = false

  constructor(private service:Service,private router:Router) {
    /* user and game url for requests */
    this.userUrl = "/user/"
    this.gameUrl = "/game/"
    /* flags for show or hide components */
    this.wrapButton = false
    /* if user is not logged, reload the page on login route */
    if (!UserDetails.Instance.getActive()){
      this.router.navigateByUrl('/login');
      window.location.reload();
    }
    /* init variables to be used in the controller */
    this.playerRound = 0
    this.playerNickname = UserDetails.Instance.getNickName()
    this.playerIdGame = UserDetails.Instance.getCurrentGameID() 
    this.playerID = UserDetails.Instance.getUserID()
    /* get data of current game */
    this.service.getData(`${this.gameUrl}getInfoPartida`,{params: {idPartida: this.playerIdGame}})
    .subscribe(
      resData => {
        if(resData["status"]){
          //add data to BuildTablero
          this.tab = new BuildBoard(
            resData["data"]["tamano"],
            resData["data"]["tamano_linea"], 
            resData["data"]["estado"],
            resData["data"]["nRondas"],
            resData["data"]["usuarios"]
          )
          //get the nSize to show in modal after finish
          this.nSize = resData["data"]["tamano_linea"]
          //get if is a botgame to render the correct modal
          this.botGameStatus = this.tab.getOtherPlayer()  == "e"  || this.tab.getOtherPlayer() == "m" || this.tab.getOtherPlayer() == "h" ? true : false
          //this get the ids and render the buttons in the template
          this.buttonIDs = this.tab.getIdButtonCells()
          //then init the board
          this.initBoard()
        } else {
          this.notTittle = "Error"
          this.notMsg = resData["data"]
        }
        this.tab.setActiveRound(0)
      }
    )
  }
  /* init game requests, set the game */
  initBoard(){
    //playing mode
    this.getBasicInfoChat()
    if (!UserDetails.Instance.getreplayMode()){
      //get the board to fill
      this.service.getData(`${this.userUrl}rondaActiva`,{params:{idPartida: this.playerIdGame}})
      .subscribe(
        resLastRound => {
          if(resLastRound["status"]){
            this.playerRound = resLastRound["data"]
            this.tab.setActiveRound(resLastRound["data"])
            this.service.getData(`${this.gameUrl}getTablero`,{params:{idPartida: this.playerIdGame, ronda:this.playerRound}})
              .subscribe(
                resBoard => {
                  if(resBoard["status"]){
                    this.tab.setGrid(resBoard["data"])
                    this.fillChatLog()
                    this.updateGameEvent()
                  }
                }
              )
          } else {
            this.notTittle = "Error"
            this.notMsg = resLastRound["data"]
          }
        }
      )
    }
    //replay mode
    else{
      let tablero = []
      for(let x = 0;x<this.tab.gridSize;x++){
        tablero.push([])
        for(let y = 0;y<this.tab.gridSize;y++){
          tablero[x].push(-1)
        }
      }
      this.tab.setGrid(tablero)
      this.service.getData(`${this.gameUrl}jugadas`,
      {params: {
          idPartida: this.playerIdGame,
          ronda: this.playerRound
        }
      })
      .subscribe(
        moveList =>{
          if(moveList["status"]){
            this.jugadas = moveList["data"]["jugadas"];
            console.log(moveList["data"]["jugadas"])
            this.counterJugadas = 0;
            document.getElementById("nextButton").hidden=false;
          }
          else{
            alert(moveList["data"])
          }
        }
      )
    }
  }
  /* button event and request, when player set a move */
  touchButton(e){
    //get the row and column
    this.movePosition = this.tab.getRowColButtonID(e.target.id)
    //post the move
    this.service.postData(`${this.gameUrl}jugada`,{
      idPartida: this.playerIdGame,
      ronda: this.playerRound,
      fila: this.movePosition[0],
      columna: this.movePosition[1],
      idJugador: this.playerID
      }).subscribe(
        status => {
          this.moveFlag=status["status"]
        }
      ) 
  }
  /* next move request, get the next move of a played game, to view the progress */
  nextMove(){
    if (this.jugadas.length==0){
      this.service.getData(`${this.gameUrl}estadoAvanzado`,{
        params: {
          idPartida: this.playerIdGame,
          ronda: this.playerRound
        }
      })
        .subscribe(
          response =>{
            this.notificate(response["data"])
          }
        )
      if(this.playerRound+1>=this.tab.nRounds){
        document.getElementById("nextButton").hidden=true;
        UserDetails.Instance.setreplayMode(false);
        return;
      }
      this.playerRound++;
      this.initBoard();
      return;
    }

    this.service.getData(`${this.gameUrl}drawMove`,{
      params: {
        tablero: JSON.stringify(this.tab.gridBoard),
        jugada: this.jugadas[0],
        turno: this.counterJugadas%2
      }
    })
      .subscribe(
        newBoard =>{
          if(newBoard["status"]){
            this.counterJugadas++;
            this.jugadas.shift();
            //update board
            this.tab.setGrid(newBoard["data"]) 
          } else {
            alert(newBoard["data"])
          }
        },
        err => {
          console.log(JSON.stringify(err))
        }
      )
  }
  /* update request, update the board and the game in a interval of 3 seconds */
  updateGameEvent(){
    this.timer = setInterval(() => {
      this.service.getData(`${this.gameUrl}update`,{
        params: {
          idPartida: this.playerIdGame,
          ronda: this.playerRound,
          idJugador: this.playerID,
          moveFlag: this.moveFlag
        }
      })
        .subscribe(
          resMove =>{
            if(resMove["status"]){
              //update board
              this.tab.setGrid(resMove["data"]["tablero"])
              //change turn preview in the board
              this.playerTurn = this.tab.verifyGameTurn(resMove["data"]["turno"])
              //verify if the game is ended
              this.tab.verifyIfGameIsEnded(resMove["data"]["estado"]) ? this.gameIsEnded() : null 
            } else {
              this.notTittle = "Error"
              this.notMsg = resMove["data"]
            }
          },
          err => {
            console.log(JSON.stringify(err))
          }
        )
        this.fillChatLog()
        this.moveFlag=false;
    }, 3000)
  }
  /* chat log request, fill array with the current chat with players */
  fillChatLog(){
    this.service.getData(`${this.userUrl}getChatLog`,{
      params: {
        idOne: this.playerID,
        idTwo: this.tab.getOtherPlayer()
      }
    })
    .subscribe(
      resChat => {
        resChat["status"] ? this.chatLog = resChat["data"] : this.notificate(resChat["data"])
      }
    )
  }
  /* send message request, send a message to chat */
  sendMessage(){
    if(this.replyMessage !== "" && this.replyMessage!==undefined){
      this.service.postData(`${this.userUrl}enviarMsg`,{
        idEmisor: this.playerID,
        idReceptor: this.tab.getOtherPlayer(),
        msg: this.replyMessage
      })
      .subscribe(
        resChatSent => {
          resChatSent["status"] ? this.fillChatLog() : this.notificate(resChatSent["data"])
          this.replyMessage = ""
        }
      )
    }
  }
  /* basic info chat requests, get info to show in chat log */
  getBasicInfoChat(){
    if(this.tab.getOtherPlayer() == "e"  || this.tab.getOtherPlayer() == "m" || this.tab.getOtherPlayer() == "h"){
      this.profilePicture = "../../assets/icons/download.png"
      this.service.getData(`${this.userUrl}checkUsuario`,{
        params: {
          idUsuario: this.tab.getOtherPlayer()
        }
      })
      .subscribe(
        resNickname => {
          this.secondPlayerNickname = resNickname["data"]["nickname"]
        }
      )
    } else {
      this.service.getGoogleProfileData(this.tab.getOtherPlayer())
      .subscribe(
        resProfile => {
          this.profilePicture = this.tab.parseProfilePhotos(resProfile)
          this.service.getData(`${this.userUrl}checkUsuario`,{
            params: {
              idUsuario: this.tab.getOtherPlayer()
            }
          })
          .subscribe(
            resNickname => {
              this.secondPlayerNickname = resNickname["data"]["nickname"]
            }
          )
        }
      )
    }
  }
  /* left game request, ends a game with left status */
  left(){
    clearInterval(this.timer)
    this.service.postData(`${this.gameUrl}abandono`,{
      idPartida: this.playerIdGame,
      idJugador: this.playerID
    })
    .subscribe(
      dataResponse => {
        if(!dataResponse["status"]){
          this.notificate(dataResponse["data"])
        } else {
          this.mainMenu()
        }
      }
    )
  }
  /* if game ended, render modals to show result to user */
  gameIsEnded(){
    switch(this.tab.verifyReasonEndGame(this.playerID, this.botGameStatus)){
      case "w":
        this.dialogEndGame = "Yeahh!! Has ganado exitosamente "
        this.dialogTitleEndGame = "VICTORIA...."
        this.openModalEndGame()
        break
      case "l":
        this.dialogEndGame = "Oh!! Has perdido lamentablemente "
        this.dialogTitleEndGame = "DERROTA...."
        this.openModalEndGame()
        break
      case "t":
        this.dialogEndGame = "Umm!! Pues ha sido empate "
        this.dialogTitleEndGame = "EMPATE...."
        this.openModalEndGame()
        break
      case "a":
        this.dialogEndGame = "Oops!! La partida ha sido abandonada "
        this.dialogTitleEndGame = "ABANDONO...."
        this.openModalEndGame()
        break;
      case "r":
        this.dialogEndGame = "Juego de bots terminado "
        this.dialogTitleEndGame = "TERMINADO...."
        this.openModalEndGame()
    }
    if(this.tab.nRounds-1==this.playerRound){
      clearInterval(this.timer)
    }
    else{
      this.playerRound++;
      this.resetBoard()
    }
  }
  /* reset the board for a new round */
  resetBoard(){
    this.tab.resetBoardGrid();
  }
  /* toggle the sidebar */
  backToMenu(){
    this.wrapButton = !this.wrapButton
    $("#wrapper").toggleClass("toggled");
  }
  /* back to main menu, route to menu view */
  mainMenu(){
    clearInterval(this.timer)
    this.router.navigate(['/menu'])
  }
  /* notification modal, show status of any event */
  notificate(data: any){
    this.notTittle="Info"
    this.notMsg = data
    $("#notification").modal("show")
  }
  /* end game modal, show the result according with the status of the current player */
  openModalEndGame(){
    $("#end").modal('show')
  }
}