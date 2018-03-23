// importar schema y modelo
import { Schema, model } from 'mongoose';

// hacemos el modelo
const EsquemaPersona: Schema = new Schema({
    Cedula :{
        type : Number,
        required : true
    },
    Nombre: {
        type: String,
        default : 'No ingreso nombre',
        required : true
    },
    Apellidos : {
        type : String,
        required : true
    },
    edad : {
        type : Number,
        required : true
    },
    direccion : {
        type : String,
        required : true
    },
    fechaNacimiento : {
        type : Date,
        required : true
    },
    hijos : {
        type : Array
    }
});

export default model('Personas', EsquemaPersona);
