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
        let idUsuario = req.query.idUsuario;
        let nick = req.query.nick;
        let det = req.query.det;
        consulta("cUsuario("+idUsuario+",'"+nick+"','"+det+"')",res);
    }

    public static chat(req: Request, res: Response){
        let idEmisor    = req.query.idEmisor;
        let idReceptor  = req.query.idReceptor;
        let msg         = req.query.msg;
        consulta("chat("+idEmisor+","+idReceptor+",'"+msg+"')",res);
    }

    public static getChat(req: Request, res: Response){
        let idOne   = req.query.idOne;
        let idTwo   = req.query.idTwo;
        consulta("getChatLog("+idOne+","+idTwo+")",res);
    }

    public  static setDetails(req: Request, res: Response){
        let idUsuario = req.query.idUsuario;
        let det = req.query.det;
        consulta("uDetalles("+idUsuario+",'"+det+"')", res);
    }

    public static changeNick(req: Request, res: Response){
        let idUsuario = req.query.idUsuario;
        let nick = req.query.nick;
        consulta("uNickname("+idUsuario+",'"+nick+"')", res);
    }
    public routes(): void{
        this.router.post('/crearUsuario',ControladorPersona.crearUsuario);
        this.router.post('/enviarMsg',ControladorPersona.chat);
        this.router.get('/getChatlog',ControladorPersona.getChat);
        this.router.post('/setDetails',ControladorPersona.setDetails);
        this.router.post('/changeNick',ControladorPersona.changeNick);
    }
}

const personCTRL = new ControladorPersona();
const router = personCTRL.router;
export default router;