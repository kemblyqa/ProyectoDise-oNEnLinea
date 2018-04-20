import { MainMenuComponent } from './main-menu/main-menu.component';
//importacion componentes
import { TableroComponent } from "./tablero/tablero.component";
import { LoginComponent } from "./login/login.component";

//importacion modulos
import { Routes } from "@angular/router";

export const ROUTES: Routes = [
    {
        path: '', redirectTo: 'login', pathMatch: 'full'
    },
    {
        path: 'tablero', component: TableroComponent
    },
    {
        path: 'login', component: LoginComponent
    },
    {
        path: 'menu', component: MainMenuComponent
    },
    {
        path: '**', redirectTo: 'menu', pathMatch: 'full'
    }
]