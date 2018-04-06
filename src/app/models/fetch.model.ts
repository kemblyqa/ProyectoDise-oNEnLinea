import { HttpClient } from '@angular/common/http';

export class Service {
    constructor(private http: HttpClient){}

    getData(apiUrl: string){
        this.http.get(apiUrl)
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