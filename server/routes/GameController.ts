//importar objetos desde express
import {Router, Request, Response} from "express";

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/connect4');

function consulta(query: string, res: Response) {
    mongoose.connection.db.eval(query)
        .then(result =>{
            res.json(result);
        })
        .catch(err =>{
            res.json(err);
        });
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

    public static setTablero(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        let fila = req.query.fila;
        let columna = req.query.columna;
        let idJugador = req.query.idJugador;
        consulta("jugada("+idPartida+","+ronda+","+fila+","+columna+","+idJugador+")",res);
    }

    public static jugada(req: Request, res: Response){
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