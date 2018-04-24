//importar objetos desde express
import {Router, Request, Response} from "express";
//importar modelo de tablero de juego
import gameModel from './../models/game.model'

let mongoose = require('mongoose');
let async = require('async')
//conecta el backend a la base de datos
conectar();
function conectar(){
    mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
        console.log("conexion realizada")
        return true
    }).catch(() =>{
        return false
    })
    return false
}
//comprueba que la conexión está activa, y trata de solucionar problemas
function checkConnection(){
    if(mongoose.connection.readyState!=1){
        return conectar()
    }
    else
        return true

}
//ejecuta una función almacenada en la base de datos
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

//maneja errores de conexión a la base de datos
function resConnectionError(res: Response){
    res.json({status:false,data:"Error al realizar la consulta a Mongo, intente de nuevo más tarde"})
}

//api relacionada a juegos
class GameController{
    router : Router;
    constructor(){
        this.router = Router();
        this.routes();
    }
    //funciones asignadas a las rutas
    //finaliza una partida
    public static finPartida(req: Request, res: Response){
        let idPartida = req.body.idPartida;
        if (idPartida==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("finalizarPartida("+idPartida+")", res);
    }

    //finaliza una ronda
    public static finRonda(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let ronda=req.body.ronda;
        let idFinalizador = req.body.idFinalizador;
        let razon = req.body.razon;
        if(idPartida==null || ronda==null || idFinalizador==null || razon==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("finalizarRonda("+idPartida+","+ronda+","+idFinalizador+",'"+razon+"')", res);
    }
    
    //obtiene la información de la partida
    public static getInfoPartida(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        if(idPartida == null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("getInfoPartida("+idPartida+")",res);
    }

    //obtiene los detalles de la ronda
    public static getInfoRonda(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        if(idPartida==null||ronda==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("getInfoRonda("+idPartida+","+ronda+")",res);
    }

    //obtiene el tablero de una ronda
    public static getTablero(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        if(idPartida==null ||ronda==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("getTablero("+idPartida+","+ronda+")",res);
    }

    //hace una jugada en una ronda
    public static jugada(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let fila = req.body.fila;
        let columna = req.body.columna;
        let idJugador = req.body.idJugador;
        if(idPartida==null || fila ==null || columna==null || idJugador==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        async.waterfall([
            function(callback){
                if (!checkConnection()){
                    resConnectionError(res);
                    return
                }
                //obtiene todos los detalles importantes de la ronda actual
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
                            callback(null,result1.data.tablero,result2.data.tamano_linea,jugadas.length,jugador, contrincante,result2.data.lastMove,result2.data.nRondas)
                        }).catch(err =>{res.json({status:false,data:err});});
                    }).catch(err =>{res.json({status:false,data:err});})
                }).catch(err =>{res.json({status:false,data:err});})
            },
            //funcion que se encarga de evaluar, realizar y comprobar la jugada
            function(tablero,size,turno : number,jugador,contrincante,lastMove,nRondas,callback){
                console.log("tablero: " + tablero + "\ntamano: " + size + "\nturno: "+ turno + "\njugador: " +jugador);
                //declara un tablero con los datos obtenidos de la base de datos
                let model = new gameModel(tablero,size);
                if (turno%2==jugador){
                    let now = Date();
                    if (lastMove !=null && (Date.parse(now)-Date.parse(lastMove))>300000){
                        consulta("finalizarPartida("+idPartida+")",null);
                        for(let x:number=0;x<nRondas;x++){
                            mongoose.connection.db.eval("getInfoRonda("+idPartida+","+x+")")
                            .then(result =>{
                                if (!result.status){res.json(result);return;}
                                if (result.data.estado.finalizador==""){
                                    consulta("finalizarRonda("+idPartida+","+x+",'"+idJugador+"','a')",null);
                                }
                            }).catch(err =>{res.json({status:false,data:err});});
                        }
                        res.json({status:true,data:"a"});
                        return;
                    }
                    //obtiene la tupla donde queda la ficha y comprueba el estado del juego, realiza la jugada en la base de datos
                    let tupla = model.getCellInGrid(columna,jugador);
                    if (tupla !=null){
                        if (!checkConnection()){
                            resConnectionError(res);
                            return
                        }
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
                    }
                    else
                        res.json({status:false,data:"Jugada no posible"})
                }
                else
                    res.json({status:false,data:"No es tu turno"})
            }
        ])
    }

