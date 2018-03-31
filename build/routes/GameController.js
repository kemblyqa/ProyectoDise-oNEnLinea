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
var GameController = /** @class */ (function () {
    function GameController() {
        this.router = express_1.Router();
        this.routes();
    }
    GameController.finPartida = function (req, res) {
        var idPartida = req.query.idPartida;
        consulta("finalizarPartida(" + idPartida + ")", res);
    };
    GameController.finRonda = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        var idFinalizador = req.query.idFinalizador;
        var razon = req.query.razon;
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
    GameController.setTablero = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        var fila = req.query.fila;
        var columna = req.query.columna;
        var idJugador = req.query.idJugador;
        consulta("jugada(" + idPartida + "," + ronda + "," + fila + "," + columna + "," + idJugador + ")", res);
    };
    GameController.jugada = function (req, res) {
        var idPartida = req.query.idPartida;
        var ronda = req.query.ronda;
        var tablero = req.query.tablero;
        consulta("setTablero(" + idPartida + "," + ronda + "," + tablero + ")", res);
    };
    GameController.linkUsuario = function (req, res) {
        var idPartida = req.query.idPartida;
        var idUsuario = req.query.idUsuario;
        var color = req.query.color;
        consulta("linkUsuarioPartida(" + idPartida + "," + idUsuario + ",'" + color + "')", res);
    };
    GameController.newGame = function (req, res) {
        var idJ1 = req.query.idJ1;
        var color1 = req.query.color1;
        var idJ2 = req.query.idJ2;
        var color2 = req.query.color2;
        var size = req.query.size;
        var lineSize = req.query.lineSize;
        var nRondas = req.query.nRondas;
        consulta("nuevaSesion(" + idJ1 + ",'" + color1 + "'," + idJ2 + ",'" + color2 + "'," + size + "," + lineSize + "," + nRondas + ")", res);
    };
    GameController.prototype.routes = function () {
        this.router.get('/finPartida', GameController.finPartida);
        this.router.post('/finRonda', GameController.finRonda);
        this.router.get('/getGamelog', GameController.getRegistro);
        this.router.get('/getInfoPartida', GameController.getInfoPartida);
        this.router.get('/getInfoRonda', GameController.getInfoRonda);
        this.router.get('/getTablero', GameController.getTablero);
        this.router.post('/setTablero', GameController.setTablero);
        this.router.post('/jugada', GameController.jugada);
        this.router.post('/linkUsuarioPartida', GameController.linkUsuario);
        this.router.post('/nuevaSesion', GameController.newGame);
    };
    return GameController;
}());
var gameCTRL = new GameController();
var router = gameCTRL.router;
exports.default = router;
