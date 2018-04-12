import { UserDetails } from './models/user.model';
import { Service } from './services/connect4.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { TableroComponent } from './tablero/tablero.component';
import { RouterModule } from '@angular/router';
import { ROUTES } from './app.routing';
import { LoginComponent } from './login/login.component';
import { MainMenuComponent } from './main-menu/main-menu.component';

import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    TableroComponent,
    LoginComponent,
    MainMenuComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES),
    HttpClientModule
  ],
  providers: [Service],
  bootstrap: [AppComponent]
})
export class AppModule { }
