import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  title = 'app';
  results = '';
  constructor(private http: HttpClient){}

  ngOnInit(): void {
    this.http.get('https://api.github.com/users/kemblyqa').subscribe(
      data => {
        console.log(data);
      },
      err => {
        console.log("Error")
      }
    );
  }
  
}