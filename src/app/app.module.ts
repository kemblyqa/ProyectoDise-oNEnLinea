import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { TableroComponent } from './tablero/tablero.component';
import { RouterModule } from "@angular/router";
import { ROUTES } from './app.routing';
import { LoginComponent } from './login/login.component';

@NgModule({
  declarations: [
    AppComponent,
    TableroComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
