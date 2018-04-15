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
export class MainMenuComponent implements OnInit {
  menuModel: MenuModel;
  colors: Array<any>;
  //get player data
  idP1:any
  idP2:number = 2

  //board parameters
  nSize: number
  bSize: number
  nRounds: number
  nColor: string
  games:any
  
  constructor(private service: Service, private router: Router) {
    this.menuModel = new MenuModel();
    this.colors = this.menuModel.getColorList();
    this.idP1 = 1
    //get the games of user
    this.service.getData("/user/gameList",{params:{idUsuario: 1, filtro: true}})
      .subscribe( 
        data => { 
            console.log("partidas: "+data["partidas"]) 
            this.games = data["partidas"]
            //UserDetails.Instance.setCurrentGameID(data["partidas"][0])
            console.log(data["partidas"][0])
            //console.log(UserDetails.Instance.getCurrentGameID())
        }, 
        err => { 
            console.log("Error") 
        } 
      )
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
            this.play()
        }, 
        err => { 
            console.log(err) 
        } 
      ) 
  }

  play(){
    // this.service.getData("/user/gameList",{params:{idUsuario: 1, filtro: true}})
    //   .subscribe( 
    //     data => { 
    //         console.log("partidas: "+data) 
    //         UserDetails.Instance.setCurrentGameID(data["partidas"][0])
             this.router.navigate(['/tablero'])
    //     }, 
    //     err => { 
    //         console.log("Error") 
    //     } 
    //   )
  }
}
