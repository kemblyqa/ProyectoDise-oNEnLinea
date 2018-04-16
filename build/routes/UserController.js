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
    ControladorPersona.gameListFilter = function (req, res) {
        var idUsuario = req.query.idUsuario;
        var filtro = req.query.filtro;
        mongoose.connect('mongodb://localhost:27017/connect4')
            .then(function () {
            mongoose.connection.db.eval("gameListFilter('" + idUsuario + "'," + filtro + ")")
                .then(function (result0) {
                if (result0[0] == null)
                    res.json(result0);
                else
                    result0.forEach(function (element) {
                        mongoose.connection.db.eval("getInfoPartida(" + element + ")").then(function (result1) {
                            mongoose.connection.db.eval("checkUsuario('" + result1.usuarios[0][0] + "')").then(function (user0) {
                                mongoose.connection.db.eval("checkUsuario('" + result1.usuarios[1][0] + "')").then(function (user1) {
                                    res.json({ "id_partida": element, "Jugador_1": user0, "colors": [result1.usuarios[0][1], result1.usuarios[1][1]], "Jugador_2": user1, "tamano": result1.tamano, "linea": result1.tamano_linea });
                                });
                            });
                        });
                    });
            });
        });
    };
    ControladorPersona.rondaActiva = function (req, res) {
        var idPartida = req.query.idPartida;
        consulta("rondaActiva(" + idPartida + ")", res);
    };
    ControladorPersona.prototype.routes = function () {
        this.router.post('/crearUsuario', ControladorPersona.crearUsuario);
        this.router.post('/enviarMsg', ControladorPersona.chat);
        this.router.get('/getChatlog', ControladorPersona.getChat);
        this.router.post('/setDetails', ControladorPersona.setDetails);
        this.router.post('/changeNick', ControladorPersona.changeNick);
        this.router.get('/checkUsuario', ControladorPersona.checkUsuario);
        this.router.get('/gameListFilter', ControladorPersona.gameListFilter);
        this.router.get('/rondaActiva', ControladorPersona.rondaActiva);
    };
    return ControladorPersona;
}());
var personCTRL = new ControladorPersona();
var router = personCTRL.router;
exports.default = router;
