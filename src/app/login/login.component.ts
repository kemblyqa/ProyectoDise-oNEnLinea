import { UserDetails } from './../models/user.model';
import { Service } from './../services/connect4.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  idUser:number
  nickname:string
  details:string

  constructor(private service: Service, private router: Router){}

  //only once, I need only one player
  login(){
    this.service.getData("/user/checkUsuario",{
      params: {idUsuario: this.idUser}
    })
      .subscribe(
        resUser => {
          if(resUser == null){

          }
        }
      )
    let url:string = "/user/crearUsuario"
    const params = {
        idUsuario: this.idUser,
        nick: this.nickname,
        det: this.details
    }
    // this.service.postData(url,params)
    //   .subscribe(
    //     res => {
    //       UserDetails.Instance.setUserID(this.player)
    //       this.router.navigate(['/menu'])
    //     }
    //   )
    UserDetails.Instance.setUserID(this.idUser)
    this.router.navigate(['/menu'])
  }

  register(){
    
  }
}
