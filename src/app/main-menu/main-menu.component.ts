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
  inactiveGames:Array<any>
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
  nColor: string = "#8A2BE2"
  isActiveGames: boolean
  againstPlayer:boolean

  //AI params
  optGame:any = "jugador"
  nAIColorP1:any = "#8A2BE2"
  nAIColorP2:any = "#7FFF00"
  optLevP1:any
  optLevP2:any

  //friends
  friendsListPages:any
  friendsList:any
  newFriend:any

  //open games
  openGames:Array<any>
  colorSelected:any = "#8A2BE2"
  
  
  constructor(private service: Service, private router: Router) {
    //juegos activos por defecto
    this.isActiveGames = true
    this.againstPlayer = false

    //render info to set in menu
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
    //get the games of user
    this.fillAllGames()
    this.fillActiveGames()
    this.fillOpenGames()
  }

  //LOGOUT
  exit(){
    this.router.navigateByUrl('/login');
    window.location.reload();
  }

  //ALL GAMES, FRIENDS, INVITATIONS
  fillAllGames(){
    this.service.getData("/user/gameListFilter",{params:{idUsuario: this.idP1, filtro: false}})
      .subscribe( 
        data => { 
          if(data["status"]){
            this.inactiveGames = data["data"]
          } else {
            this.alertGameModal(data["data"])
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
          } else {
            this.alertGameModal(data["data"])
          }
        }, 
        err => { 
            console.log("Error") 
        } 
      )
  }

  fillOpenGames(){
    this.service.getData("/game/disponibles",{
      params: {
        page: 1
      }
    })
    .subscribe(
      openGamesResponse => {
        if(openGamesResponse["status"]){
          console.log(JSON.stringify(openGamesResponse))
          this.openGames = openGamesResponse["data"]
        }else{
          this.alertGameModal(openGamesResponse["data"])
        }
      }, 
      err =>{
        console.log(JSON.stringify(err))
      }
    )
  }

  fillFriendList(){
    this.service.getData("/user/friendList",{
      params: {
        idUsuario: this.idP1
      }
    })
    .subscribe(
      dataResponse => {
        if(dataResponse["status"]){
          console.log(JSON.stringify(dataResponse))
          this.friendsList = dataResponse["data"]
        } else{
          this.alertGameModal(dataResponse["data"])
        }
      }
    )
  }

  //GAME
  openGame(id:any){
    UserDetails.Instance.setCurrentGameID(id)
    this.router.navigate(['/tablero'])
  }

  gameModeChange(value){
    console.log("switching visibility")
    if (value == "bot")
      document.getElementById("botlvl1").hidden=false
    else
      document.getElementById("botlvl1").hidden=true
  }

  //MODALS MAIN MENU
  parametersModal() {
    $('#parameters').modal('show');
  }

  optionsAIModal(){
    $("#paramsAI").modal("show")
  }

  friendsModal(){
    $('#friends').modal('show')
  }

  newFriendsModal(){
    $('#addFriendModal').modal('show')
  }

  allGamesModal(){
    $('#gamesRegistered').modal('show');
  }

  invitationsModal(){
    $('#invitations').modal('show')
  }

  freeGamesModal(){
    $('#openGames').modal('show');
  }

  messagesModal(){}

  alertGameModal(msg: any){
    this.errorMsg = msg
    $('#failed').modal('show')
  }

  //INIT GAMES
  newAIGame(){
    this.service.postData("/game/nuevaSesion", {
      idJ1: this.optGame == "bot" ? this.optLevP1 : this.idP1, //player or bot
      color1: this.nAIColorP1,
      idJ2: this.optLevP2,  //bot
      color2: this.nAIColorP2,  
      size: this.bSize,
      lineSize: this.nSize,
      nRondas : 1
    })
      .subscribe( 
        response => { 
          response["status"] ? this.openGame(response["data"]) : this.alertGameModal(response["data"])
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
      idJ2: this.againstPlayer ? this.idP2 : "",
      color2: "",  
      size: this.bSize,
      lineSize: this.nSize,
      nRondas : this.nRounds 
    })
      .subscribe( 
        response => { 
          console.log(JSON.stringify(response["data"]))
          response["status"] ? this.fillActiveGames() : this.alertGameModal(response["data"])
        }, 
        err => { 
          console.log(err) 
        } 
      ) 
  }
  replayGame(id:any){
    this.service.getData("/game/jugadas",{
      params: {
        idPartida: id
      }
    })
    .subscribe(
      dataRes => {
        if(dataRes["status"]){
          dataRes["data"]
        } else {
          this.alertGameModal(dataRes["data"])
        }
      }, 
      err => {
        console.log(JSON.stringify(err))
      }
    )
  }

  //FRIENDS
  addFriend(nickname: any){
    this.service.postData("",{
      id1: this.idP1,
      id2: this.idP2
    })
  }

  getFriends(){
    this.service.getData("/user/friendListFilter",{
      params: {
        idUsuario: this.idP1,
        filtro: true
      }
    })
    .subscribe(
      responseFriends =>{
        if(responseFriends["status"]){
          console.log(JSON.stringify(responseFriends))
          this.friendsListPages = this.menuModel.checkPaginationFriendList(responseFriends["data"])
          this.friendsList = this.menuModel.getFriendsList()
        } else {
          this.alertGameModal(responseFriends["data"])
        }
      },
      errorFriends => {
        console.log(errorFriends)
      }
    )
  }

  getOtherFriends(){
    this.service.getData("/user/friendListFilter",{
      params: {
        idUsuario: this.idP1,
        filtro: false
      }
    })
    .subscribe(
      otherFriendsRes =>{
        if(otherFriendsRes["status"]){
          console.log(JSON.stringify(otherFriendsRes))
        } else {
          this.alertGameModal(otherFriendsRes["data"])
        }
      },
      err => {
        console.log(JSON.stringify(err))
      }
    )
  }

  //OPEN GAMES
  openFreeGame(id:any){
    this.service.postData("/game/linkUsuarioPartida",{
      idUsuario: this.idP1,
      idPartida: id,
      color: this.colorSelected
    })
    .subscribe(
      dataResponse => {
        console.log(JSON.stringify(dataResponse))
        if(dataResponse["status"]){
          this.openGame(id)
        } else {
          this.alertGameModal(dataResponse["data"])
        }
      },
      err => {
        console.log(JSON.stringify(err))
      }
    )
  }
}
