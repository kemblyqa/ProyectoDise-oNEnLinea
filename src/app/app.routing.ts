//importacion componentes
import { TableroComponent } from "./tablero/tablero.component";

//importacion modulos
import { Routes } from "@angular/router";
import { LoginComponent } from "./login/login.component";

export const ROUTES: Routes = [
    {
        path: '', redirectTo: 'login', pathMatch: 'full'
    },
    {
        path: 'tablero', component: TableroComponent
    },
    {
        path: 'login', component: LoginComponent
    }
]