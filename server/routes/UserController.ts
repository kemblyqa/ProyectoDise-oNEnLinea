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

class ControladorPersona{
    router : Router;
    constructor(){
        this.router = Router();
        this.routes();
    }

    public static crearUsuario(req: Request, res: Response){
        let idUsuario = req.body.idUsuario;
        let nick = req.body.nick;
        let det = req.body.det;
        consulta("cUsuario("+idUsuario+",'"+nick+"','"+det+"')",res);
    }

    public static chat(req: Request, res: Response){
        let idEmisor    = req.body.idEmisor;
        let idReceptor  = req.body.idReceptor;
        let msg         = req.body.msg;
        consulta("chat("+idEmisor+","+idReceptor+",'"+msg+"')",res);
    }

    public static getChat(req: Request, res: Response){
        let idOne   = req.query.idOne;
        let idTwo   = req.query.idTwo;
        consulta("getChatLog("+idOne+","+idTwo+")",res);
    }

    public  static setDetails(req: Request, res: Response){
        let idUsuario = req.body.idUsuario;
        let det = req.body.det;
        consulta("uDetalles("+idUsuario+",'"+det+"')", res);
    }

    public static changeNick(req: Request, res: Response){
        let idUsuario = req.body.idUsuario;
        let nick = req.body.nick;
        consulta("uNickname("+idUsuario+",'"+nick+"')", res);
    }

    public static checkUsuario(req: Request, res: Response){
        let idUsuario = req.query.idUsuario;
        console.log("checkUsuario("+idUsuario+")");
        consulta("checkUsuario("+idUsuario+")", res);
    }

    public static gameList(req: Request, res: Response){
        let idUsuario = req.query.idUsuario;
        consulta("gameList("+idUsuario+")", res);
    }

    public static gameListFilter(req: Request, res: Response){
        let idUsuario = req.query.idUsuario;
        let filtro = req.query.filtro;
        consulta("gameListFilter("+idUsuario+","+filtro+")", res);
    }

    public static rondaActiva(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        consulta("rondaActiva("+idPartida+")", res);
    }
    public routes(): void{
        this.router.post('/crearUsuario',ControladorPersona.crearUsuario);
        this.router.post('/enviarMsg',ControladorPersona.chat);
        this.router.get('/getChatlog',ControladorPersona.getChat);
        this.router.post('/setDetails',ControladorPersona.setDetails);
        this.router.post('/changeNick',ControladorPersona.changeNick);
        this.router.get('/checkUsuario',ControladorPersona.checkUsuario);
        this.router.get('/gameList',ControladorPersona.gameList);
        this.router.get('/gameListFilter',ControladorPersona.gameListFilter);
        this.router.get('/rondaActiva',ControladorPersona.rondaActiva);
    }
}

const personCTRL = new ControladorPersona();
const router = personCTRL.router;
export default router;