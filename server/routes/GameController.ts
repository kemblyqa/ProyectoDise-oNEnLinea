//importar objetos desde express
import {Router, Request, Response} from "express";
import gameModel from './../models/game.model'

let mongoose = require('mongoose');
let async = require('async')
function consulta(query: string, res: Response) {
    mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
        mongoose.connection.db.eval(query)
            .then(result =>{
                res.json(result);
        })
            .catch(err =>{
                res.json(err);
        });

    })
    .catch(() => {res.json("Error de conexion")});
}

class GameController{
    router : Router;
    constructor(){
        this.router = Router();
        this.routes();
    }

    public static finPartida(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        consulta("finalizarPartida("+idPartida+")", res);
    }

    public static finRonda(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        let idFinalizador = req.query.idFinalizador;
        let razon = req.query.razon;
        consulta("finalizarRonda("+idPartida+","+ronda+","+idFinalizador+",'"+razon+"')", res);
    }

    public static getRegistro(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        let ronda = req.query.ronda;
        consulta("getChatLog("+idPartida+","+ronda+")",res);
    }

    public static getInfoPartida(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        consulta("getInfoPartida("+idPartida+")",res);
    }

    public static getInfoRonda(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        consulta("getInfoRonda("+idPartida+","+ronda+")",res);
    }

    public static getTablero(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        consulta("getTablero("+idPartida+","+ronda+")",res);
    }

    public static jugada(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        let fila = req.query.fila;
        let columna = req.query.columna;
        let idJugador = req.query.idJugador;
        async.waterfall([
            function(callback){
                mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
                    mongoose.connection.db.eval("getInfoRonda("+idPartida+","+ronda+")")
                        .then(result1 =>{
                            if (result1.estado.finalizador!=""){
                                res.json(false);
                                return;
                            }
                            mongoose.connection.db.eval("getInfoPartida("+idPartida+")")
                            .then(result2 =>{
                                let jugadas : Array<Array<any>> = result1.jugadas;
                                let jugador : number;
                                if (result2.usuarios[0][0] == idJugador){
                                    jugador=0;}
                                else if (result2.usuarios[1][0] == idJugador){
                                    jugador=1;}
                                else{
                                    jugador=-1;}
                                callback(null,result1.tablero,result2.tamano_linea,jugadas.length,jugador)})
                            .catch(err =>{
                                res.json(err);});
                        })
                        .catch(err =>{
                            res.json(err);})
                            })
                    .catch(err =>{
                        res.json(err);});
            },
            function(tablero,size,turno : number,jugador,callback){
                console.log("tablero: " + tablero + "\ntamano: " + size + "\nturno: "+ turno + "\njugador: " +jugador);
                let model = new gameModel(tablero,size);
                if (turno%2==jugador){
                    let tupla = model.getCellInGrid(columna,jugador);
                    if (tupla !=null){
                        consulta("jugada("+idPartida+","+ronda+","+tupla[0]+","+tupla[1]+","+jugador+")",res);
                        let estado = model.isNConnected(tupla[0],tupla[1],jugador);
                        if (estado !="p")
                        mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
                            mongoose.connection.db.eval("finalizarRonda("+idPartida+","+ronda+","+idJugador+","+estado+")")
                                .then(result1 =>{res.json(estado)})});
                        return;
                    }
                }
                res.json(false)
            }
        ])
    }

    public static setTablero(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        let tablero=req.query.tablero;
        consulta("setTablero("+idPartida+","+ronda+","+tablero+")",res);
    }

    public static linkUsuario(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let idUsuario=req.query.idUsuario;
        let color=req.query.color;
        consulta("linkUsuarioPartida("+idPartida+","+idUsuario+",'"+color+"')",res);
    }

    public static newGame(req: Request, res: Response){
        let idJ1 = req.query.idJ1;
        let color1 = req.query.color1;
        let idJ2 = req.query.idJ2;
        let color2 = req.query.color2;
        let size = req.query.size;
        let lineSize = req.query.lineSize;
        let nRondas = req.query.nRondas;
        consulta("nuevaSesion("+idJ1+",'"+color1+"',"+idJ2+",'"+color2+"',"+size+","+lineSize+","+nRondas+")",res);
    }

    public routes(): void{
        this.router.get('/finPartida',GameController.finPartida);
        this.router.post('/finRonda',GameController.finRonda);
        this.router.get('/getGamelog',GameController.getRegistro);
        this.router.get('/getInfoPartida',GameController.getInfoPartida);
        this.router.get('/getInfoRonda',GameController.getInfoRonda);
        this.router.get('/getTablero',GameController.getTablero);
        this.router.post('/setTablero',GameController.setTablero);
        this.router.post('/jugada',GameController.jugada);
        this.router.post('/linkUsuarioPartida',GameController.linkUsuario);
        this.router.post('/nuevaSesion',GameController.newGame);
    }
}

const gameCTRL = new GameController();
const router = gameCTRL.router;
export default router;