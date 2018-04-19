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
  idUser:number
  nickname:string
  details:string

  constructor(private service: Service, private router: Router){}

  login(){
    this.service.getData("/user/checkUsuario",{
      params: {idUsuario: this.idUser}
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
      idUsuario: this.idUser,
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
    UserDetails.Instance.setUserID(this.idUser)
    UserDetails.Instance.setNickNameDetails(this.nickname, this.details)
    this.router.navigate(['/menu'])
  }
  onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
    console.log('Name: ' + profile.getName());
    console.log('Image URL: ' + profile.getImageUrl());
    console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
  }
}
