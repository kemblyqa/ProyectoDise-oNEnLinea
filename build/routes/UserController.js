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
        consulta("cUsuario(" + idUsuario + ",'" + nick + "','" + det + "')", res);
    };
    ControladorPersona.chat = function (req, res) {
        var idEmisor = req.body.idEmisor;
        var idReceptor = req.body.idReceptor;
        var msg = req.body.msg;
        consulta("chat(" + idEmisor + "," + idReceptor + ",'" + msg + "')", res);
    };
    ControladorPersona.getChat = function (req, res) {
        var idOne = req.query.idOne;
        var idTwo = req.query.idTwo;
        consulta("getChatLog(" + idOne + "," + idTwo + ")", res);
    };
    ControladorPersona.setDetails = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var det = req.body.det;
        consulta("uDetalles(" + idUsuario + ",'" + det + "')", res);
    };
    ControladorPersona.changeNick = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var nick = req.body.nick;
        consulta("uNickname(" + idUsuario + ",'" + nick + "')", res);
    };
    ControladorPersona.checkUsuario = function (req, res) {
        var idUsuario = req.query.idUsuario;
        console.log("checkUsuario(" + idUsuario + ")");
        consulta("checkUsuario(" + idUsuario + ")", res);
    };
    ControladorPersona.gameList = function (req, res) {
        var idUsuario = req.query.idUsuario;
        consulta("gameList(" + idUsuario + ")", res);
    };
    ControladorPersona.prototype.routes = function () {
        this.router.post('/crearUsuario', ControladorPersona.crearUsuario);
        this.router.post('/enviarMsg', ControladorPersona.chat);
        this.router.get('/getChatlog', ControladorPersona.getChat);
        this.router.post('/setDetails', ControladorPersona.setDetails);
        this.router.post('/changeNick', ControladorPersona.changeNick);
        this.router.get('/checkUsuario', ControladorPersona.checkUsuario);
        this.router.get('/gameList', ControladorPersona.gameList);
    };
    return ControladorPersona;
}());
var personCTRL = new ControladorPersona();
var router = personCTRL.router;
exports.default = router;
