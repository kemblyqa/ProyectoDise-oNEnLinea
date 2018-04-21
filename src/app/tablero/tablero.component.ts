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

  //needed in build of the board
  buttonIDs:Array<any>
  sideBarItems: Array<any> 
  nSize:number
  movePosition:Array<any>
  playerTurn:any
  playerNickname:any
  playerRound:any
  playerIdGame:any
  playerID:any
  botGameStatus:boolean
  moveFlag:boolean = false

  //board model
  tab:BuildBoard
  timer:any
  
  //needed in dialogs and notificatios
  dialogTitleEndGame:string
  dialogEndGame:string
  errorMsg:string

  constructor(private service:Service,private router:Router) {
    //init variables to be used in the controller
    if (!UserDetails.Instance.getActive()){
      this.router.navigateByUrl('/login');
      window.location.reload();
    }
    this.playerNickname = UserDetails.Instance.getNickName()
    this.playerIdGame = UserDetails.Instance.getCurrentGameID() 
    this.playerID = UserDetails.Instance.getUserID()
    
    //get data of current game
    this.service.getData("/game/getInfoPartida",{params: {idPartida: this.playerIdGame}})
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
            this.botGameStatus = resData["data"]["usuarios"][0][0] == "e"  || resData["data"]["usuarios"][0][0] == "m" || resData["data"]["usuarios"][0][0] == "h" ? true : false
            //this get the ids and render the buttons in the template
            this.buttonIDs = this.tab.getIdButtonCells()
            //then init the board
            this.initBoard()
            //create the items of sidebar
            this.sideBarItems = this.tab.getSideBarItems()
          } else {
            this.errorMsg = resData["data"]
          }
        }
      )
  }

  initBoard(){
    //get the board to fill
    this.service.getData("/user/rondaActiva",{params:{idPartida: this.playerIdGame}})
      .subscribe(
        resLastRound => {
          if(resLastRound["status"]){
            this.playerRound = resLastRound["data"]
            this.tab.setActiveRound(resLastRound["data"])
            this.service.getData("/game/getTablero",{params:{idPartida: this.playerIdGame, ronda:this.playerRound}})
              .subscribe(
                resBoard => {
                  if(resBoard["status"]){
                    this.tab.setGrid(resBoard["data"])
                    this.updateGameEvent()
                  }
                }
              )
          } else {
            this.errorMsg = resLastRound["data"]
          }
        },
        err => {
          console.log(err)
        }
      )
  }
  //button event
  touchButton(e){
    //get the row and column
    this.movePosition = this.tab.getRowColButtonID(e.target.id)
    //post the move
    this.service.postData("/game/jugada",{
      idPartida: this.playerIdGame,
      ronda: this.playerRound,
      fila: this.movePosition[0],
      columna: this.movePosition[1],
      idJugador: this.playerID
      }).subscribe(
        status => {
          this.moveFlag=status["status"]
          console.log(`-->jugador: ${UserDetails.Instance.getUserID()}
          -->estado: ${status["data"]}`)
        }
      ) 
  }

  updateGameEvent(){
    this.timer = setInterval(() => {
      this.service.getData("/game/update",{
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
              this.errorMsg = resMove["data"]
            }
            
          },
          err => {
            console.log(JSON.stringify(err))
          }
        )
        this.moveFlag=false;
    }, 3000)
  }

  openModalEndGame(){
    $("#end").modal('show')
  }

  gameIsEnded(){
    clearInterval(this.timer)
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
  }

  backToMenu(){
    $("#wrapper").toggleClass("toggled");
  }
}