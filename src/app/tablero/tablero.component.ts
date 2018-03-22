import { Component, OnInit, TemplateRef } from '@angular/core';
declare var jquery:any;
declare var $ :any;
//models
import { BuildTablero } from "../models/tablero.model";

@Component({
  selector: 'app-tablero',
  templateUrl: './tablero.component.html',
  styleUrls: ['./tablero.component.css']
})
export class TableroComponent implements OnInit {
  //needed in build of the board
  idButtonGrid:Array<any>
  sideBarItems: Array<any>
  tab:BuildTablero
  
  //needed in dialogs and notificatios
  size:number
  dialogTitleEndGame:string
  dialogEndGame:string

  constructor() {
    this.tab = new BuildTablero(30,3)
    //this create all the ids in the grid and set values in other grid
    this.tab.fill()
    this.sideBarItems= this.tab.getSideBarItems()
    //get the size to use it in dialogs
    this.size = this.tab.nSize
    //this get the ids and render the buttons in the template
    this.idButtonGrid = this.tab.getIdButtonCells()

    
  }
  ngOnInit() {}
  
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

  }

  /* Set the width of the side navigation to 250px and the left margin of the page content to 250px */
  openNav() {
    document.getElementById("mySidenav").style.width = "250px";
  }

/* Set the width of the side navigation to 0 and the left margin of the page content to 0 */
  closeNav() {
    document.getElementById("mySidenav").style.width = "0";
  }
}