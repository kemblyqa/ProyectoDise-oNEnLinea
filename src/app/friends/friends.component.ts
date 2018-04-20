import { Service } from './../services/connect4.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {

  constructor(private service:Service) {
    this.getFriends()
  }

  ngOnInit() {
  }

  getFriends(){
  //   this.service.getData("/user/friendList",{
  //     params:{
  //       idUsuario:,
  //       page:
  //     }
    
  //   })
  // }
  }

}
