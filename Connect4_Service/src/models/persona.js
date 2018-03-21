"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// importar schema y modelo
var mongoose_1 = require("mongoose");
//hacemos el modelo
var EsquemaPersona = new mongoose_1.Schema({
    Cedula: {
        type: Number,
        required: true
    },
    Nombre: {
        type: String,
        default: 'No ingreso nombre',
        required: true
    },
    Apellidos: {
        type: String,
        required: true
    },
    edad: {
        type: Number,
        required: true
    },
    direccion: {
        type: String,
        required: true
    },
    fechaNacimiento: {
        type: Date,
        required: true
    },
    hijos: {
        type: Array
    }
});
exports.default = mongoose_1.model('Personas', EsquemaPersona);
