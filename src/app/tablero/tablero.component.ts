import { UserDetails } from './../models/user.model';
import { Service } from './../services/connect4.service';
import { Component, OnInit, TemplateRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
declare var jquery:any;
declare var $ :any;
//models
import { BuildTablero } from "../models/tablero.model";
import { Z_ASCII } from 'zlib';

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.css']
})
export class TableroComponent implements OnInit {
  //get the initial data
  status:boolean
  nSize:number
  gSize:number
  users:Array<any>
  nRounds:number
  lastRound:number

  //needed in build of the board
  idButtonGrid:Array<any>
  sideBarItems: Array<any>
  tab:BuildTablero
  
  //needed in dialogs and notificatios
  
  dialogTitleEndGame:string
  dialogEndGame:string
  
  cells:number

  constructor(private service:Service) {
    // get the init board data
    this.service.getData("/game/getInfoPartida",{params: {idPartida: 3}})
      .subscribe(
        res => {
          // get content to be rendered
          this.status = res["estado"]
          this.gSize = res["tamano"]
          this.nSize = res["tamano_linea"]
          this.users = res["usuarios"]
          this.nRounds = res["nRondas"]

          //then init the board
          this.initBoard()
        },
        err => {
          console.log(err)
        }
      )
  }
  ngOnInit() {}

  initBoard(){
    this.tab = new BuildTablero(this.gSize, this.nSize);

    

    this.cells = this.tab.fill()

    //create the items of sidebar
    this.sideBarItems = this.tab.getSideBarItems()

    //get the size to use it in dialogs
    this.nSize = this.tab.nSize
    this.gSize = this.tab.gridSize

    //this get the ids and render the buttons in the template
    this.idButtonGrid = this.tab.getIdButtonCells()


    //this create all the ids in the grid and set values in other grid
    this.service.getData("/game/rondaActiva",{params:{idPartida: 3}})
      .subscribe(
        res => {
          console.log(res)
        },
        err => {
          console.log(err)
        }
      )
    
  }
  
  //button event
  touchButton(e){
    //get button id and properties
    let paintButton = document.getElementById(this.tab.getUpdateGridLayout(e.target.id))
    //when is his turn paint as the color he choose
    paintButton.style.backgroundColor = this.tab.getColorTurn() 
    this.verifyIfIsEnded()
    this.tab.switchPlayer()  
  }

  openModalEndGame(){
    $("#end").modal('show');
  }

  verifyIfIsEnded(){
    switch(this.tab.getGameStatus()){
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