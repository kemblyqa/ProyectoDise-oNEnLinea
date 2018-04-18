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
        let idPartida = req.body.idPartida;
        consulta("finalizarPartida("+idPartida+")", res);
    }

    public static finRonda(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let ronda=req.body.ronda;
        let idFinalizador = req.body.idFinalizador;
        let razon = req.body.razon;
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
        let idPartida=req.body.idPartida;
        let fila = req.body.fila;
        let columna = req.body.columna;
        let idJugador = req.body.idJugador;
        async.waterfall([
            function(callback){
                mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
                    mongoose.connection.db.eval("rondaActiva("+idPartida+")")
                    .then(result0 =>{
                        let ronda = result0;
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
                                    let contrincante : number;
                                    if (result2.usuarios[0][0] == idJugador){
                                        contrincante = result2.usuarios[1][0];
                                        jugador=0;}
                                    else if (result2.usuarios[1][0] == idJugador){
                                        contrincante = result2.usuarios[0][0];
                                        jugador=1;}
                                    else{
                                        jugador=-1;}
                                    callback(null,result1.tablero,result2.tamano_linea,jugadas.length,jugador, contrincante,result2.lastMove,result2.nRondas)})
                                .catch(err =>{
                                    res.json(err);});
                            })
                            .catch(err =>{
                                res.json(err);})
                                })
                    })
                    .catch(err =>{
                        res.json(err);});
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
                                if (result.estado.finalizador==""){
                                    consulta("finalizarRonda("+idPartida+","+x+",'"+idJugador+"','a')",null);
                                }
                            });
                        }
                        res.json("a");
                        return;
                    }
                    let tupla = model.getCellInGrid(columna,jugador);
                    if (tupla !=null){
                        mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
                            mongoose.connection.db.eval("rondaActiva("+idPartida+")").then(result0 =>{
                                let ronda = result0;
                                mongoose.connection.db.eval("jugada("+idPartida+","+ronda+","+tupla[0]+","+tupla[1]+","+jugador+")").then(() =>{
                                    let estado = model.isNConnected(tupla[0],tupla[1],jugador);
                                    if (estado !="p"){
                                        if (ronda == nRondas-1)
                                            consulta("finalizarPartida("+idPartida+")",null);
                                        consulta("finalizarRonda("+idPartida+","+ronda+",'"+idJugador+"','"+estado+"')",null)
                                        res.json(estado)
                                    }
                                    else
                                        res.json("p");
                                    return;
                                })
                            })
                        })
                    }
                    else
                        res.json(false)
                }
                else
                    res.json(false)
            }
        ])
    }

    public static setTablero(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let ronda=req.body.ronda;
        let tablero=req.body.tablero;
        consulta("setTablero("+idPartida+","+ronda+","+tablero+")",res);
    }

    public static linkUsuario(req: Request, res: Response){
        let idPartida=req.body.idPartida;
        let idUsuario=req.body.idUsuario;
        let color=req.body.color;
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
        consulta("nuevaSesion('"+idJ1+"','"+color1+"','"+idJ2+"','"+color2+"',"+size+","+lineSize+","+nRondas+")",res);
    }

    public static update(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        let ronda = req.query.ronda;
        let idJugador = req.query.idJugador;
        mongoose.connect('mongodb://localhost:27017/connect4')
        .then(() =>{
            mongoose.connection.db.eval("getInfoRonda("+idPartida+","+ronda+")")
            .then(result =>{
                mongoose.connection.db.eval("getInfoPartida("+idPartida+")")
                .then(result1 =>{
                    if (result.estado.causa!=""){
                        res.json({"tablero":result.tablero,"estado":result.estado,"turno":-1});
                    }
                    else
                    {
                        let jugadas : Array<Array<any>> = result.jugadas;
                        let jugador : number;
                        let turno = jugadas.length%2;
                        if (result1.usuarios[0][0] == idJugador){
                            jugador=0;}
                        else if (result1.usuarios[1][0] == idJugador){
                            jugador=1;}
                        else{
                            jugador=-1;}
                        let tuTurno = jugadas.length%2==jugador?1:jugador==-1?-1:0;
                        let now = Date();
                        if (result1.lastMove !=null && result.estado.finalizador=="" && (Date.parse(now)-Date.parse(result1.lastMove))>300000){
                            mongoose.connection.db.eval("finalizarPartida("+idPartida+")")
                                .then(result3 =>{
                                    let finalizador = result[tuTurno==1?jugador:Math.abs(jugador-1)][0];
                                    for(let x:number=0;x<result1.nRondas;x++){
                                        mongoose.connection.db.eval("getInfoRonda("+idPartida+","+x+")")
                                        .then(result4 =>{
                                            if (result4.estado.finalizador==""){
                                                mongoose.connection.db.eval("finalizarRonda("+idPartida+","+x+","+finalizador+",'a')")
                                            }
                                        });
                                    }
                                    res.json({"tablero":result.tablero,"estado":{"finalizador":finalizador,"causa":"a"},"turno":-1});
                                    return;
                                });
                        }
                        else if((result1.usuarios[turno][0]=="e" || result1.usuarios[turno][0]=="m" || result1.usuarios[turno][0]=="h")){
                            let level = result1.usuarios[turno][0]=="e"?1:result1.usuarios[turno][0]=="m"?2:3;
                            let botGame : gameModel =  new gameModel(result.tablero, result1.tamano_linea);
                            let resul = botGame.AIMove(level,turno);
                            mongoose.connect('mongodb://localhost:27017/connect4')
                                .then(() =>{
                                    mongoose.connection.db.eval("jugada("+idPartida+","+ronda+","+resul[0][0]+","+resul[0][1]+","+turno+")").then(() =>{
                                        res.json({"tablero":botGame.charGrid,"estado":{"finalizador": resul[1]=="p"?"":result1.usuarios[turno][0],"causa":resul[1]=="p"?"":resul[1]},"turno":-1})
                                        if (resul[1]!="p")
                                            mongoose.connection.db.eval("finalizarRonda("+idPartida+","+ronda+",'"+result1.usuarios[turno][0]+"','"+resul[1]+"')")
                                    });
                                    
                                });
                            }
                        else
                            res.json({"tablero":result.tablero,"estado":["",""],"turno":tuTurno});
                    }
                        result.tablero.forEach(element => {
                            console.log(element);
                    });
                })
            })
        })
    }
    public static start(req: Request, res: Response){
        let idPartida = req.query.idPartida;
        mongoose.connect('mongodb://localhost:27017/connect4')
        .then(() =>{
            mongoose.connection.db.eval("getInfoPartida("+idPartida+")")
            .then(result0 =>{
                mongoose.connection.db.eval("rondaActiva("+idPartida+")")
                .then(result1 =>{
                    let ronda = result1;
                    mongoose.connection.db.eval("getInfoRonda("+idPartida+","+ronda+")")
                    .then(result2 =>{
                        let ronda = result1;
                        res.json({"tamano":result0.tamano,"tamano_linea":result0.tamano_linea,"usuarios":result0.usuarios,"tablero":result2.tablero,"estado":result2.estado,"ronda":ronda});
                    });
                });
            });
        });
    }
    public static abandono(req: Request, res: Response){
        let idPartida = req.body.idPartida;
        let idJugador = req.body.idJugador
        mongoose.connect('mongodb://localhost:27017/connect4')
        .then(() =>{
            mongoose.connection.db.eval("getInfoPartida("+idPartida+")")
            .then(result0 =>{
                if ((result0.usuarios[0][0] != idJugador && result0.usuarios[1][0] != idJugador) || result0.estado==false){
                    res.json(false);
                }
                else
                    mongoose.connection.db.eval("rondaActiva("+idPartida+")")
                    .then(result1 =>{
                        let ronda = result1;
                        for(let x=ronda;x<result0.nRondas;x++){
                            consulta("finalizarRonda("+idPartida+","+x+",'"+idJugador+"','a')",null);
                        }
                        consulta("finalizarPartida("+idPartida+")",null);
                    });
                    res.json(true);
            });
        });
    }

    public static disponibles(req: Request, res: Response){
        let page = req.query.page;
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