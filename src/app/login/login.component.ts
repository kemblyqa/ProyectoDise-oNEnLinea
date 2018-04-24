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
  /* variables needed for binding user data */
  nickname:string
  details:string
  errorMsg:any

  /* constructor implements service: for request, router: for navigate */
  constructor(private service: Service, private router: Router){}
  /* login to menu, check the user, if doesnt exists, create a new account for him */
  login(){
    this.service.getData("/user/checkUsuario",{
      params: {idUsuario: document.getElementById("txtEmail").textContent}
    })
      .subscribe(
        resUser => {
          if(resUser["status"]){
            this.nickname = resUser["data"]["nickname"];
            this.details = resUser["data"]["detalles"];
            this.routeTo()
          } else if (resUser["data"]=="userNULL"){
            this.register()
          }
          else
            this.alertUser(resUser["data"])
        }
      )
  }
  /* register modal, to register a new user */
  register(){
    $('#register').modal('show')
  }
  /* register request, to register a new user */
  registerUser(){
    this.service.postData("/user/crearUsuario",{
      idUsuario: document.getElementById("txtEmail").textContent,
      nick: this.nickname,
      det: this.details
    })
      .subscribe(
        resSuccess => {
          console.log(JSON.stringify(resSuccess))
          resSuccess["status"] ? this.routeTo() : this.alertUser(resSuccess["data"])
        }
      )
  }
  /* alert modal, if something is wrong, shows the possible error */
  alertUser(data: any){
    this.errorMsg = data
    $("#failed").modal("show")
  }
  /* routes the user to main menu view */
  routeTo(){
    UserDetails.Instance.setActive(document.getElementById("txtEmail").textContent,this.nickname,this.details,document["imgPerfil"].src)
    this.router.navigate(['/menu'])
  }
}
