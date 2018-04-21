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
  errorMsg:any

  constructor(private service: Service, private router: Router){}

  login(){
    console.log(document.getElementById("txtEmail").textContent)
    this.service.getData("/user/checkUsuario",{
      params: {idUsuario: document.getElementById("txtEmail").textContent}
    })
      .subscribe(
        resUser => {
          console.log(JSON.stringify(resUser))
          if(resUser["status"]){
            this.nickname = resUser["data"]["nickname"];
            this.details = resUser["data"]["detalles"];
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
      idUsuario: document.getElementById("txtEmail").textContent,
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
    UserDetails.Instance.setActive(document.getElementById("txtEmail").textContent,this.nickname,this.details)
    this.router.navigate(['/menu'])
  }
}
