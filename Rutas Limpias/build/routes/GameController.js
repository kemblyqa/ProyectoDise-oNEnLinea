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
var GameControler = /** @class */ (function () {
    function GameControler() {
        this.router = express_1.Router();
        this.routes();
    }
    GameControler.finPartida = function (req, res) {
        var idPartida = req.query.idPartida;
        consulta("finalizarPartida(" + idPartida + ")", res);
    };
    GameControler.finRonda = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        var idFinalizador = req.query.idFinalizador;
        var razon = req.query.razon;
        consulta("finalizarRonda(" + idPartida + "," + ronda + "," + idFinalizador + ",'" + razon + "')", res);
    };
    GameControler.getRegistro = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        consulta("getChatLog(" + idPartida + "," + ronda + ")", res);
    };
    GameControler.getInfoPartida = function (req, res) {
        var idPartida = req.query.idPartida;
        consulta("getInfoPartida(" + idPartida + ")", res);
    };
    GameControler.getInfoRonda = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        consulta("getInfoRonda(" + idPartida + "," + ronda + ")", res);
    };
    GameControler.getTablero = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        consulta("getTablero(" + idPartida + "," + ronda + ")", res);
    };
    GameControler.setTablero = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        var fila = req.query.fila;
        var columna = req.query.columna;
        var idJugador = req.query.idJugador;
        consulta("jugada(" + idPartida + "," + ronda + "," + fila + "," + columna + "," + idJugador + ")", res);
    };
    GameControler.jugada = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        var tablero = req.query.tablero;
        consulta("setTablero(" + idPartida + "," + ronda + "," + tablero + ")", res);
    };
    GameControler.linkUsuario = function (req, res) {
        var idPartida = req.query.idPartida;
        var idUsuario = req.query.idUsuario;
        var color = req.query.color;
        consulta("linkUsuarioPartida(" + idPartida + "," + idUsuario + ",'" + color + "')", res);
    };
    GameControler.newGame = function (req, res) {
        var idJ1 = req.query.idJ1;
        var color1 = req.query.color1;
        var idJ2 = req.query.idJ2;
        var color2 = req.query.color2;
        var size = req.query.size;
        var lineSize = req.query.lineSize;
        var nRondas = req.query.nRondas;
        consulta("nuevaSesion(" + idJ1 + ",'" + color1 + "'," + idJ2 + ",'" + color2 + "'," + size + "," + lineSize + "," + nRondas + ")", res);
    };
    GameControler.prototype.routes = function () {
        this.router.get('/finPartida', GameControler.finPartida);
        this.router.post('/finRonda', GameControler.finRonda);
        this.router.get('/getGamelog', GameControler.getRegistro);
        this.router.get('/getInfoPartida', GameControler.getInfoPartida);
        this.router.get('/getInfoRonda', GameControler.getInfoRonda);
        this.router.get('/getTablero', GameControler.getTablero);
        this.router.post('/setTablero', GameControler.setTablero);
        this.router.post('/jugada', GameControler.jugada);
        this.router.post('/linkUsuarioPartida', GameControler.linkUsuario);
        this.router.post('/nuevaSesion', GameControler.newGame);
    };
    return GameControler;
}());
var gameCTRL = new GameControler();
var router = gameCTRL.router;
exports.default = router;
