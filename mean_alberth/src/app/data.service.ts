import { Injectable } from '@angular/core';

import { Http, Headers, RequestOptions } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class DataService {

  result:any;

  constructor(private _http: Http) { }

  getPartida(x) {
    return this._http.get("/api/getPartida?idPartida="+x)
      .map(result => this.result = result.json().data);
  }

}