import { Component, OnInit } from '@angular/core';
import { MenuModel } from '../models/menu.model';
declare var jquery: any;
declare var $ : any;
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {
  menuModel: MenuModel;
  colors: Array<any>;

  //board parameters
  nSize: number
  bSize: number
  nColor: number
  
  constructor(private http: HttpClient) {
    this.menuModel = new MenuModel();
    this.colors = this.menuModel.getColorList();
  }

  parametersBegin() {
    $('#parameters').modal('show');
  }
  ngOnInit() {
  }

  optionsAIBegin() {
    $('#').modal('show');
  }
  registersBegin(){
    //Esta funcion es provisional, ya que el html la necesita (no sé para que)
  }

}
