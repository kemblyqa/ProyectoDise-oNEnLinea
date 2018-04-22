import { ROUTES } from './../app.routing';
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
  friendsList:Array<any>
  newFriendList:Array<any>
  newFriend:any

  //open games
  openGames:Array<any>
  colorSelected:any = "#8A2BE2"
  
  
  constructor(private service: Service, private router: Router) {
    //juegos activos por defecto
    this.isActiveGames = true
    this.againstPlayer = false
    this.friendsList = []
    this.newFriendList = []
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
  }

  //LOGOUT
  exit(){
    this.router.navigateByUrl('/login');
    window.location.reload();
  }

  //ALL GAMES, FRIENDS, INVITATIONS
  fillinactiveGames(){
    this.service.getData("/user/gameListFilter",{params:{idUsuario: this.idP1, filtro: false}})
      .subscribe( 
        data => { 
          if(data["status"]){
            this.inactiveGames = data["data"]
            this.inactiveGames.reverse()
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
            this.activeGames.reverse()
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
    this.fillFriendList()
    $('#friends').modal('show')
  }

  newFriendsModal(){
    this.getOtherFriends()
    $('#addFriendModal').modal('show')
  }

  allGamesModal(){
    this.fillActiveGames()
    this.fillinactiveGames()
    $('#gamesRegistered').modal('show');
  }

  invitationsModal(){
    $('#invitations').modal('show')
  }

  freeGamesModal(){
    this.fillOpenGames()
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
  addFriend(friend: any){
    this.service.postData("/user/friend",{
      id1: this.idP1,
      id2: friend
    })
    .subscribe(
      resFriendAdded => {
        if(resFriendAdded["status"]){
          console.log(resFriendAdded["data"])
        } else {
          this.alertGameModal(resFriendAdded["data"])
        }
      }
    )
  }

  fillFriendList(){
    this.friendsList = []
    this.service.getData("/user/friendListFilter",{
      params: {
        idUsuario: this.idP1,
        filtro: true
      }
    })
    .subscribe(
      responseFriends =>{
        if(responseFriends["status"]){
          this.getGoogleProfilePhoto(responseFriends["data"], this.friendsList)
        } else {
          this.alertGameModal(responseFriends["data"])
        }
      },
      errorFriends => {
        console.log(errorFriends)
      }
    )
  }

  getGoogleProfilePhoto(dataList:Array<any>, newList:Array<any>){
    for(let elem of dataList){
      this.service.getGoogleProfileData(elem["_id"])
      .subscribe(
        res => {
          newList.push(
            {
              id: elem["_id"],
              nickname: elem["nickname"],
              detalles: elem["detalles"],
              profilePhoto: this.menuModel.parseProfilePhotos(res)
            }
          )
        }
      )
    }
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
          this.getGoogleProfilePhoto(otherFriendsRes["data"], this.newFriendList)
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
