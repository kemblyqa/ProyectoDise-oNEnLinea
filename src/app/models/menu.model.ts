import { UserDetails } from './user.model';
import { Service } from './../services/connect4.service';

export class MenuModel{
    //partidas IDs
    private idAllGames:any
    private idActiveGames:any
    //data
    //colors
    private colors:Array<any>
    private gameAIOptions: Array<any>
    private level: Array<any>

    constructor(){
        this.colors = [{
            id: 1,
            color: "#8A2BE2",
            styleName: "blueViolet",
            name: "violeta azul"
        },{
            id:2,
            color: "#7FFF00",
            styleName: "chartreuse",
            name: "verde fosforecente"
        },{
            id:3,
            color: "#DC143C", 
            styleName: "crimson",
            name: "vino"	
        },{
            id:4,
            color: "#00008B", 
            styleName: "darkBlue",
            name: "azul oscuro"
        },{
            id:5,
            color: "#FFD700",
            styleName: "gold",
            name: "amarillo"	
        },{
            id:6,
            color: "#FF1493",
            styleName: "deepPink",
            name: "rosado"	
        },{
            id:7,
            color: "#B22222",
            styleName: "fireBrick",
            name: "rojo ladrillo"	
        },{
            id:8,
            color: "#008000",
            styleName: "green",
            name: "verde"
        },{
            id:9,
            color: "#FF4500",	
            styleName: "orangeRed",
            name: "rojo naranja"
        },{
            id:10,
            color: "#008080",
            styleName: "teal",
            name: "celeste"	
        }]
        this.gameAIOptions = [{
            opt: 1,
            text: "Jugador contra máquina"
        },{
            opt: 2,
            text: "Máquina contra máquina"
        }]
        this.level = [{
            n: 1,
            level: "Fácil"
        },{
            n: 2,
            level: "Medio"
        },{
            n: 3,
            level: "Dificil"
        }]
    }

    getLevels(){
        return this.level
    }

    getAIOptions(){
        return this.gameAIOptions
    }

    setIdAllGames(games:any){
        this.idAllGames = games
    }

    getIdAllGames(){
        return this.idAllGames
    }

    setIdActiveGames(activeGames:any){
        this.idActiveGames = activeGames
    }

    getIdActiveGames(){
        return this.idActiveGames
    }

    getColorList(){
        return this.colors;
    }
}