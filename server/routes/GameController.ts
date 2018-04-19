//importar objetos desde express
import {Router, Request, Response} from "express";
import gameModel from './../models/game.model'

let mongoose = require('mongoose');
let async = require('async')
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

class GameController{
    router : Router;
    constructor(){
        this.router = Router();
        this.routes();
    }

    public static finPartida(req: Request, res: Response){
        let idPartida = req.body.idPartida;
        if (idPartida==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("finalizarPartida("+idPartida+")", res);
    }

    public static finRonda(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let ronda=req.body.ronda;
        let idFinalizador = req.body.idFinalizador;
        let razon = req.body.razon;
        if(idPartida==null || ronda==null || idFinalizador==null || razon==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("finalizarRonda("+idPartida+","+ronda+","+idFinalizador+",'"+razon+"')", res);
    }

    public static getRegistro(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        let ronda = req.query.ronda;
        if(idPartida==null ||ronda==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("getChatLog("+idPartida+","+ronda+")",res);
    }

    public static getInfoPartida(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        if(idPartida == null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("getInfoPartida("+idPartida+")",res);
    }

    public static getInfoRonda(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        if(idPartida==null||ronda==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("getInfoRonda("+idPartida+","+ronda+")",res);
    }

    public static getTablero(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        if(idPartida==null ||ronda==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("getTablero("+idPartida+","+ronda+")",res);
    }

    public static jugada(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let fila = req.body.fila;
        let columna = req.body.columna;
        let idJugador = req.body.idJugador;
        if(idPartida==null || fila ==null || columna==null || idJugador==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        async.waterfall([
            function(callback){
                mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
                    mongoose.connection.db.eval("rondaActiva("+idPartida+")")
                    .then(result0 =>{
                        if (!result0.status){res.json(result0);return;}
                        let ronda = result0.data;
                        mongoose.connection.db.eval("getInfoRonda("+idPartida+","+ronda+")")
                            .then(result1 =>{
                                if (!result1.status){res.json(result1);return;}
                                if (result1.data.estado.finalizador!=""){
                                    res.json({status:false,data:"Esta partida está finalizada"});
                                    return;
                                }
                                mongoose.connection.db.eval("getInfoPartida("+idPartida+")")
                                .then(result2 =>{
                                    if (!result2.status){res.json(result2);return;}
                                    let jugadas : Array<Array<any>> = result1.data.jugadas;
                                    let jugador : number;
                                    let contrincante : number;
                                    if (result2.data.usuarios[0][0] == idJugador){
                                        contrincante = result2.data.usuarios[1][0];
                                        jugador=0;}
                                    else if (result2.data.usuarios[1][0] == idJugador){
                                        contrincante = result2.data.usuarios[0][0];
                                        jugador=1;}
                                    else{
                                        jugador=-1;}
                                    callback(null,result1.data.tablero,result2.data.tamano_linea,jugadas.length,jugador, contrincante,result2.data.lastMove,result2.data.nRondas)}).catch(err =>{res.json(err);});
                            }).catch(err =>{res.json({status:false,data:err});})})
                    }).catch(err =>{res.json({status:false,data:err});});
            },
            function(tablero,size,turno : number,jugador,contrincante,lastMove,nRondas,callback){
                console.log("tablero: " + tablero + "\ntamano: " + size + "\nturno: "+ turno + "\njugador: " +jugador);
                let model = new gameModel(tablero,size);
                if (turno%2==jugador){
                    let now = Date();
                    if (lastMove !=null && (Date.parse(now)-Date.parse(lastMove))>300000){
                        consulta("finalizarPartida("+idPartida+")",null);
                        for(let x:number=0;x<nRondas;x++){
                            mongoose.connection.db.eval("getInfoRonda("+idPartida+","+x+")")
                            .then(result =>{
                                if (!result.data.status){res.json(result);return;}
                                if (result.data.estado.finalizador==""){
                                    consulta("finalizarRonda("+idPartida+","+x+",'"+idJugador+"','a')",null);
                                }
                            }).catch(err =>{res.json({status:false,data:err});});
                        }
                        res.json({status:true,data:"a"});
                        return;
                    }
                    let tupla = model.getCellInGrid(columna,jugador);
                    if (tupla !=null){
                        mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
                            mongoose.connection.db.eval("rondaActiva("+idPartida+")").then(result0 =>{
                                if (!result0.status){res.json(result0);return;}
                                let ronda = result0.data;
                                mongoose.connection.db.eval("jugada("+idPartida+","+ronda+","+tupla[0]+","+tupla[1]+","+jugador+")").then(() =>{
                                    let estado = model.isNConnected(tupla[0],tupla[1],jugador);
                                    if (estado !="p"){
                                        if (ronda == nRondas-1)
                                            consulta("finalizarPartida("+idPartida+")",null);
                                        consulta("finalizarRonda("+idPartida+","+ronda+",'"+idJugador+"','"+estado+"')",null)
                                        res.json({status:true,data:estado})
                                    }
                                    else
                                        res.json({status:true,data:"p"});
                                    return;
                                }).catch(err =>{res.json({status:false,data:err});})
                            }).catch(err =>{res.json({status:false,data:err});})
                        }).catch(err =>{res.json({status:false,data:err});})
                    }
                    else
                        res.json({status:false,data:"Jugada no posible"})
                }
                else
                    res.json({status:false,data:"No es tu turno"})
            }
        ])
    }

    public static setTablero(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let ronda=req.body.ronda;
        let tablero=req.body.tablero;
        if(idPartida == null || ronda == null || tablero == null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("setTablero("+idPartida+","+ronda+","+tablero+")",res);
    }

    public static linkUsuario(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let idUsuario=req.body.idUsuario;
        let color=req.body.color;
        if(idPartida==null || idUsuario==null || color == null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("linkUsuarioPartida("+idPartida+",'"+idUsuario+"','"+color+"')",res);
    }

    public static newGame(req: Request, res: Response){
        let idJ1 = req.body.idJ1;
        let color1 = req.body.color1;
        let idJ2 = req.body.idJ2;
        let color2 = req.body.color2;
        let size = req.body.size;
        let lineSize = req.body.lineSize;
        let nRondas = req.body.nRondas;
        if (idJ1 == null || color1 == null || idJ2 == null || color2 == null || size == null || lineSize == null || nRondas==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("nuevaSesion('"+idJ1+"','"+color1+"','"+idJ2+"','"+color2+"',"+size+","+lineSize+","+nRondas+")",res);
    }

    public static update(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        let ronda = req.query.ronda;
        let idJugador = req.query.idJugador;
        if (idPartida ==null || ronda==null ||idJugador==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        mongoose.connect('mongodb://localhost:27017/connect4')
        .then(() =>{
            mongoose.connection.db.eval("getInfoRonda("+idPartida+","+ronda+")")
            .then(result =>{
                if (!result.data.status){res.json(result);return;}
                mongoose.connection.db.eval("getInfoPartida("+idPartida+")")
                .then(result1 =>{
                    if (!result1.status){res.json(result1);return;}
                    if (result.data.estado.causa!=""){
                        console.log({status:true,data:{"tablero":result.data.tablero,"estado":result.data.estado,"turno":-1}})
                        res.json({status:true,data:{"tablero":result.data.tablero,"estado":result.data.estado,"turno":-1}});
                    }
                    else
                    {
                        let jugadas : Array<Array<any>> = result.data.jugadas;
                        let jugador : number;
                        let turno = jugadas.length%2;
                        if (result1.data.usuarios[0][0] == idJugador){
                            jugador=0;}
                        else if (result1.data.usuarios[1][0] == idJugador){
                            jugador=1;}
                        else{
                            jugador=-1;}
                        let tuTurno = jugadas.length%2==jugador?1:jugador==-1?-1:0;
                        let now = Date();
                        if (result1.data.lastMove !=null && result.data.estado.finalizador=="" && (Date.parse(now)-Date.parse(result1.data.lastMove))>300000){
                            mongoose.connection.db.eval("finalizarPartida("+idPartida+")")
                                .then(result3 =>{
                                    if (!result3.status){res.json(result3);return;}
                                    let finalizador = result.data.data[tuTurno==1?jugador:Math.abs(jugador-1)][0];
                                    for(let x:number=0;x<result1.data.nRondas;x++){
                                        mongoose.connection.db.eval("getInfoRonda("+idPartida+","+x+")")
                                        .then(result4 =>{
                                            if (!result4.status){res.json(result4);return;}
                                            if (result4.data.estado.finalizador==""){
                                                mongoose.connection.db.eval("finalizarRonda("+idPartida+","+x+","+finalizador+",'a')")
                                            }
                                        }).catch(err =>{res.json({status:false,data:err});});
                                    }
                                    console.log({status:true,data:{tablero:result.data.tablero,estado:{finalizador:finalizador,causa:"a"},turno:-1}})
                                    res.json({status:true,data:{tablero:result.data.tablero,estado:{finalizador:finalizador,causa:"a"},turno:-1}});
                                    return;
                                }).catch(err =>{res.json({status:false,data:err});});
                        }
                        else if((result1.data.usuarios[turno][0]=="e" || result1.data.usuarios[turno][0]=="m" || result1.data.usuarios[turno][0]=="h")){
                            let level = result1.data.usuarios[turno][0]=="e"?1:result1.data.usuarios[turno][0]=="m"?2:3;
                            let botGame : gameModel =  new gameModel(result.data.tablero, result1.data.tamano_linea);
                            let resul = botGame.AIMove(level,turno);
                            mongoose.connect('mongodb://localhost:27017/connect4')
                                .then(() =>{
                                    mongoose.connection.db.eval("jugada("+idPartida+","+ronda+","+resul[0][0]+","+resul[0][1]+","+turno+")").then(() =>{
                                        console.log({status:true,data:{tablero:botGame.charGrid,estado:{finalizador: resul[1]=="p"?"":result1.data.usuarios[turno][0],causa:resul[1]=="p"?"":resul[1]},turno:-1}})
                                        res.json({status:true,data:{tablero:botGame.charGrid,estado:{finalizador: resul[1]=="p"?"":result1.data.usuarios[turno][0],causa:resul[1]=="p"?"":resul[1]},turno:-1}})
                                        if (resul[1]!="p")
                                            mongoose.connection.db.eval("finalizarRonda("+idPartida+","+ronda+",'"+result1.data.usuarios[turno][0]+"','"+resul[1]+"')")
                                    }).catch(err =>{res.json({status:false,data:err});});
                                    
                                }).catch(err =>{res.json({status:false,data:err});});
                            }
                        else
                            console.log({status:true,data:{tablero:result.data.tablero,estado:{finalizador:"",causa:""},turno:tuTurno}})
                            res.json({status:true,data:{tablero:result.data.tablero,estado:{finalizador:"",causa:""},turno:tuTurno}});
                    }
                        result.data.tablero.forEach(element => {
                            console.log(element);
                    });
                }).catch(err =>{res.json({status:false,data:err});})
            }).catch(err =>{res.json({status:false,data:err});})
        }).catch(err =>{res.json({status:false,data:err});})
    }

    public static start(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        if (idPartida==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        mongoose.connect('mongodb://localhost:27017/connect4')
        .then(() =>{
            mongoose.connection.db.eval("getInfoPartida("+idPartida+")")
            .then(result0 =>{
                if (!result0.status){res.json(result0);return;}
                mongoose.connection.db.eval("rondaActiva("+idPartida+")")
                .then(result1 =>{
                    if (!result1.status){res.json(result1);return;}
                    let ronda = result1.data;
                    mongoose.connection.db.eval("getInfoRonda("+idPartida+","+ronda+")")
                    .then(result2 =>{
                        if (!result2.status){res.json(result2);return;}
                        let ronda = result1.data;
                        res.json({status:true,data:{"tamano":result0.data.tamano,"tamano_linea":result0.data.tamano_linea,"usuarios":result0.data.usuarios,"tablero":result2.data.tablero,"estado":result2.data.estado,"ronda":ronda}});
                    }).catch(err =>{res.json({status:false,data:err});});
                }).catch(err =>{res.json({status:false,data:err});});
            }).catch(err =>{res.json({status:false,data:err});});
        }).catch(err =>{res.json({status:false,data:err});});
    }
    public static abandono(req: Request, res: Response){
        let idPartida = req.body.idPartida;
        let idJugador = req.body.idJugador;
        if (idPartida==null || idJugador==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        mongoose.connect('mongodb://localhost:27017/connect4')
        .then(() =>{
            mongoose.connection.db.eval("getInfoPartida("+idPartida+")")
            .then(result0 =>{
                if (!result0.status){res.json(result0);return;}
                if ((result0.data.usuarios[0][0] != idJugador && result0.data.usuarios[1][0] != idJugador) || result0.data.estado==false){
                    res.json({status:false,data:"La partida está inactiva o no admite a este jugador"});
                }
                else
                    mongoose.connection.db.eval("rondaActiva("+idPartida+")")
                    .then(result1 =>{
                        if (!result1.status){res.json(result1);return;}
                        let ronda = result1.data;
                        for(let x=ronda;x<result0.data.nRondas;x++){
                            consulta("finalizarRonda("+idPartida+","+x+",'"+idJugador+"','a')",null);
                        }
                        consulta("finalizarPartida("+idPartida+")",null);
                    }).catch(err =>{res.json({status:false,data:err});});
                    res.json({status:true,data:"Success!"});
            }).catch(err =>{res.json({status:false,data:err});});
        }).catch(err =>{res.json({status:false,data:err});});
    }

    public static disponibles(req: Request, res: Response){
        let page = req.query.page;
        if (page ==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("disponibles("+page+")", res);
    }

    public routes(): void{
        //GET
        this.router.get('/update',GameController.update);
        this.router.get('/getGamelog',GameController.getRegistro);
        this.router.get('/getInfoPartida',GameController.getInfoPartida);
        this.router.get('/getInfoRonda',GameController.getInfoRonda);
        this.router.get('/getTablero',GameController.getTablero);
        this.router.get('/start',GameController.start);
        this.router.get('/disponibles',GameController.disponibles);
        //POST
        this.router.post('/finPartida',GameController.finPartida);
        this.router.post('/setTablero',GameController.setTablero);
        this.router.post('/jugada',GameController.jugada);
        this.router.post('/linkUsuarioPartida',GameController.linkUsuario);
        this.router.post('/nuevaSesion',GameController.newGame);
        this.router.post('/finRonda',GameController.finRonda);
        this.router.post('/abandono',GameController.abandono);
    }
}

const gameCTRL = new GameController();
const router = gameCTRL.router;
export default router;