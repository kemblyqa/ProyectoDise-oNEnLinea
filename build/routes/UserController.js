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
        var idUsuario = req.query.idUsuario;
        var nick = req.query.nick;
        var det = req.query.det;
        consulta("cUsuario(" + idUsuario + ",'" + nick + "','" + det + "')", res);
    };
    ControladorPersona.chat = function (req, res) {
        var idEmisor = req.query.idEmisor;
        var idReceptor = req.query.idReceptor;
        var msg = req.query.msg;
        consulta("chat(" + idEmisor + "," + idReceptor + ",'" + msg + "')", res);
    };
    ControladorPersona.getChat = function (req, res) {
        var idOne = req.query.idOne;
        var idTwo = req.query.idTwo;
        consulta("getChatLog(" + idOne + "," + idTwo + ")", res);
    };
    ControladorPersona.setDetails = function (req, res) {
        var idUsuario = req.query.idUsuario;
        var det = req.query.det;
        consulta("uDetalles(" + idUsuario + ",'" + det + "')", res);
    };
    ControladorPersona.changeNick = function (req, res) {
        var idUsuario = req.query.idUsuario;
        var nick = req.query.nick;
        consulta("uNickname(" + idUsuario + ",'" + nick + "')", res);
    };
    ControladorPersona.prototype.routes = function () {
        this.router.post('/crearUsuario', ControladorPersona.crearUsuario);
        this.router.post('/enviarMsg', ControladorPersona.chat);
        this.router.get('/getChatlog', ControladorPersona.getChat);
        this.router.post('/setDetails', ControladorPersona.setDetails);
        this.router.post('/changeNick', ControladorPersona.changeNick);
    };
    return ControladorPersona;
}());
var personCTRL = new ControladorPersona();
var router = personCTRL.router;
exports.default = router;
