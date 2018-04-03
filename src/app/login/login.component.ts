import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private http: HttpClient){}

  ngOnInit(): void {
    this.http.get('https://api.github.com/users/kemblyqa')
    .subscribe(
      data => {
        console.log(data);
      },
      err => {
        console.log("Error")
      }
    );
  }
}
