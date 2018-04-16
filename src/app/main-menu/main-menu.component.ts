import { Game } from './../models/game.model';
import { UserDetails } from './../models/user.model';
import { Service } from './../services/connect4.service';
import { Component, OnInit } from '@angular/core';
import { MenuModel } from '../models/menu.model';
declare var jquery: any;
declare var $ : any;
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent {
  //model
  menuModel: MenuModel;
  colors: Array<any>;
  allGames:any
  activeGames:any

  //get player data
  idP1:any
  idP2:any

  //board parameters
  nSize: number
  bSize: number
  nRounds: number
  nColor: string
  active: boolean
  
  constructor(private service: Service, private router: Router) {
    this.menuModel = new MenuModel();
    this.colors = this.menuModel.getColorList();
    this.idP1 = UserDetails.Instance.getUserID()
    //get the games of user
    this.fillAllGames()
    this.fillActiveGames()
  }

  fillAllGames(){
    this.service.getData("/user/gameListFilter",{params:{idUsuario: this.idP1, filtro: false}})
      .subscribe( 
        data => { 
            this.allGames = data
            console.log(JSON.stringify(data))
        }, 
        err => { 
            console.log("Error") 
        } 
      )
  }

  fillActiveGames(){
    this.service.getData("/user/gameListFilter",{params:{idUsuario: this.idP1, filtro: true}})
      .subscribe( 
        data => { 
            this.activeGames = data
            console.log(JSON.stringify(data))
        }, 
        err => { 
            console.log("Error") 
        } 
      )
  }

  parametersBegin() {
    $('#parameters').modal('show');
  }

  optionsAIBegin() {
    $('#').modal('show');
  }

  newGame(){
    this.service.postData("/game/nuevaSesion", {
      idJ1: this.idP1,
      color1: this.nColor,
      idJ2: this.idP2,
      color2: "#00FA9A",  
      size: this.bSize,
      lineSize: this.nSize,
      nRondas : this.nRounds 
    })
      .subscribe( 
        data => { 
          //comprobar conexion con usuario before render
          console.log(data)
          //!data ? this.alertGame() : this.openGame(data)
        }, 
        err => { 
            console.log(err) 
        } 
      ) 
  }

  alertGame(){
    $('#failed').modal('show')
  }

  seeGames(){
    $('#gamesRegistered').modal('show');
  }

  openGame(id:any){
    UserDetails.Instance.setCurrentGameID(id)
    console.log(UserDetails.Instance.getCurrentGameID())
    this.router.navigate(['/tablero'])
  }
}
