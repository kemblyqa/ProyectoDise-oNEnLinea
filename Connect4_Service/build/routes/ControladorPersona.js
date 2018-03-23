"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//importar objetos desde express
var express_1 = require("express");
var persona_1 = require("../models/persona");
var ControladorPersona = /** @class */ (function () {
    function ControladorPersona() {
        this.router = express_1.Router();
        this.routes();
    }
    ControladorPersona.prototype.ObtenerPersonas = function (req, res) {
        //no se estan enviando condiciones
        persona_1.default.find({})
            .then(function (data) {
            res.json(data);
        })
            .catch(function (err) {
            var status = req.statusCode;
            res.json({
                status: status,
                err: err
            });
        });
    };
    ControladorPersona.prototype.ObtenerPersona = function (req, res) {
        var cedula = req.params.cedula;
        persona_1.default.find({ Cedula: cedula })
            .then(function (persona) {
            res.json(persona);
        })
            .catch(function (err) {
            var status = req.statusCode;
            res.json({
                status: status,
                err: err
            });
        });
    };
    ControladorPersona.prototype.GuardarPersona = function (req, res) {
        var nombre = req.body.nombre;
        var cedula = req.body.cedula;
        var apellidos = req.body.apellidos;
        var edad = req.body.edad;
        var direccion = req.body.direccion;
        var fechaNacimiento = req.body.fechaNacimiento;
        var hijos = req.body.hijos;
        var persona = new persona_1.default({
            cedula: cedula,
            nombre: nombre,
            apellidos: apellidos,
            edad: edad,
            direccion: direccion,
            fechaNacimiento: fechaNacimiento,
            hijos: hijos
        });
        persona.save()
            .then(function (personaGuardada) {
            res.json({ message: 'Persona guardada' });
        })
            .catch(function (err) {
            var statusCode = req.statusCode;
            res.json({
                codigo: statusCode,
                error: err
            });
        });
    };
    ControladorPersona.prototype.BorrarPersona = function (req, res) {
        var cedula = req.params.cedula;
        persona_1.default.findOneAndRemove({ Cedula: cedula })
            .then(function (personaBorrada) {
            res.json({ Message: personaBorrada });
        })
            .catch(function (err) {
            var statusCode = req.statusCode;
            res.json({
                codigo: statusCode,
                error: err
            });
        });
    };
    ControladorPersona.prototype.routes = function () {
        this.router.get('/getAll', this.ObtenerPersonas);
        this.router.get('/getOne:cedula', this.ObtenerPersona);
        this.router.post('/postPersona', this.GuardarPersona);
        this.router.post('/deletePersona:cedula', this.BorrarPersona);
    };
    return ControladorPersona;
}());
exports.ControladorPersona = ControladorPersona;
//export
var PersonaRoutes = new ControladorPersona();
PersonaRoutes.routes();
exports.default = PersonaRoutes.router;
