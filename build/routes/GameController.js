"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//importar objetos desde express
var express_1 = require("express");
var game_model_1 = require("./../models/game.model");
var mongoose = require('mongoose');
var async = require('async');
function consulta(query, res) {
    mongoose.connect('mongodb://localhost:27017/connect4').then(function () {
        mongoose.connection.db.eval(query)
            .then(function (result) {
            if (res != null)
                res.json(result);
        })
            .catch(function (err) {
            if (res != null)
                res.json(err);
        });
    })
        .catch(function () { res.json("Error de conexion"); });
}
var GameController = /** @class */ (function () {
    function GameController() {
        this.router = express_1.Router();
        this.routes();
    }
    GameController.finPartida = function (req, res) {
        var idPartida = req.body.idPartida;
        consulta("finalizarPartida(" + idPartida + ")", res);
    };
    GameController.finRonda = function (req, res) {
        var idPartida = req.body.idPartida;
        var ronda = req.body.ronda;
        var idFinalizador = req.body.idFinalizador;
        var razon = req.body.razon;
        consulta("finalizarRonda(" + idPartida + "," + ronda + "," + idFinalizador + ",'" + razon + "')", res);
    };
    GameController.getRegistro = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        consulta("getChatLog(" + idPartida + "," + ronda + ")", res);
    };
    GameController.getInfoPartida = function (req, res) {
        var idPartida = req.query.idPartida;
        consulta("getInfoPartida(" + idPartida + ")", res);
    };
    GameController.getInfoRonda = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        consulta("getInfoRonda(" + idPartida + "," + ronda + ")", res);
    };
    GameController.getTablero = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        consulta("getTablero(" + idPartida + "," + ronda + ")", res);
    };
    GameController.jugada = function (req, res) {
        var idPartida = req.body.idPartida;
        var fila = req.body.fila;
        var columna = req.body.columna;
        var idJugador = req.body.idJugador;
        async.waterfall([
            function (callback) {
                mongoose.connect('mongodb://localhost:27017/connect4').then(function () {
                    mongoose.connection.db.eval("rondaActiva(" + idPartida + ")")
                        .then(function (result0) {
                        var ronda = result0;
                        mongoose.connection.db.eval("getInfoRonda(" + idPartida + "," + ronda + ")")
                            .then(function (result1) {
                            if (result1.estado.finalizador != "") {
                                res.json(false);
                                return;
                            }
                            mongoose.connection.db.eval("getInfoPartida(" + idPartida + ")")
                                .then(function (result2) {
                                var jugadas = result1.jugadas;
                                var jugador;
                                var contrincante;
                                if (result2.usuarios[0][0] == idJugador) {
                                    contrincante = result2.usuarios[1][0];
                                    jugador = 0;
                                }
                                else if (result2.usuarios[1][0] == idJugador) {
                                    contrincante = result2.usuarios[0][0];
                                    jugador = 1;
                                }
                                else {
                                    jugador = -1;
                                }
                                callback(null, result1.tablero, result2.tamano_linea, jugadas.length, jugador, contrincante, result2.lastMove, result2.nRondas);
                            })
                                .catch(function (err) {
                                res.json(err);
                            });
                        })
                            .catch(function (err) {
                            res.json(err);
                        });
                    });
                })
                    .catch(function (err) {
                    res.json(err);
                });
            },
            function (tablero, size, turno, jugador, contrincante, lastMove, nRondas, callback) {
                console.log("tablero: " + tablero + "\ntamano: " + size + "\nturno: " + turno + "\njugador: " + jugador);
                var model = new game_model_1.default(tablero, size);
                if (turno % 2 == jugador) {
                    var now = Date();
                    if (lastMove != null && (Date.parse(now) - Date.parse(lastMove)) > 300000) {
                        consulta("finalizarPartida(" + idPartida + ")", null);
                        var _loop_1 = function (x) {
                            mongoose.connection.db.eval("getInfoRonda(" + idPartida + "," + x + ")")
                                .then(function (result) {
                                if (result.estado.finalizador == "") {
                                    consulta("finalizarRonda(" + idPartida + "," + x + ",'" + idJugador + "','a')", null);
                                }
                            });
                        };
                        for (var x = 0; x < nRondas; x++) {
                            _loop_1(x);
                        }
                        res.json("a");
                        return;
                    }
                    var tupla_1 = model.getCellInGrid(columna, jugador);
                    if (tupla_1 != null) {
                        mongoose.connect('mongodb://localhost:27017/connect4').then(function () {
                            mongoose.connection.db.eval("rondaActiva(" + idPartida + ")").then(function (result0) {
                                var ronda = result0;
                                mongoose.connection.db.eval("jugada(" + idPartida + "," + ronda + "," + tupla_1[0] + "," + tupla_1[1] + "," + jugador + ")").then(function () {
                                    var estado = model.isNConnected(tupla_1[0], tupla_1[1], jugador);
                                    if (estado != "p") {
                                        if (ronda == nRondas - 1)
                                            consulta("finalizarPartida(" + idPartida + ")", null);
                                        consulta("finalizarRonda(" + idPartida + "," + ronda + ",'" + idJugador + "','" + estado + "')", null);
                                        res.json(estado);
                                    }
                                    // else if (contrincante =="e" ||contrincante =="m" ||contrincante =="h"){
                                    //     let resul = model.AIMove(contrincante=="e"?1:contrincante=="m"?2:3,Math.abs(jugador-1));
                                    //     mongoose.connect('mongodb://localhost:27017/connect4').then(() =>{
                                    //         console.log(resul);
                                    //         if(resul[1]=="p")
                                    //             mongoose.connection.db.eval("jugada("+idPartida+","+ronda+","+resul[0][0]+","+resul[0][1]+","+Math.abs(jugador-1)+")").then(result0 =>{
                                    //                 res.json("p")});
                                    //         else
                                    //             mongoose.connection.db.eval("jugada("+idPartida+","+ronda+","+resul[0][0]+","+resul[0][1]+","+Math.abs(jugador-1)+")").then(result0 =>{
                                    //                 mongoose.connection.db.eval("finalizarRonda("+idPartida+","+ronda+",'"+contrincante+"','"+resul[1]+"')")
                                    //                     .then(result1 =>{
                                    //                         if (ronda == nRondas-1)
                                    //                             consulta("finalizarPartida("+idPartida+")",null);
                                    //                         res.json(resul[1]=="w"?"l":"t")})});
                                    //     })
                                    // }
                                    else
                                        res.json("p");
                                    return;
                                });
                            });
                        });
                    }
                    else
                        res.json(false);
                }
                else
                    res.json(false);
            }
        ]);
    };
    GameController.setTablero = function (req, res) {
        var idPartida = req.body.idPartida;
        var ronda = req.body.ronda;
        var tablero = req.body.tablero;
        consulta("setTablero(" + idPartida + "," + ronda + "," + tablero + ")", res);
    };
    GameController.linkUsuario = function (req, res) {
        var idPartida = req.body.idPartida;
        var idUsuario = req.body.idUsuario;
        var color = req.body.color;
        consulta("linkUsuarioPartida(" + idPartida + ",'" + idUsuario + "','" + color + "')", res);
    };
    GameController.newGame = function (req, res) {
        var idJ1 = req.body.idJ1;
        var color1 = req.body.color1;
        var idJ2 = req.body.idJ2;
        var color2 = req.body.color2;
        var size = req.body.size;
        var lineSize = req.body.lineSize;
        var nRondas = req.body.nRondas;
        consulta("nuevaSesion('" + idJ1 + "','" + color1 + "','" + idJ2 + "','" + color2 + "'," + size + "," + lineSize + "," + nRondas + ")", res);
    };
    GameController.update = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        var idJugador = req.query.idJugador;
        mongoose.connect('mongodb://localhost:27017/connect4')
            .then(function () {
            mongoose.connection.db.eval("getInfoRonda(" + idPartida + "," + ronda + ")")
                .then(function (result) {
                mongoose.connection.db.eval("getInfoPartida(" + idPartida + ")")
                    .then(function (result1) {
                    if (result.estado.causa != "") {
                        res.json({ "tablero": result.tablero, "estado": result.estado, "turno": -1 });
                    }
                    else {
                        var jugadas = result.jugadas;
                        var jugador_1;
                        var turno_1 = jugadas.length % 2;
                        if (result1.usuarios[0][0] == idJugador) {
                            jugador_1 = 0;
                        }
                        else if (result1.usuarios[1][0] == idJugador) {
                            jugador_1 = 1;
                        }
                        else {
                            jugador_1 = -1;
                        }
                        var tuTurno_1 = jugadas.length % 2 == jugador_1 ? 1 : jugador_1 == -1 ? -1 : 0;
                        var now = Date();
                        if (result1.lastMove != null && result.estado.finalizador == "" && (Date.parse(now) - Date.parse(result1.lastMove)) > 300000) {
                            mongoose.connection.db.eval("finalizarPartida(" + idPartida + ")")
                                .then(function (result3) {
                                var finalizador = result[tuTurno_1 == 1 ? jugador_1 : Math.abs(jugador_1 - 1)][0];
                                var _loop_2 = function (x) {
                                    mongoose.connection.db.eval("getInfoRonda(" + idPartida + "," + x + ")")
                                        .then(function (result4) {
                                        if (result4.estado.finalizador == "") {
                                            mongoose.connection.db.eval("finalizarRonda(" + idPartida + "," + x + "," + finalizador + ",'a')");
                                        }
                                    });
                                };
                                for (var x = 0; x < result1.nRondas; x++) {
                                    _loop_2(x);
                                }
                                res.json({ "tablero": result.tablero, "estado": { "finalizador": finalizador, "causa": "a" }, "turno": -1 });
                                return;
                            });
                        }
                        else if ((result1.usuarios[turno_1][0] == "e" || result1.usuarios[turno_1][0] == "m" || result1.usuarios[turno_1][0] == "h")) {
                            var level = result1.usuarios[turno_1][0] == "e" ? 1 : result1.usuarios[turno_1][0] == "m" ? 2 : 3;
                            var botGame_1 = new game_model_1.default(result.tablero, result1.tamano_linea);
                            var resul_1 = botGame_1.AIMove(level, turno_1);
                            mongoose.connect('mongodb://localhost:27017/connect4')
                                .then(function () {
                                mongoose.connection.db.eval("jugada(" + idPartida + "," + ronda + "," + resul_1[0][0] + "," + resul_1[0][1] + "," + turno_1 + ")").then(function () {
                                    res.json({ "tablero": botGame_1.charGrid, "estado": { "finalizador": resul_1[1] == "p" ? "" : result1.usuarios[turno_1][0], "causa": resul_1[1] == "p" ? "" : resul_1[1] }, "turno": -1 });
                                    if (resul_1[1] != "p")
                                        mongoose.connection.db.eval("finalizarRonda(" + idPartida + "," + ronda + ",'" + result1.usuarios[turno_1][0] + "','" + resul_1[1] + "')");
                                });
                            });
                        }
                        else
                            res.json({ "tablero": result.tablero, "estado": ["", ""], "turno": tuTurno_1 });
                    }
                    result.tablero.forEach(function (element) {
                        console.log(element);
                    });
                });
            });
        });
    };
    GameController.start = function (req, res) {
        var idPartida = req.query.idPartida;
        mongoose.connect('mongodb://localhost:27017/connect4')
            .then(function () {
            mongoose.connection.db.eval("getInfoPartida(" + idPartida + ")")
                .then(function (result0) {
                mongoose.connection.db.eval("rondaActiva(" + idPartida + ")")
                    .then(function (result1) {
                    var ronda = result1;
                    mongoose.connection.db.eval("getInfoRonda(" + idPartida + "," + ronda + ")")
                        .then(function (result2) {
                        var ronda = result1;
                        res.json({ "tamano": result0.tamano, "tamano_linea": result0.tamano_linea, "usuarios": result0.usuarios, "tablero": result2.tablero, "estado": result2.estado, "ronda": ronda });
                    });
                });
            });
        });
    };
    GameController.abandono = function (req, res) {
        var idPartida = req.body.idPartida;
        var idJugador = req.body.idJugador;
        mongoose.connect('mongodb://localhost:27017/connect4')
            .then(function () {
            mongoose.connection.db.eval("getInfoPartida(" + idPartida + ")")
                .then(function (result0) {
                if ((result0.usuarios[0][0] != idJugador && result0.usuarios[1][0] != idJugador) || result0.estado == false) {
                    res.json(false);
                }
                else
                    mongoose.connection.db.eval("rondaActiva(" + idPartida + ")")
                        .then(function (result1) {
                        var ronda = result1;
                        for (var x = ronda; x < result0.nRondas; x++) {
                            consulta("finalizarRonda(" + idPartida + "," + x + ",'" + idJugador + "','a')", null);
                        }
                        consulta("finalizarPartida(" + idPartida + ")", null);
                    });
                res.json(true);
            });
        });
    };
    GameController.prototype.routes = function () {
        this.router.get('/update', GameController.update);
        this.router.get('/getGamelog', GameController.getRegistro);
        this.router.get('/getInfoPartida', GameController.getInfoPartida);
        this.router.get('/getInfoRonda', GameController.getInfoRonda);
        this.router.get('/getTablero', GameController.getTablero);
        this.router.get('/start', GameController.start);
        this.router.post('/finPartida', GameController.finPartida);
        this.router.post('/setTablero', GameController.setTablero);
        this.router.post('/jugada', GameController.jugada);
        this.router.post('/linkUsuarioPartida', GameController.linkUsuario);
        this.router.post('/nuevaSesion', GameController.newGame);
        this.router.post('/finRonda', GameController.finRonda);
        this.router.post('/abandono', GameController.abandono);
    };
    return GameController;
}());
var gameCTRL = new GameController();
var router = gameCTRL.router;
exports.default = router;
