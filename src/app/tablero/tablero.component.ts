import { UserDetails } from './../models/user.model';
import { Service } from './../services/connect4.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  //board model
  tab:BuildBoard
  
  //needed in dialogs and notificatios
  dialogTitleEndGame:string
  dialogEndGame:string

  //partida actual prueba
  partida:number = 6

  constructor(private service:Service) {
    this.service.getData("/game/getInfoPartida",{params: {idPartida: UserDetails.Instance.getCurrentGameID()}})
      .subscribe(
        res => {
          //add data to BuildTablero
          this.tab = new BuildBoard(
            res["tamano"],
            res["tamano_linea"], 
            res["estado"],
            res["nRondas"],
            res["usuarios"]
          )
          //get the nSize to show in modal after finish
          this.nSize = this.tab.nSize
          //then init the board
          this.initBoard()
        },
        err => {
          console.log(err)
        }
      )
  }

  initBoard(){
    //get the board to fill
    this.service.getData("/user/rondaActiva",{params:{idPartida: UserDetails.Instance.getCurrentGameID()}})
      .subscribe(
        resLastRound => {
          this.tab.setActiveRound(resLastRound)
          this.service.getData("/game/getTablero",{params:{idPartida: UserDetails.Instance.getCurrentGameID(), ronda:resLastRound}})
            .subscribe(
              resBoard => {
                this.tab.setGrid(resBoard)
                //this get the ids and render the buttons in the template
                this.buttonIDs = this.tab.getIdButtonCells()
              }
            )
        },
        err => {
          console.log(err)
        }
      )
    //create the items of sidebar
    this.sideBarItems = this.tab.getSideBarItems()
  }
  
  //button event
  touchButton(e){
    //get the row and column
    this.movePosition = this.tab.getRowColButtonID(e.target.id)
    //post the move
    this.service.postData("/game/jugada",{
      idPartida: UserDetails.Instance.getCurrentGameID(),
      ronda: this.tab.getActiveRound(),
      fila: this.movePosition[0],
      columna: this.movePosition[1],
      idJugador: this.tab.getPlayerTurn()
      })
      .subscribe(
        status => {
          console.log(status)
          this.service.getData("/game/update",{
            params: {
              idPartida: UserDetails.Instance.getCurrentGameID(),
              ronda: this.tab.getActiveRound(),
              idJugador: this.tab.getPlayerTurn()
            }
          })
            .subscribe(
              resMove =>{
                console.log(JSON.stringify(resMove))
                this.tab.updateBoardGrid(resMove["estado"],resMove["tablero"], resMove["turno"])
              },
              err => {
                console.log(JSON.stringify(err))
              }
            )
        }
      ) 
  }

  openModalEndGame(){
    $("#end").modal('show')
  }

  verifyIfIsEnded(){
    switch(this.tab.getReasonStatus()){
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
      case "p":
        break;
    }
  }

  backToMenu(){
    $("#wrapper").toggleClass("toggled");
  }
}