    //sobreescribe el tablero de una ronda
    public static setTablero(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let ronda=req.body.ronda;
        let tablero=req.body.tablero;
        if(idPartida == null || ronda == null || tablero == null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("setTablero("+idPartida+","+ronda+","+tablero+")",res);
    }

    //añade un jugador a una partida vacía
    public static linkUsuario(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let idUsuario=req.body.idUsuario;
        let color=req.body.color;
        if(idPartida==null || idUsuario==null || color == null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("linkUsuarioPartida("+idPartida+",'"+idUsuario+"','"+color+"')",res);
    }

    //crea un nuevo juego
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

    //obtiene detalles de la ronda solicitada, realiza jugadas de bots si es el turno de un robot
    public static update(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        let ronda = req.query.ronda;
        let idJugador = req.query.idJugador;
        let moveFlag = req.query.moveFlag;
        if (idPartida ==null || ronda==null ||idJugador==null || moveFlag==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        if (!checkConnection()){
            resConnectionError(res);
            return
        }
        mongoose.connection.db.eval("update("+idPartida+","+ronda+",'"+idJugador+"')")
        .then(result =>{
            if (!result.status){res.json(result);return;}
            if (result.data.estado.causa!=""){
                res.json({status:true,data:{"tablero":result.data.tablero,"estado":result.data.estado,"turno":-1}});
            }
            else
            {
                let jugadas : Array<Array<any>> = result.data.jugadas;
                let jugador : number;
                let turno = jugadas.length%2;
                if (result.data.usuarios[0][0] == idJugador){
                    jugador=0;}
                else if (result.data.usuarios[1][0] == idJugador){
                    jugador=1;}
                else{
                    jugador=-1;}
                let tuTurno = jugadas.length%2==jugador?1:jugador==-1?-1:0;
                let now = Date();
                if (result.data.lastMove !=null && result.data.estado.finalizador=="" && (Date.parse(now)-Date.parse(result.data.lastMove))>300000){
                    consulta("finalizarPartida("+idPartida+")",null);
                    let finalizador = result.data.usuarios[tuTurno==1?jugador:Math.abs(jugador-1)][0];
                    for(let x:number=0;x<result.data.nRondas;x++){
                        mongoose.connection.db.eval("getInfoRonda("+idPartida+","+x+")")
                        .then(rounData =>{
                            if (!rounData.status){res.json(rounData);return;}
                            if (rounData.data.estado.finalizador==""){
                                consulta("finalizarRonda("+idPartida+","+x+","+finalizador+",'a')",null)
                            }
                        }).catch(err =>{res.json({status:false,data:err});});
                    }
                    res.json({status:true,data:{tablero:result.data.tablero,estado:{finalizador:finalizador,causa:"a"},turno:-1}});
                    return;
                }
                //comprueba si es necesario que un robot haga una jugada
                else if((result.data.usuarios[turno][0]=="e" || result.data.usuarios[turno][0]=="m" || result.data.usuarios[turno][0]=="h") && moveFlag == "false"){
                    let level = result.data.usuarios[turno][0]=="e"?1:result.data.usuarios[turno][0]=="m"?2:3;
                    let botGame : gameModel =  new gameModel(result.data.tablero, result.data.tamano_linea);
                    let resul = botGame.AIMove(level,turno);
                    if (!checkConnection()){
                        resConnectionError(res);
                        return
                    }
                        mongoose.connection.db.eval("jugada("+idPartida+","+ronda+","+resul[0][0]+","+resul[0][1]+","+turno+")").then(moveOk =>{
                            if (!moveOk.status){res.json({status:true,data:{"tablero":result.data.tablero,"estado":result.data.estado,"turno":-1}});
                            return;}
                            res.json({status:true,data:{tablero:botGame.charGrid,estado:{finalizador: resul[1]=="p"?"":result.data.usuarios[turno][0],causa:resul[1]=="p"?"":resul[1]},turno:-1}})
                            if (resul[1]!="p")
                                mongoose.connection.db.eval("finalizarRonda("+idPartida+","+ronda+",'"+result.data.usuarios[turno][0]+"','"+resul[1]+"')")
                        }).catch(err =>{res.json({status:false,data:err});});
                    }
                else
                    res.json({status:true,data:{tablero:result.data.tablero,estado:{finalizador:"",causa:""},turno:tuTurno}});
            }
        }).catch(err =>{res.json({status:false,data:err});})
    }

    //obtiene todos los datos necesarios para cargar una partida en el frontend
    public static start(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        if (idPartida==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        if (!checkConnection()){
            res.json({status:false,data:"Error al realizar la consulta a Mongo!"});
            return
        }
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
    }

    //abandona una partida completa
    public static abandono(req: Request, res: Response){
        let idPartida = req.body.idPartida;
        let idJugador = req.body.idJugador;
        if (idPartida==null || idJugador==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        if (!checkConnection()){
            resConnectionError(res);
            return
        }
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
    }

    //muestra una lista de partidas disponibles
    public static disponibles(req: Request, res: Response){
        let page = req.query.page;
        if (page ==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("disponibles("+page+")", res);
    }

    //recibe un tablero, coordenadas y turno de juego; realiza la jugada y devuelve el nuevo tablero
    public static drawMove(req: Request, res: Response){
        try{
            if (req.query.tablero ==null || req.query.jugada==null || req.query.turno==null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
            let tablero : Array<Array<number>> = typeof req.query.tablero === "object"?req.query.tablero:JSON.parse(req.query.tablero);
            let jugada = typeof req.query.jugada==="object"?req.query.jugada:JSON.parse(req.query.jugada);
            let turno = req.query.turno;
            let template = new gameModel(tablero,0)
            template.getCellInGrid(jugada[1],turno%2)
            res.json({status:true,data:template.charGrid})
        }
        catch(e){
            res.json({status:false,data:"drawMove error"})
        }
    }
    //retorna la lista de jugadas realizadas en un tablero
    public static jugadas(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        if(idPartida == null || ronda == null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        consulta("jugadas("+idPartida+","+ronda+")",res);
    }
    //retorna un comentario agradable acerca del estado actual de una ronda
    public static estadoAvanzado(req: Request, res: Response){
        let idPartida=req.query.idPartida;
        let ronda=req.query.ronda;
        if(idPartida == null || ronda == null){res.json({status:false,data:"Error de consulta: no se ha recibido uno de los parametros"});return}
        if (!checkConnection()){
            resConnectionError(res);
            return
        }
        mongoose.connection.db.eval("estadoAvanzado("+idPartida+","+ronda+")").then(result0 =>{
            if (!result0.status){res.json(result0);return;}
            mongoose.connection.db.eval("checkUsuario('"+result0.data.finalizador+"')").then(result1 =>{
                if (!result1.status){res.json(result1);return;}
                if(result0.data.causa=="a")
                    res.json({status:true,data:result1.data.nickname+ " ha abandonado la partida"})
                else if (result0.data.causa=="w")
                    res.json({status:true,data:result1.data.nickname+ " ha ganado la ronda"})
                else if (result0.data.causa=="t")
                    res.json({status:true,data:result1.data.nickname+ " ha empatado la ronda"})
                else
                    res.json({status:true,data:"Esta partida sigue en curso"})
            });
        });
    }

    //declaración de rutas y metodos
    public routes(): void{
        //GET
        this.router.get('/update',GameController.update);
        this.router.get('/getInfoPartida',GameController.getInfoPartida);
        this.router.get('/getInfoRonda',GameController.getInfoRonda);
        this.router.get('/getTablero',GameController.getTablero);
        this.router.get('/start',GameController.start);
        this.router.get('/disponibles',GameController.disponibles);
        this.router.get('/drawMove',GameController.drawMove);
        this.router.get('/jugadas',GameController.jugadas);
        this.router.get('/estadoAvanzado',GameController.estadoAvanzado);
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
//retorno del enrutador
const gameCTRL = new GameController();
const router = gameCTRL.router;
export default router;