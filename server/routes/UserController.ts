//importar objetos desde express
import {Router, Request, Response} from "express";

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/connect4');


function consulta(query: string, res: Response) {
    mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
        mongoose.connection.db.eval(query)
            .then(result =>{
                if (res!=null)
                    res.json(result);
        })
            .catch(err =>{
                if (res!=null)
                    res.json({status:false,data:"Error al realizar la consulta a Mongo"});
        });

    })
    .catch(() => {res.json({status:false,data:"Error de conexion"})});
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
        consulta("chat('"+idEmisor+"','"+idReceptor+"','"+msg+"')",res);
    }

    public static getChat(req: Request, res: Response){
        let idOne   = req.query.idOne;
        let idTwo   = req.query.idTwo;
        if(idOne==null || idTwo==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
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
        mongoose.connect('mongodb://localhost:27017/connect4')
        .then(() =>{
            mongoose.connection.db.eval("gameListFilter('"+idUsuario+"',"+filtro+")")
            .then(result0 =>{
                if (!result0.status){res.json(result0);return;}
                let lista:Array<any> = result0.data
                if(result0.data[0] ==null)
                    res.json(result0);
                else{
                    let contador=lista.length;
                    let data = [];
                    for(let x = 0;x<lista.length;x++)
                        mongoose.connection.db.eval("getInfoPartida("+lista[x]+")").then(result1 =>{
                            if (!result1.status){res.json(result1);return;}
                            mongoose.connection.db.eval("checkUsuario('"+result1.data.usuarios[0][0]+"')").then(user0 =>{
                                if (!user0.status){res.json(user0);return;}
                                mongoose.connection.db.eval("checkUsuario('"+result1.data.usuarios[1][0]+"')").then(user1 =>{
                                    if (!user1.status){res.json(user1);return;}
                                    data[x]={"id_partida":lista[x],"Jugador_1":user0.data,"colors":[result1.data.usuarios[0][1],result1.data.usuarios[1][1]],"Jugador_2":user1.data,"tamano":result1.data.tamano,"linea":result1.data.tamano_linea,"ronda":result1.data.nRondas}
                                    contador=contador-1;
                                    if (contador ==0)
                                        res.json({status:true,data:data})
                                }).catch(err =>{res.json({status:false,data:err});})
                            }).catch(err =>{res.json({status:false,data:err});})
                        }).catch(err =>{res.json({status:false,data:err});})
                }
            }).catch(err =>{res.json({status:false,data:err});})
        }).catch(err =>{res.json({status:false,data:err});})
    }

    public static rondaActiva(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        if (idPartida==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("rondaActiva("+idPartida+")", res);
    }

    public static friendList(req: Request, res: Response){
        let idUsuario = req.query.idUsuario;
        if(idUsuario==null ||page==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("friendList('"+idUsuario+"',"+page+")", res);
    }

    public static friend(req: Request, res: Response){
        let id1 = req.query.id1;
        let id2 = req.query.id2;
        if(id1==null||id2==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("friend('"+id1+"','"+id2+"')", res);
    }

    public static invitar(req: Request, res: Response){
        if (req.body.idAnfitrion == null || req.body.color==null || req.body.IDinvitado == null || req.body.tamano ==null || req.body.tamano_linea==null || req.body.nRondas==null)
        {res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        console.log("invitar('"+req.body.idAnfitrion+"','"+req.body.color+"','"+req.body.IDinvitado+"',"
        +req.body.tamano+","+req.body.tamano_linea+","+req.body.nRondas+")")
        consulta("invitar('"+req.body.idAnfitrion+"','"+req.body.color+"','"+req.body.IDinvitado+"',"
        +req.body.tamano+","+req.body.tamano_linea+","+req.body.nRondas+")", res);
    }

    public static aceptar(req: Request, res: Response){
        let idUsuario = req.body.idUsuario;
        let color = req.body.color;
        let idAnfitrion = req.body.idAnfitrion;
        if(idUsuario==null||color==null||idAnfitrion==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        mongoose.connect('mongodb://localhost:27017/connect4')
        .then(() =>{
            mongoose.connection.db.eval("aceptar('"+idAnfitrion+"','"+idUsuario+"')")
            .then(result =>{
                if (!result.status){res.json(result);return;}
                consulta("nuevaSesion('"+result.data.anfitrion+"','"+result.data.color+"','"+idUsuario+"','"+color+"',"+result.data.tamano+","+result.data.tamano_linea+","+result.data.nRondas+")",res)
            }).catch(() => res.json({status:false,data:"Error al aceptar invitación"}))
        }).catch(() => res.json({status:false,data:"Error de conexión"}))
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
        this.router.get('/friendList',ControladorPersona.friendList);
        this.router.get('/invitaciones',ControladorPersona.invitaciones);
    }
}

const personCTRL = new ControladorPersona();
const router = personCTRL.router;
export default router;