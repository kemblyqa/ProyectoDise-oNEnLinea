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
  colors: Array<any>
  allGames:Array<any>
  activeGames:Array<any>
  errorMsg:any
  gameAIOptions:any
  level:any

  //get player data
  idP1:any
  nickName:any
  idP2:any
  statusGame:any

  //board parameters
  nSize: number
  bSize: number
  nRounds: number
  nColor: string
  active: boolean

  //AI params
  optGame:any = "jugador";
  nAIColorP1:any
  nAIColorP2:any
  optLevP1:any
  optLevP2:any
  
  constructor(private service: Service, private router: Router) {
    this.menuModel = new MenuModel()
    this.colors = this.menuModel.getColorList()
    this.gameAIOptions = this.menuModel.getAIOptions()
    this.level = this.menuModel.getLevels()
    this.idP1 = UserDetails.Instance.getUserID()
    this.nickName = UserDetails.Instance.getNickName()
    if (!UserDetails.Instance.getActive()){
        this.router.navigateByUrl('/login');
        window.location.reload();
      }
    //juegos activos por defecto
    this.active = true
    //get the games of user
    this.fillAllGames()
    this.fillActiveGames()
  }

  fillAllGames(){
    this.service.getData("/user/gameListFilter",{params:{idUsuario: this.idP1, filtro: false}})
      .subscribe( 
        data => { 
          if(data["status"]){
            this.allGames = data["data"]
            console.log(this.allGames)
          } else {
            this.errorMsg = data["data"]
          }
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
          if(data["status"]){
            this.activeGames = data["data"]
            console.log(this.allGames)
          } else {
            this.errorMsg = data["data"]
          }
        }, 
        err => { 
            console.log("Error") 
        } 
      )
  }

  parametersBegin() {
    $('#parameters').modal('show');
  }

  optionsAIBegin(){
    $("#paramsAI").modal("show")
  }

  newAIGame(){
    this.service.postData("/game/nuevaSesion", {
      idJ1: this.optGame == "bot" ? this.optLevP1 : this.idP1, //player or bot
      color1: this.nAIColorP1,
      idJ2: this.optLevP2,  //bot
      color2: this.nAIColorP2,  
      size: this.bSize,
      lineSize: this.nSize,
      nRondas : this.nRounds 
    })
      .subscribe( 
        response => { 
          response["status"] ? this.openGame(response["data"]) : this.alertGame(response["data"])
        }, 
        err => { 
            console.log(err) 
        } 
      ) 
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
        response => { 
          response["status"] ? this.fillActiveGames() : this.alertGame(response["data"])
        }, 
        err => { 
            console.log(err) 
        } 
      ) 
  }

  alertGame(msg: any){
    this.errorMsg = msg
    $('#failed').modal('show')
  }

  seeGames(){
    $('#gamesRegistered').modal('show');
  }

  activeGamesBegin(){
    $('#activeGames').modal('show');
  }

  seeMessages(){
    
  }

  seeFriends(){
  
  }

  salir(){
    this.router.navigateByUrl('/login');
    window.location.reload();
  }

  openGame(id:any){
    UserDetails.Instance.setCurrentGameID(id)
    this.router.navigate(['/tablero'])
  }
  print(x){
    console.log(x)
  }
  gameModeChange(value){
    this.print(value);
    //if (document.getElementById("gameType").nodeValue==)
  }
}
