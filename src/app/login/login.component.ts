import { Component, OnInit } from '@angular/core';
//models
import { BuildTablero } from "../models/tablero.model";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  
  tablero:Array<any>;

  constructor(){
    let tab:BuildTablero = new BuildTablero();
    tab.llenar()
    this.tablero = tab.tamTablero()
    console.log(this.tablero)
  } 
  ngOnInit() { }
}
