"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//importar objetos desde express
var express_1 = require("express");
var game_model_1 = require("./../models/game.model");
var mongoose = require('mongoose');
var async = require('async');
conectar();
function conectar() {
    mongoose.connect('mongodb://localhost:27017/connect4').then(function () {
        console.log("conexion realizada");
        return true;
    }).catch(function () {
        return false;
    });
    return false;
}
function checkConnection() {
    if (mongoose.connection.readyState != 1) {
        return conectar();
    }
    else
        return true;
}
function consulta(query, res) {
    if (!checkConnection()) {
        resConnectionError(res);
        return;
    }
    else {
        mongoose.connection.db.eval(query)
            .then(function (result) {
            if (res != null)
                res.json(result);
        })
            .catch(function (err) {
            resConnectionError(res);
        });
    }
}
function resConnectionError(res) {
    res.json({ status: false, data: "Error al realizar la consulta a Mongo, intente de nuevo más tarde" });
}
var GameController = (function () {
    function GameController() {
        this.router = express_1.Router();
        this.routes();
    }
    GameController.finPartida = function (req, res) {
        var idPartida = req.body.idPartida;
        if (idPartida == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("finalizarPartida(" + idPartida + ")", res);
    };
    GameController.finRonda = function (req, res) {
        var idPartida = req.body.idPartida;
        var ronda = req.body.ronda;
        var idFinalizador = req.body.idFinalizador;
        var razon = req.body.razon;
        if (idPartida == null || ronda == null || idFinalizador == null || razon == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("finalizarRonda(" + idPartida + "," + ronda + "," + idFinalizador + ",'" + razon + "')", res);
    };
    GameController.getRegistro = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        if (idPartida == null || ronda == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("getChatLog(" + idPartida + "," + ronda + ")", res);
    };
    GameController.getInfoPartida = function (req, res) {
        var idPartida = req.query.idPartida;
        if (idPartida == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("getInfoPartida(" + idPartida + ")", res);
    };
    GameController.getInfoRonda = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        if (idPartida == null || ronda == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("getInfoRonda(" + idPartida + "," + ronda + ")", res);
    };
    GameController.getTablero = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        if (idPartida == null || ronda == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("getTablero(" + idPartida + "," + ronda + ")", res);
    };
    GameController.jugada = function (req, res) {
        var idPartida = req.body.idPartida;
        var fila = req.body.fila;
        var columna = req.body.columna;
        var idJugador = req.body.idJugador;
        if (idPartida == null || fila == null || columna == null || idJugador == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        async.waterfall([
            function (callback) {
                if (!checkConnection()) {
                    resConnectionError(res);
                    return;
                }
                mongoose.connection.db.eval("rondaActiva(" + idPartida + ")")
                    .then(function (result0) {
                    if (!result0.status) {
                        res.json(result0);
                        return;
                    }
                    var ronda = result0.data;
                    mongoose.connection.db.eval("getInfoRonda(" + idPartida + "," + ronda + ")")
                        .then(function (result1) {
                        if (!result1.status) {
                            res.json(result1);
                            return;
                        }
                        if (result1.data.estado.finalizador != "") {
                            res.json({ status: false, data: "Esta partida está finalizada" });
                            return;
                        }
                        mongoose.connection.db.eval("getInfoPartida(" + idPartida + ")")
                            .then(function (result2) {
                            if (!result2.status) {
                                res.json(result2);
                                return;
                            }
                            var jugadas = result1.data.jugadas;
                            var jugador;
                            var contrincante;
                            if (result2.data.usuarios[0][0] == idJugador) {
                                contrincante = result2.data.usuarios[1][0];
                                jugador = 0;
                            }
                            else if (result2.data.usuarios[1][0] == idJugador) {
                                contrincante = result2.data.usuarios[0][0];
                                jugador = 1;
                            }
                            else {
                                jugador = -1;
                            }
                            callback(null, result1.data.tablero, result2.data.tamano_linea, jugadas.length, jugador, contrincante, result2.data.lastMove, result2.data.nRondas);
                        }).catch(function (err) { res.json({ status: false, data: err }); });
                    }).catch(function (err) { res.json({ status: false, data: err }); });
                }).catch(function (err) { res.json({ status: false, data: err }); });
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
                                if (!result.status) {
                                    res.json(result);
                                    return;
                                }
                                if (result.data.estado.finalizador == "") {
                                    consulta("finalizarRonda(" + idPartida + "," + x + ",'" + idJugador + "','a')", null);
                                }
                            }).catch(function (err) { res.json({ status: false, data: err }); });
                        };
                        for (var x = 0; x < nRondas; x++) {
                            _loop_1(x);
                        }
                        res.json({ status: true, data: "a" });
                        return;
                    }
                    var tupla_1 = model.getCellInGrid(columna, jugador);
                    if (tupla_1 != null) {
                        if (!checkConnection()) {
                            resConnectionError(res);
                            return;
                        }
                        mongoose.connection.db.eval("rondaActiva(" + idPartida + ")").then(function (result0) {
                            if (!result0.status) {
                                res.json(result0);
                                return;
                            }
                            var ronda = result0.data;
                            mongoose.connection.db.eval("jugada(" + idPartida + "," + ronda + "," + tupla_1[0] + "," + tupla_1[1] + "," + jugador + ")").then(function () {
                                var estado = model.isNConnected(tupla_1[0], tupla_1[1], jugador);
                                if (estado != "p") {
                                    if (ronda == nRondas - 1)
                                        consulta("finalizarPartida(" + idPartida + ")", null);
                                    consulta("finalizarRonda(" + idPartida + "," + ronda + ",'" + idJugador + "','" + estado + "')", null);
                                    res.json({ status: true, data: estado });
                                }
                                else
                                    res.json({ status: true, data: "p" });
                                return;
                            }).catch(function (err) { res.json({ status: false, data: err }); });
                        }).catch(function (err) { res.json({ status: false, data: err }); });
                    }
                    else
                        res.json({ status: false, data: "Jugada no posible" });
                }
                else
                    res.json({ status: false, data: "No es tu turno" });
            }
        ]);
    };
    GameController.setTablero = function (req, res) {
        var idPartida = req.body.idPartida;
        var ronda = req.body.ronda;
        var tablero = req.body.tablero;
        if (idPartida == null || ronda == null || tablero == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("setTablero(" + idPartida + "," + ronda + "," + tablero + ")", res);
    };
    GameController.linkUsuario = function (req, res) {
        var idPartida = req.body.idPartida;
        var idUsuario = req.body.idUsuario;
        var color = req.body.color;
        if (idPartida == null || idUsuario == null || color == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
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
        if (idJ1 == null || color1 == null || idJ2 == null || color2 == null || size == null || lineSize == null || nRondas == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("nuevaSesion('" + idJ1 + "','" + color1 + "','" + idJ2 + "','" + color2 + "'," + size + "," + lineSize + "," + nRondas + ")", res);
    };
    GameController.update = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        var idJugador = req.query.idJugador;
        var moveFlag = req.query.moveFlag;
        if (idPartida == null || ronda == null || idJugador == null || moveFlag == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        if (!checkConnection()) {
            resConnectionError(res);
            return;
        }
        mongoose.connection.db.eval("update(" + idPartida + "," + ronda + ",'" + idJugador + "')")
            .then(function (result) {
            if (!result.status) {
                res.json(result);
                return;
            }
            if (result.data.estado.causa != "") {
                res.json({ status: true, data: { "tablero": result.data.tablero, "estado": result.data.estado, "turno": -1 } });
            }
            else {
                var jugadas = result.data.jugadas;
                var jugador = void 0;
                var turno_1 = jugadas.length % 2;
                if (result.data.usuarios[0][0] == idJugador) {
                    jugador = 0;
                }
                else if (result.data.usuarios[1][0] == idJugador) {
                    jugador = 1;
                }
                else {
                    jugador = -1;
                }
                var tuTurno = jugadas.length % 2 == jugador ? 1 : jugador == -1 ? -1 : 0;
                var now = Date();
                if (result.data.lastMove != null && result.data.estado.finalizador == "" && (Date.parse(now) - Date.parse(result.data.lastMove)) > 300000) {
                    consulta("finalizarPartida(" + idPartida + ")", null);
                    var finalizador_1 = result.data.usuarios[tuTurno == 1 ? jugador : Math.abs(jugador - 1)][0];
                    var _loop_2 = function (x) {
                        mongoose.connection.db.eval("getInfoRonda(" + idPartida + "," + x + ")")
                            .then(function (rounData) {
                            if (!rounData.status) {
                                res.json(rounData);
                                return;
                            }
                            if (rounData.data.estado.finalizador == "") {
                                consulta("finalizarRonda(" + idPartida + "," + x + "," + finalizador_1 + ",'a')", null);
                            }
                        }).catch(function (err) { res.json({ status: false, data: err }); });
                    };
                    for (var x = 0; x < result.data.nRondas; x++) {
                        _loop_2(x);
                    }
                    res.json({ status: true, data: { tablero: result.data.tablero, estado: { finalizador: finalizador_1, causa: "a" }, turno: -1 } });
                    return;
                }
                else if ((result.data.usuarios[turno_1][0] == "e" || result.data.usuarios[turno_1][0] == "m" || result.data.usuarios[turno_1][0] == "h") && moveFlag == "false") {
                    var level = result.data.usuarios[turno_1][0] == "e" ? 1 : result.data.usuarios[turno_1][0] == "m" ? 2 : 3;
                    var botGame_1 = new game_model_1.default(result.data.tablero, result.data.tamano_linea);
                    var resul_1 = botGame_1.AIMove(level, turno_1);
                    if (!checkConnection()) {
                        resConnectionError(res);
                        return;
                    }
                    mongoose.connection.db.eval("jugada(" + idPartida + "," + ronda + "," + resul_1[0][0] + "," + resul_1[0][1] + "," + turno_1 + ")").then(function (moveOk) {
                        if (!moveOk.status) {
                            res.json({ status: true, data: { "tablero": result.data.tablero, "estado": result.data.estado, "turno": -1 } });
                            return;
                        }
                        res.json({ status: true, data: { tablero: botGame_1.charGrid, estado: { finalizador: resul_1[1] == "p" ? "" : result.data.usuarios[turno_1][0], causa: resul_1[1] == "p" ? "" : resul_1[1] }, turno: -1 } });
                        if (resul_1[1] != "p")
                            mongoose.connection.db.eval("finalizarRonda(" + idPartida + "," + ronda + ",'" + result.data.usuarios[turno_1][0] + "','" + resul_1[1] + "')");
                    }).catch(function (err) { res.json({ status: false, data: err }); });
                }
                else
                    res.json({ status: true, data: { tablero: result.data.tablero, estado: { finalizador: "", causa: "" }, turno: tuTurno } });
            }
        }).catch(function (err) { res.json({ status: false, data: err }); });
    };
    GameController.start = function (req, res) {
        var idPartida = req.query.idPartida;
        if (idPartida == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        if (!checkConnection()) {
            res.json({ status: false, data: "Error al realizar la consulta a Mongo!" });
            return;
        }
        mongoose.connection.db.eval("getInfoPartida(" + idPartida + ")")
            .then(function (result0) {
            if (!result0.status) {
                res.json(result0);
                return;
            }
            mongoose.connection.db.eval("rondaActiva(" + idPartida + ")")
                .then(function (result1) {
                if (!result1.status) {
                    res.json(result1);
                    return;
                }
                var ronda = result1.data;
                mongoose.connection.db.eval("getInfoRonda(" + idPartida + "," + ronda + ")")
                    .then(function (result2) {
                    if (!result2.status) {
                        res.json(result2);
                        return;
                    }
                    var ronda = result1.data;
                    res.json({ status: true, data: { "tamano": result0.data.tamano, "tamano_linea": result0.data.tamano_linea, "usuarios": result0.data.usuarios, "tablero": result2.data.tablero, "estado": result2.data.estado, "ronda": ronda } });
                }).catch(function (err) { res.json({ status: false, data: err }); });
            }).catch(function (err) { res.json({ status: false, data: err }); });
        }).catch(function (err) { res.json({ status: false, data: err }); });
    };
    GameController.abandono = function (req, res) {
        var idPartida = req.body.idPartida;
        var idJugador = req.body.idJugador;
        if (idPartida == null || idJugador == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        if (!checkConnection()) {
            resConnectionError(res);
            return;
        }
        mongoose.connection.db.eval("getInfoPartida(" + idPartida + ")")
            .then(function (result0) {
            if (!result0.status) {
                res.json(result0);
                return;
            }
            if ((result0.data.usuarios[0][0] != idJugador && result0.data.usuarios[1][0] != idJugador) || result0.data.estado == false) {
                res.json({ status: false, data: "La partida está inactiva o no admite a este jugador" });
            }
            else
                mongoose.connection.db.eval("rondaActiva(" + idPartida + ")")
                    .then(function (result1) {
                    if (!result1.status) {
                        res.json(result1);
                        return;
                    }
                    var ronda = result1.data;
                    for (var x = ronda; x < result0.data.nRondas; x++) {
                        consulta("finalizarRonda(" + idPartida + "," + x + ",'" + idJugador + "','a')", null);
                    }
                    consulta("finalizarPartida(" + idPartida + ")", null);
                }).catch(function (err) { res.json({ status: false, data: err }); });
            res.json({ status: true, data: "Success!" });
        }).catch(function (err) { res.json({ status: false, data: err }); });
    };
    GameController.disponibles = function (req, res) {
        var page = req.query.page;
        if (page == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("disponibles(" + page + ")", res);
    };
    GameController.drawMove = function (req, res) {
        try {
            if (req.query.tablero == null || req.query.jugada == null || req.query.turno == null) {
                res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
                return;
            }
            var tablero = typeof req.query.tablero === "object" ? req.query.tablero : JSON.parse(req.query.tablero);
            var jugada = typeof req.query.jugada === "object" ? req.query.jugada : JSON.parse(req.query.jugada);
            var turno = req.query.turno;
            var template = new game_model_1.default(tablero, 0);
            template.getCellInGrid(jugada[1], turno % 2);
            res.json({ status: true, data: template.charGrid });
        }
        catch (e) {
            res.json({ status: false, data: "drawMove error" });
        }
    };
    GameController.jugadas = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        if (idPartida == null || ronda == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("jugadas(" + idPartida + "," + ronda + ")", res);
    };
    GameController.estadoAvanzado = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        if (idPartida == null || ronda == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        if (!checkConnection()) {
            resConnectionError(res);
            return;
        }
        mongoose.connection.db.eval("estadoAvanzado(" + idPartida + "," + ronda + ")").then(function (result0) {
            if (!result0.status) {
                res.json(result0);
                return;
            }
            mongoose.connection.db.eval("checkUsuario('" + result0.data.finalizador + "')").then(function (result1) {
                if (!result1.status) {
                    res.json(result1);
                    return;
                }
                if (result0.data.causa == "a")
                    res.json({ status: true, data: result1.data.nickname + " ha abandonado la partida" });
                else if (result0.data.causa == "w")
                    res.json({ status: true, data: result1.data.nickname + " ha ganado la ronda" });
                else if (result0.data.causa == "t")
                    res.json({ status: true, data: result1.data.nickname + " ha empatado la ronda" });
                else
                    res.json({ status: true, data: "Esta partida sigue en curso" });
            });
        });
    };
    GameController.prototype.routes = function () {
        //GET
        this.router.get('/update', GameController.update);
        this.router.get('/getGamelog', GameController.getRegistro);
        this.router.get('/getInfoPartida', GameController.getInfoPartida);
        this.router.get('/getInfoRonda', GameController.getInfoRonda);
        this.router.get('/getTablero', GameController.getTablero);
        this.router.get('/start', GameController.start);
        this.router.get('/disponibles', GameController.disponibles);
        this.router.get('/drawMove', GameController.drawMove);
        this.router.get('/jugadas', GameController.jugadas);
        this.router.get('/estadoAvanzado', GameController.estadoAvanzado);
        //POST
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
