"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//importar objetos desde express
var express_1 = require("express");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/connect4');
function consulta(query, res) {
    mongoose.connection.db.eval(query)
        .then(function (result) {
        res.json(result);
    })
        .catch(function (err) {
        res.json(err);
    });
}
var ControladorPersona = /** @class */ (function () {
    function ControladorPersona() {
        this.router = express_1.Router();
        this.routes();
    }
    ControladorPersona.crearUsuario = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var nick = req.body.nick;
        var det = req.body.det;
        consulta("cUsuario('" + idUsuario + "','" + nick + "','" + det + "')", res);
    };
    ControladorPersona.chat = function (req, res) {
        var idEmisor = req.body.idEmisor;
        var idReceptor = req.body.idReceptor;
        var msg = req.body.msg;
        consulta("chat('" + idEmisor + "','" + idReceptor + "','" + msg + "')", res);
    };
    ControladorPersona.getChat = function (req, res) {
        var idOne = req.query.idOne;
        var idTwo = req.query.idTwo;
        consulta("getChatLog('" + idOne + "','" + idTwo + "')", res);
    };
    ControladorPersona.setDetails = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var det = req.body.det;
        consulta("uDetalles('" + idUsuario + "','" + det + "')", res);
    };
    ControladorPersona.changeNick = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var nick = req.body.nick;
        consulta("uNickname('" + idUsuario + "','" + nick + "')", res);
    };
    ControladorPersona.checkUsuario = function (req, res) {
        var idUsuario = req.query.idUsuario;
        consulta("checkUsuario('" + idUsuario + "')", res);
    };
    ControladorPersona.checkNick = function (req, res) {
        var nick = req.query.nick;
        consulta("checkNick('" + nick + "')", res);
    };
    ControladorPersona.gameListFilter = function (req, res) {
        var idUsuario = req.query.idUsuario;
        var filtro = req.query.filtro;
        mongoose.connect('mongodb://localhost:27017/connect4')
            .then(function () {
            mongoose.connection.db.eval("gameListFilter('" + idUsuario + "'," + filtro + ")")
                .then(function (result0) {
                var lista = result0;
                if (result0[0] == null)
                    res.json(result0);
                else {
                    var contador_1 = lista.length;
                    var data_1 = [];
                    var _loop_1 = function (x) {
                        mongoose.connection.db.eval("getInfoPartida(" + lista[x] + ")").then(function (result1) {
                            mongoose.connection.db.eval("checkUsuario('" + result1.usuarios[0][0] + "')").then(function (user0) {
                                mongoose.connection.db.eval("checkUsuario('" + result1.usuarios[1][0] + "')").then(function (user1) {
                                    data_1[x] = { "id_partida": lista[x], "Jugador_1": user0, "colors": [result1.usuarios[0][1], result1.usuarios[1][1]], "Jugador_2": user1, "tamano": result1.tamano, "linea": result1.tamano_linea };
                                    contador_1 = contador_1 - 1;
                                    if (contador_1 == 0)
                                        res.json(data_1);
                                });
                            });
                        });
                    };
                    for (var x = 0; x < lista.length; x++) {
                        _loop_1(x);
                    }
                }
            });
        });
    };
    ControladorPersona.rondaActiva = function (req, res) {
        var idPartida = req.query.idPartida;
        consulta("rondaActiva(" + idPartida + ")", res);
    };
    ControladorPersona.friendList = function (req, res) {
        var idUsuario = req.query.idUsuario;
        var page = req.query.page;
        consulta("friendList('" + idUsuario + "'," + page + ")", res);
    };
    ControladorPersona.friend = function (req, res) {
        var id1 = req.query.id1;
        var id2 = req.query.id2;
        consulta("friend('" + id1 + "','" + id2 + "')", res);
    };
    ControladorPersona.invitar = function (req, res) {
        consulta("invitar('" + req.body.idAnfitrion + "','" + req.body.color + "','" + req.body.IDinvitado + "',"
            + req.body.tamano + "," + req.body.tamano_linea + "," + req.body.nRondas + ")", res);
    };
    ControladorPersona.aceptar = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var color = req.body.color;
        var idAnfitrion = req.body.idAnfitrion;
        mongoose.connect('mongodb://localhost:27017/connect4')
            .then(function () {
            console.log("aceptar('" + idAnfitrion + "','" + idUsuario + "')");
            mongoose.connection.db.eval("aceptar('" + idAnfitrion + "','" + idUsuario + "')")
                .then(function (result) {
                console.log(result);
                console.log("nuevaSesion('" + result.anfitrion + "','" + result.color + "','" + idUsuario + "','" + color + "'," + result.tamano + "," + result.tamano_linea + "," + result.nRondas + ")");
                consulta("nuevaSesion('" + result.anfitrion + "','" + result.color + "','" + idUsuario + "','" + color + "'," + result.tamano + "," + result.tamano_linea + "," + result.nRondas + ")", res);
            }).catch(function () { return res.json(false); });
        }).catch(function () { return res.json(false); });
    };
    ControladorPersona.rechazar = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var idAnfitrion = req.body.idAnfitrion;
        console.log();
        consulta("rechazar('" + idAnfitrion + "','" + idUsuario + "')", res);
    };
    ControladorPersona.invitaciones = function (req, res) {
        var idUsuario = req.query.idUsuario;
        var page = req.query.page;
        consulta("invitaciones('" + idUsuario + "'," + page + ")", res);
    };
    ControladorPersona.prototype.routes = function () {
        this.router.post('/crearUsuario', ControladorPersona.crearUsuario);
        this.router.post('/enviarMsg', ControladorPersona.chat);
        this.router.get('/getChatlog', ControladorPersona.getChat);
        this.router.post('/setDetails', ControladorPersona.setDetails);
        this.router.post('/changeNick', ControladorPersona.changeNick);
        this.router.post('/friend', ControladorPersona.friend);
        this.router.post('/invitar', ControladorPersona.invitar);
        this.router.post('/aceptar', ControladorPersona.aceptar);
        this.router.post('/rechazar', ControladorPersona.rechazar);
        this.router.get('/checkUsuario', ControladorPersona.checkUsuario);
        this.router.get('/checkNick', ControladorPersona.checkNick);
        this.router.get('/gameListFilter', ControladorPersona.gameListFilter);
        this.router.get('/rondaActiva', ControladorPersona.rondaActiva);
        this.router.get('/friendList', ControladorPersona.friendList);
        this.router.get('/invitaciones', ControladorPersona.invitaciones);
    };
    return ControladorPersona;
}());
var personCTRL = new ControladorPersona();
var router = personCTRL.router;
exports.default = router;
