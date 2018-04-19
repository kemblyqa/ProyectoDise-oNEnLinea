import { UserDetails } from './../models/user.model';
import { Service } from './../services/connect4.service';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";
declare var jquery: any;
declare var $ : any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  idUser:number
  nickname:string
  details:string
  errorMsg:any

  constructor(private service: Service, private router: Router){}

  login(){
    this.service.getData("/user/checkUsuario",{
      params: {idUsuario: this.idUser}
    })
      .subscribe(
        resUser => {
          console.log(JSON.stringify(resUser))
          if(resUser["status"]){
            this.nickname = resUser["data"]["nickname"]
            this.details = resUser["data"]["detalles"]
            this.routeTo()
          } else {
            this.register()
          }
        }
      )
  }

  register(){
    $('#register').modal('show')
  }

  registerUser(){
    this.service.postData("/user/crearUsuario",{
      idUsuario: this.idUser,
      nick: this.nickname,
      det: this.details
    })
      .subscribe(
        resSuccess => {
          resSuccess["status"] ? this.routeTo() : this.alertUser(resSuccess["data"])
        }
      )
  }

  alertUser(data: any){
    this.errorMsg = data
    $("#failed").modal("show")
  }

  routeTo(){
    UserDetails.Instance.setUserID(this.idUser)
    UserDetails.Instance.setNickNameDetails(this.nickname, this.details)
    this.router.navigate(['/menu'])
  }
}
