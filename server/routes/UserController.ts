//importar objetos desde express
import {Router, Request, Response} from "express";

const mongoose = require('mongoose');

conectar()
function conectar(){
    mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
        console.log("conexion realizada")
        return true
    }).catch(() =>{
        return false
    })
    return false
}
function checkConnection(){
    if(mongoose.connection.readyState!=1){
        return conectar()
    }
    else
        return true

}
function consulta(query: string, res: Response) {
    if (!checkConnection()){
        resConnectionError(res);
        return
    }
    else{
        mongoose.connection.db.eval(query)
            .then(result =>{
                if (res!=null)
                    res.json(result);
        })
            .catch(err =>{
                resConnectionError(res);
        });
    }
}
function resConnectionError(res: Response){
    res.json({status:false,data:"Error al realizar la consulta a Mongo, intente de nuevo más tarde"})
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
        if(idUsuario == null || nick == null || det == null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("cUsuario('"+idUsuario+"','"+nick+"','"+det+"')",res);
    }

    public static chat(req: Request, res: Response){
        let idEmisor    = req.body.idEmisor;
        let idReceptor  = req.body.idReceptor;
        let msg         = req.body.msg;
        if (idEmisor==null || idReceptor==null||msg==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        if(idReceptor==""){res.json({status:false,data:"No hay nadie con quién hablar aquí..."});return}
        if(idReceptor=="e" || idReceptor=="m" ||idReceptor=="h"){res.json({status:false,data:"Los robots no hablan mucho...."});return}
        consulta("chat('"+idEmisor+"','"+idReceptor+"','"+msg+"')",res);
    }

    public static getChat(req: Request, res: Response){
        let idOne   = req.query.idOne;
        let idTwo   = req.query.idTwo;
        if(idOne==null || idTwo==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        if(idOne=="" || idTwo==""){res.json({status:true,data:[[true,"Este chat no está conectado a otros jugadores"]]});return}
        if(idTwo=="e" || idTwo=="m" ||idTwo=="h"){res.json({status:true,data:[[true,"Jugando contra bot"]]});return}
        consulta("getChatLog('"+idOne+"','"+idTwo+"')",res);
    }

    public  static setDetails(req: Request, res: Response){
        let idUsuario = req.body.idUsuario;
        let det = req.body.det;
        if (idUsuario==null || det==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("uDetalles('"+idUsuario+"','"+det+"')", res);
    }

    public static changeNick(req: Request, res: Response){
        let idUsuario = req.body.idUsuario;
        let nick = req.body.nick;
        if(idUsuario==null || nick ==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("uNickname('"+idUsuario+"','"+nick+"')", res);
    }

    public static checkUsuario(req: Request, res: Response){
        let idUsuario = req.query.idUsuario;
        if(idUsuario==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("checkUsuario('"+idUsuario+"')", res);
    }

    public static checkNick(req: Request, res: Response){
        let nick = req.query.nick;
        if (nick==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("checkNick('"+nick+"')", res);
    }

    public static gameListFilter(req: Request, res: Response){
        let idUsuario = req.query.idUsuario;
        let filtro = req.query.filtro;
        if (idUsuario==null || filtro==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("gameListFilter('"+idUsuario+"',"+filtro+")",res)
    }

    public static rondaActiva(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        if (idPartida==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("rondaActiva("+idPartida+")", res);
    }

    public static friendListFilter(req: Request, res: Response){
        let idUsuario = req.query.idUsuario;
        let filtro = req.query.filtro;
        if(idUsuario==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("friendListFilter('"+idUsuario+"',"+filtro+")", res);
    }

    public static friend(req: Request, res: Response){
        let id1 = req.body.id1;
        let id2 = req.body.id2;
        if(id1==null||id2==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("friend('"+id1+"','"+id2+"')", res);
    }

    public static invitar(req: Request, res: Response){
        if (req.body.idAnfitrion == null || req.body.color==null || req.body.idInvitado == null || req.body.tamano ==null || req.body.tamano_linea==null || req.body.nRondas==null)
        {res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        console.log("invitar('"+req.body.idAnfitrion+"','"+req.body.color+"','"+req.body.idInvitado+"',"
        +req.body.tamano+","+req.body.tamano_linea+","+req.body.nRondas+")")
        consulta("invitar('"+req.body.idAnfitrion+"','"+req.body.color+"','"+req.body.idInvitado+"',"
        +req.body.tamano+","+req.body.tamano_linea+","+req.body.nRondas+")", res);
    }

    public static aceptar(req: Request, res: Response){
        let idUsuario = req.body.idUsuario;
        let color = req.body.color;
        let idAnfitrion = req.body.idAnfitrion;
        console.log(`${idUsuario} ${color} ${idAnfitrion}`)
        if(idUsuario==null||color==null||idAnfitrion==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        if (!checkConnection()){
            resConnectionError(res);
            return
        }
        mongoose.connection.db.eval("aceptar('"+idAnfitrion+"','"+idUsuario+"')")
        .then(result =>{
            if (!result.status){res.json(result);return;}{
                console.log("nuevaSesion('"+result.data.idAnfitrion+"','"
                +result.data.color+"','"+idUsuario+"','"+color+"',"+
                result.data.tamano+","+result.data.tamano_linea+","+result.data.nRondas+")")
                mongoose.connection.db.eval("nuevaSesion('"+result.data.idAnfitrion+"','"
                +result.data.color+"','"+idUsuario+"','"+color+"',"+
                result.data.tamano+","+result.data.tamano_linea+","+result.data.nRondas+")").then(result1 =>{
                    if (result1.status)
                        res.json({status:true,data:"Has aceptado y creado la partida correctamente"})
                    else
                        res.json({status:false,data:"Has aceptado la partida, pero ocurrió un error al crearla: " + result1.data})
                }).catch(()=>{res.json({status:true,data:"Has aceptado la partida, pero ocurrió un error al crearla"})})
            }
        }).catch(() => res.json({status:false,data:"Error al aceptar invitación"}))
    }

    public static rechazar(req: Request, res: Response){
        let idUsuario = req.body.idUsuario;
        let idAnfitrion = req.body.idAnfitrion;
        if(idUsuario==null||idAnfitrion==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("rechazar('"+idAnfitrion+"','"+idUsuario+"')", res);
    }

    public static invitaciones(req: Request, res: Response){
        let idUsuario = req.query.idUsuario;
        let page = req.query.page;
        if(idUsuario==null || page==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("invitaciones('"+idUsuario+"',"+page+")", res);
    }


    public routes(): void{
        //POST
        this.router.post('/crearUsuario',ControladorPersona.crearUsuario);
        this.router.post('/enviarMsg',ControladorPersona.chat);
        this.router.post('/setDetails',ControladorPersona.setDetails);
        this.router.post('/changeNick',ControladorPersona.changeNick);
        this.router.post('/friend',ControladorPersona.friend);
        this.router.post('/invitar',ControladorPersona.invitar);
        this.router.post('/aceptar',ControladorPersona.aceptar);
        this.router.post('/rechazar',ControladorPersona.rechazar);
        //GET
        this.router.get('/getChatlog',ControladorPersona.getChat);
        this.router.get('/checkUsuario',ControladorPersona.checkUsuario);
        this.router.get('/checkNick',ControladorPersona.checkNick);
        this.router.get('/gameListFilter',ControladorPersona.gameListFilter);
        this.router.get('/rondaActiva',ControladorPersona.rondaActiva);
        this.router.get('/friendListFilter',ControladorPersona.friendListFilter);
        this.router.get('/invitaciones',ControladorPersona.invitaciones);
    }
}

const personCTRL = new ControladorPersona();
const router = personCTRL.router;
export default router;