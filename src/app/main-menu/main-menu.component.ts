import { Component, OnInit } from '@angular/core';
import { MenuModel } from '../models/menu.model';
declare var jquery:any;
declare var $ :any;

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {
  menuModel:MenuModel
  colors:Array<any>
  constructor() { 
    this.menuModel = new MenuModel()
    this.colors = this.menuModel.getColorList()
  }

  parametersBegin(){
    $("#parameters").modal('show');
  }
  ngOnInit() {
  }

}
