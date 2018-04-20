import { UserDetails } from './../models/user.model';
import { Service } from './../services/connect4.service';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from "@angular/router";

declare var jquery: any;
declare var $ : any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent{
  nickname:string
  details:string

  constructor(private service: Service, private router: Router){}

  login(){
    console.log(document.getElementById("txtEmail").textContent)
    this.service.getData("/user/checkUsuario",{
      params: {idUsuario: document.getElementById("txtEmail").textContent}
    })
      .subscribe(
        resUser => {
          if(resUser == null){
            this.register()
          }else{
            this.nickname = resUser["nickname"]
            this.details = resUser["detalles"]
            this.routeTo()
          }
        }
      )
  }

  register(){
    $('#register').modal('show')
  }

  registerUser(){
    this.service.postData("/user/crearUsuario",{
      idUsuario: document.getElementById("txtEmail").textContent,
      nick: this.nickname,
      det: this.details
    })
      .subscribe(
        resSuccess => {
          resSuccess ? this.routeTo() : this.alertUser()
        }
      )
  }

  alertUser(){
    $("#failed").modal("show")
  }

  routeTo(){
    UserDetails.Instance.setUserID(document.getElementById("txtEmail").textContent)
    UserDetails.Instance.setNickNameDetails(this.nickname, this.details)
    this.router.navigate(['/menu'])
  }
}
