"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//importar objetos desde express
var express_1 = require("express");
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/connect4');
function consulta(query, res) {
    mongoose.connect('mongodb://localhost:27017/connect4').then(function () {
        mongoose.connection.db.eval(query)
            .then(function (result) {
            if (res != null)
                res.json(result);
        })
            .catch(function (err) {
            if (res != null)
                res.json({ status: false, data: "Error al realizar la consulta a Mongo" });
        });
    })
        .catch(function () { res.json({ status: false, data: "Error de conexion" }); });
}
var ControladorPersona = (function () {
    function ControladorPersona() {
        this.router = express_1.Router();
        this.routes();
    }
    ControladorPersona.crearUsuario = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var nick = req.body.nick;
        var det = req.body.det;
        if (idUsuario == null || nick == null || det == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("cUsuario('" + idUsuario + "','" + nick + "','" + det + "')", res);
    };
    ControladorPersona.chat = function (req, res) {
        var idEmisor = req.body.idEmisor;
        var idReceptor = req.body.idReceptor;
        var msg = req.body.msg;
        if (idEmisor == null || idReceptor == null || msg == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("chat('" + idEmisor + "','" + idReceptor + "','" + msg + "')", res);
    };
    ControladorPersona.getChat = function (req, res) {
        var idOne = req.query.idOne;
        var idTwo = req.query.idTwo;
        if (idOne == null || idTwo == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("getChatLog('" + idOne + "','" + idTwo + "')", res);
    };
    ControladorPersona.setDetails = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var det = req.body.det;
        if (idUsuario == null || det == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("uDetalles('" + idUsuario + "','" + det + "')", res);
    };
    ControladorPersona.changeNick = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var nick = req.body.nick;
        if (idUsuario == null || nick == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("uNickname('" + idUsuario + "','" + nick + "')", res);
    };
    ControladorPersona.checkUsuario = function (req, res) {
        var idUsuario = req.query.idUsuario;
        if (idUsuario == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("checkUsuario('" + idUsuario + "')", res);
    };
    ControladorPersona.checkNick = function (req, res) {
        var nick = req.query.nick;
        if (nick == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("checkNick('" + nick + "')", res);
    };
    ControladorPersona.gameListFilter = function (req, res) {
        var idUsuario = req.query.idUsuario;
        var filtro = req.query.filtro;
        if (idUsuario == null || filtro == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("gameListFilter('" + idUsuario + "'," + filtro + ")", res);
    };
    ControladorPersona.rondaActiva = function (req, res) {
        var idPartida = req.query.idPartida;
        if (idPartida == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("rondaActiva(" + idPartida + ")", res);
    };
    ControladorPersona.friendListFilter = function (req, res) {
        var idUsuario = req.query.idUsuario;
        var filtro = req.query.filtro;
        if (idUsuario == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("friendListFilter('" + idUsuario + "'," + filtro + ")", res);
    };
    ControladorPersona.friend = function (req, res) {
        var id1 = req.body.id1;
        var id2 = req.body.id2;
        if (id1 == null || id2 == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("friend('" + id1 + "','" + id2 + "')", res);
    };
    ControladorPersona.invitar = function (req, res) {
        if (req.body.idAnfitrion == null || req.body.color == null || req.body.IDinvitado == null || req.body.tamano == null || req.body.tamano_linea == null || req.body.nRondas == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        console.log("invitar('" + req.body.idAnfitrion + "','" + req.body.color + "','" + req.body.IDinvitado + "',"
            + req.body.tamano + "," + req.body.tamano_linea + "," + req.body.nRondas + ")");
        consulta("invitar('" + req.body.idAnfitrion + "','" + req.body.color + "','" + req.body.IDinvitado + "',"
            + req.body.tamano + "," + req.body.tamano_linea + "," + req.body.nRondas + ")", res);
    };
    ControladorPersona.aceptar = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var color = req.body.color;
        var idAnfitrion = req.body.idAnfitrion;
        if (idUsuario == null || color == null || idAnfitrion == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        mongoose.connect('mongodb://localhost:27017/connect4')
            .then(function () {
            mongoose.connection.db.eval("aceptar('" + idAnfitrion + "','" + idUsuario + "')")
                .then(function (result) {
                if (!result.status) {
                    res.json(result);
                    return;
                }
                consulta("nuevaSesion('" + result.data.anfitrion + "','" + result.data.color + "','" + idUsuario + "','" + color + "'," + result.data.tamano + "," + result.data.tamano_linea + "," + result.data.nRondas + ")", res);
            }).catch(function () { return res.json({ status: false, data: "Error al aceptar invitación" }); });
        }).catch(function () { return res.json({ status: false, data: "Error de conexión" }); });
    };
    ControladorPersona.rechazar = function (req, res) {
        var idUsuario = req.body.idUsuario;
        var idAnfitrion = req.body.idAnfitrion;
        if (idUsuario == null || idAnfitrion == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("rechazar('" + idAnfitrion + "','" + idUsuario + "')", res);
    };
    ControladorPersona.invitaciones = function (req, res) {
        var idUsuario = req.query.idUsuario;
        var page = req.query.page;
        if (idUsuario == null || page == null) {
            res.json({ status: false, data: "Error de consulta: no se ha recibido uno de los parametros" });
            return;
        }
        consulta("invitaciones('" + idUsuario + "'," + page + ")", res);
    };
    ControladorPersona.prototype.routes = function () {
        //POST
        this.router.post('/crearUsuario', ControladorPersona.crearUsuario);
        this.router.post('/enviarMsg', ControladorPersona.chat);
        this.router.post('/setDetails', ControladorPersona.setDetails);
        this.router.post('/changeNick', ControladorPersona.changeNick);
        this.router.post('/friend', ControladorPersona.friend);
        this.router.post('/invitar', ControladorPersona.invitar);
        this.router.post('/aceptar', ControladorPersona.aceptar);
        this.router.post('/rechazar', ControladorPersona.rechazar);
        //GET
        this.router.get('/getChatlog', ControladorPersona.getChat);
        this.router.get('/checkUsuario', ControladorPersona.checkUsuario);
        this.router.get('/checkNick', ControladorPersona.checkNick);
        this.router.get('/gameListFilter', ControladorPersona.gameListFilter);
        this.router.get('/rondaActiva', ControladorPersona.rondaActiva);
        this.router.get('/friendListFilter', ControladorPersona.friendListFilter);
        this.router.get('/invitaciones', ControladorPersona.invitaciones);
    };
    return ControladorPersona;
}());
var personCTRL = new ControladorPersona();
var router = personCTRL.router;
exports.default = router;
