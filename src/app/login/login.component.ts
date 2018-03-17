import { Component, OnInit } from '@angular/core';
//models
import { BuildTablero } from "../models/tablero.model";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  idButtonGrid:Array<any>
  tab:BuildTablero

  //style binding
  notPlayed:boolean

  constructor(){
    this.tab = new BuildTablero(9,4)
    //this create all the ids in the grid and set values in other grid
    this.tab.fill()

    //this get the ids and render the buttons in the template
    this.idButtonGrid = this.tab.getIdButtonCells()
  } 
  ngOnInit() { }

  //button event
  touchButton(e){
    //get button id and properties

    //when is his turn paint as the color he choose
    let paintButton = document.getElementById(this.tab.getUpdateGridLayout(e.target.id))
    paintButton.style.backgroundColor = this.tab.getColorTurn() 
    this.tab.switchPlayer() 
  }
}
