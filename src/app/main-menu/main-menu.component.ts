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
  /* service request url data */
  userUrl:string
  gameUrl:string

  /* menu model */
  menuModel: MenuModel;
  colors: Array<any>

  /* data binding to render in html */
  /* games modal */
  inactiveGames:Array<any>
  activeGames:Array<any>

  /* success and error messages */
  errorMsg:any
  successMsg:any

  /* game options */
  isActiveGames: boolean  //game active or inactive
  gameAIOptions:any       //options for bot or player
  level:any               //level options

  //open games
  openGames:Array<any>
  openColorSelected:any = "#8A2BE2"
  //invitations
  myInvitations:Array<any>
  inviteColorSelected: any = "#8A2BE2"

  /* user data params */
  idP1:any
  nickName:any
  imgUrl:string
  details:string;
  idP2:any

  /* AI params */
  optGame:any = "jugador"
  nAIColorP1:any = "#8A2BE2"
  nAIColorP2:any = "#7FFF00"
  optLevP1:any
  optLevP2:any

  /* board parameters */
  nSize: number
  bSize: number
  nRounds: number
  nColor: string = "#8A2BE2"
  againstPlayer:boolean
  
  /* friends options */
  friendsList:Array<any>
  newFriendList:Array<any>
  newFriend:any
  
  constructor(private service: Service, private router: Router) {
    /* user and game url for requests */
    this.userUrl = "/user/"
    this.gameUrl = "/game/"

    /* flags for show or hide components */
    this.isActiveGames = true
    this.againstPlayer = false

    /* set arrays */
    this.friendsList = []
    this.newFriendList = []
    this.myInvitations = []

    /* render info to set in menu */
    this.menuModel = new MenuModel()
    this.colors = this.menuModel.getColorList()
    this.gameAIOptions = this.menuModel.getAIOptions()
    this.level = this.menuModel.getLevels()
    this.idP1 = UserDetails.Instance.getUserID()
    this.imgUrl=UserDetails.Instance.getUrl();
    this.details=UserDetails.Instance.getDetails();

    /* set replay off */
    UserDetails.Instance.setreplayMode(false)
    this.nickName = UserDetails.Instance.getNickName()
    if (!UserDetails.Instance.getActive()){
        this.router.navigateByUrl('/login');
        window.location.reload();
      }
  }
  /* LOGOUT */
  exit(){
    this.router.navigateByUrl('/login');
    window.location.reload();
  }
  /* ALL GAMES, FRIENDS, INVITATIONS */
  /* inactive games request, fill array with inactive games */
  fillInactiveGames(){
    this.service.getData(`${this.userUrl}gameListFilter`,{params:{idUsuario: this.idP1, filtro: false}})
      .subscribe( 
        data => { 
          if(data["status"]){
            this.inactiveGames = data["data"]
            this.inactiveGames.reverse()
          } else {
            this.alertGameModal(data["data"])
          }
        } 
      )
  }
  /* active games request, fill array with active games */
  fillActiveGames(){
    this.service.getData(`${this.userUrl}gameListFilter`,{params:{idUsuario: this.idP1, filtro: true}})
      .subscribe( 
        data => { 
          if(data["status"]){
            this.activeGames = data["data"]
            this.activeGames.reverse()
          } else {
            this.alertGameModal(data["data"])
          }
        }
      )
  }
  /* open games request, fill array with open games */
  fillOpenGames(){
    this.service.getData(`${this.gameUrl}disponibles`,{
      params: {
        page: 1
      }
    })
    .subscribe(
      openGamesResponse => {
        openGamesResponse["status"] ? this.openGames = openGamesResponse["data"] : this.alertGameModal(openGamesResponse["data"])
      }
    )
  }
  /* set game to play, route to tablero view */
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
  /* google profile API request, sets profile picture to google user */
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
  /* MODALS MAIN MENU */
  showProfileModal(){
    $('#Profile').modal('show')
  }
  parametersModal() {
    this.fillFriendList()
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
    this.fillInactiveGames()
    $('#gamesRegistered').modal('show');
  }
  invitationsModal(){
    this.fillInvitations()
    $('#invitations').modal('show')
  }
  freeGamesModal(){
    this.fillOpenGames()
    $('#openGames').modal('show');
  }
  alertGameModal(msg: any){
    this.errorMsg = msg
    $('#failed').modal('show')
  }
  successModal(msg: any){
    this.successMsg = msg
    $('#successModal').modal('show');
  }
  /* set details request, allow user to set a status of himself or something */
  updateStatus(){
    this.service.postData(`${this.userUrl}setDetails`,{
      idUsuario: this.idP1,
      det : this.details
    })
    .subscribe(
      resFriendAdded => {
        resFriendAdded["status"] ? this.successModal(resFriendAdded["data"]) : this.alertGameModal(resFriendAdded["data"])
      }
    )
  }
  /* init game request, set new AI game */
  newAIGame(){
    this.service.postData(`${this.gameUrl}nuevaSesion`, {
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
        } 
      ) 
  }
  /* open game request, set new open game */
  freeGame(){
    this.service.postData(`${this.gameUrl}nuevaSesion`, {
      idJ1: this.idP1,
      color1: this.nColor,
      idJ2: "",
      color2: "",  
      size: this.bSize,
      lineSize: this.nSize,
      nRondas : this.nRounds 
    })
      .subscribe( 
        response => { 
          response["status"] ? this.successModal("Partida creada con éxito!") : this.alertGameModal(response["data"])
        }
      ) 
  }
  /* open game request, navigate to tablero view linking the users and creating the game */
  openFreeGame(id:any){
    this.service.postData(`${this.gameUrl}linkUsuarioPartida`,{
      idUsuario: this.idP1,
      idPartida: id,
      color: this.openColorSelected
    })
    .subscribe(
      dataResponse => {
        dataResponse["status"] ? this.openGame(id) : this.alertGameModal(dataResponse["data"])
      }
    )
  }
  /* set tablero for replay played game */
  replayGame(id:any){
    UserDetails.Instance.setreplayMode(true);
    this.openGame(id);
  }
  /* invite game request, set new invitation to specified user to play game */
  inviteGame(){
    this.service.postData(`${this.userUrl}invitar`, {
      idAnfitrion: this.idP1,
      color: this.nColor,
      idInvitado: this.idP2,
      tamano: this.bSize, 
      tamano_linea: this.nSize,
      nRondas: this.nRounds 
    })
      .subscribe( 
        response => { 
          console.log(JSON.stringify(response["data"]))
          response["status"] ? this.successModal(response["data"]) : this.alertGameModal(response["data"])
        } 
      ) 
  }
  /* accept invitation request, set user accepted invitation for play */
  acceptInvitation(id:any){
    this.service.postData(`${this.userUrl}aceptar`,{
      idUsuario: this.idP1,
      color: this.inviteColorSelected,
      idAnfitrion: id
    })
    .subscribe(
      resAccept => {
        resAccept["status"] ? this.successModal(resAccept["data"]) : this.alertGameModal(resAccept["data"])
        this.invitationsModal()
      }
    )
  }
  /* decline invitation request, set user declined invitation for play */
  declineInvitation(id:any){
    console.log(id)
    this.service.postData(`${this.userUrl}rechazar`,{
      idUsuario: this.idP1,
      idAnfitrion: id
    })
    .subscribe(
      resDecline => {
        resDecline["status"] ? this.fillInvitations() : this.alertGameModal(resDecline["data"])
      }
    )
  }
  /* invitations request, fill array with user invitations */
  fillInvitations(){
    this.myInvitations = []
    this.service.getData(`${this.userUrl}invitaciones`,{
      params: {
        idUsuario: this.idP1,
        page: 1
      }
    })
    .subscribe(
      resInvitations => {
        resInvitations["status"] ? this.myInvitations = resInvitations["data"] : this.alertGameModal(resInvitations["data"])
      }
    )
  }
  /* add friend game request, add a new friend to the current user */
  addFriend(friend: any){
    this.service.postData(`${this.userUrl}friend`,{
      id1: this.idP1,
      id2: friend
    })
    .subscribe(
      resFriendAdded => {
        resFriendAdded["status"] ? this.successModal(resFriendAdded["data"]) : this.alertGameModal(resFriendAdded["data"])
      }
    )
  }
  /* friend list request, fill array with user friends */
  fillFriendList(){
    this.friendsList = []
    this.service.getData(`${this.userUrl}friendListFilter`,{
      params: {
        idUsuario: this.idP1,
        filtro: true
      }
    })
    .subscribe(
      responseFriends =>{
        responseFriends["status"] ? this.getGoogleProfilePhoto(responseFriends["data"], this.friendsList) : this.alertGameModal(responseFriends["data"])
      }
    )
  }
  /* other people request, fill array with all users that could be a user friend */
  getOtherFriends(){
    this.newFriendList = []
    this.service.getData(`${this.userUrl}friendListFilter`,{
      params: {
        idUsuario: this.idP1,
        filtro: false
      }
    })
    .subscribe(
      otherFriendsRes =>{
        otherFriendsRes["status"] ? this.getGoogleProfilePhoto(otherFriendsRes["data"], this.newFriendList) : this.alertGameModal(otherFriendsRes["data"])
      }
    )
  }
}