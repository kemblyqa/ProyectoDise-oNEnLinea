import { Service } from './../services/connect4.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  player:number = 1
  nickName:string = "k"
  det:string = "no tengo idea"

  constructor(private service: Service){}

  //only once, I need only one player
  login(){
    let url:string = "/user/crearUsuario"
    const params = {
        idUsuario: this.player,
        nick: this.nickName,
        det: this.det
    }
    this.service.postData(url,params)
  }
}
