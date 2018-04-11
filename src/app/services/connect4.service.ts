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
        this.http.get(`${this.host}${url}`, params) 
            .subscribe( 
                data => { 
                    console.log(data) 
                    return data 
                }, 
                err => { 
                    console.log("Error") 
                } 
            )        
    }

    postData(url: string, body: any){ 
        this.http.post(`${this.host}${url}`, body) 
            .subscribe( 
                data=>{ 
                    console.log(data) 
                }, 
                err => { 
                    console.log(err) 
                } 
            ) 
    } 
}