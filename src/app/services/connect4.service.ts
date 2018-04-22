import { HttpClient } from '@angular/common/http'; 
import { Response } from '@angular/http'; 
import { Injectable } from '@angular/core'; 
import { Observable } from 'rxjs/Observable'; 
import { tap, catchError } from 'rxjs/operators'; 
import { of } from 'rxjs/observable/of'; 
 
@Injectable() 
export class Service { 
    host:string = "http://localhost:3000" 
 
    constructor(private http: HttpClient){} 
 
    getData(url: string, params: any){
        return this.http.get(`${this.host}${url}`, params)       
    }

    postData(url: string, body: any){ 
        return this.http.post(`${this.host}${url}`, body) 
    } 

    getGoogleProfileData(email:any){
        return this.http.get(`http://picasaweb.google.com/data/entry/api/user/${email}@gmail.com?alt=json`)
    }
}