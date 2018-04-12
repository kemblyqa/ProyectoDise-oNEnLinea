import { UserDetails } from './../models/user.model';
import { Service } from './../services/connect4.service';
import { Component, OnInit } from '@angular/core';
import { MenuModel } from '../models/menu.model';
declare var jquery: any;
declare var $ : any;
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {
  menuModel: MenuModel;
  colors: Array<any>;
  //get player data
  idP1:any
  idP2:number = 2
  activeGames:Array<any>
  urlGameListFilter:string = "/user/gameList"

  //board parameters
  nSize: number
  bSize: number
  nRounds: number
  nColor: string
  
  constructor(private service: Service) {
    this.menuModel = new MenuModel();
    this.colors = this.menuModel.getColorList();
    this.idP1 = UserDetails.Instance.getUserID
    this.retrieveInfoGames()
  }

  parametersBegin() {
    $('#parameters').modal('show');
  }
  ngOnInit() {
    //get the active games of the current user
    
  }

  optionsAIBegin() {
    $('#').modal('show');
  }
  newGame(){
    let apiUrl:string = "/game/nuevaSesion"
    const params = {
      idJ1: this.idP1,
      color1: this.nColor,
      idJ2: this.idP2,
      color2: "#8A2BE2",  
      size: this.bSize,
      lineSize: this.nSize,
      nRondas : this.nRounds 
    }
    this.service.postData(apiUrl, params)
  }

  retrieveInfoGames(){
    console.log(UserDetails.Instance.getUserID)
    let v:any = this.service.getData(this.urlGameListFilter,{idUsuario: UserDetails.Instance.getUserID})

    // let urlGetInfoGame = "/game/getInfoPartida"
    // //retrieve the info for each game
    // for(let game of activeGames){
    //     // this.activeGames.push(this.service.getData(urlGetInfoGame,{idPartida:game})) 
    //     console.log(game)
    // }
  }
}
