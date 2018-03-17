const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// Connect
const connection = (closure) => {
    return MongoClient.connect('mongodb://localhost:27017/connect4', (err, client) => {
    if (err) return console.log(err);
    
    let db = client.db('connect4');
    closure(db);
    });
    };
// Error handling
const sendError = (err, res) => {
    response.status = 501;
    response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};
// Response handling
let response = {
    status: 200,
    data: [],
    message: null
};
// Post usuario
router.post('/postUsuario', (req, res) => {
    var idUsuario   = req.query.idUsuario;
    var nick        = req.query.nick;
    var det         = req.query.det;
    connection((db) => {
        if(nick!=""){
            res.json(false);
        }
        else{
            db.eval("cUsuario("+idUsuario+",'"+nick+"','"+det+"')", function(error, result) { 
                response.data=result;
                res.json(response.data);
            });
        }
    });
});

// Post chat
router.post('/postChat', (req, res) => {
    idEmisor    = req.query.idEmisor;
    idReceptor  = req.query.idReceptor;
    msg         = req.query.msg;
    connection((db) => {
        db.eval("chat("+idEmisor+","+idReceptor+",'"+msg+"')", function(error, result) { 
            response.data=result;
            res.json(response.data);
        });
    });
});

// Post finPartida
router.post('/finPartida', (req, res) => {
    var idPartida = req.query.idPartida;
    connection((db) => {
            db.eval("finalizarPartida("+idPartida+")", function(error, result) { response.data=result;res.json(response.data) });
    });
});

// Post finRonda
router.post('/finRonda', (req, res) => {
    var idPartida=req.query.idPartida;
    var ronda=req.query.ronda;
    var idFinalizador = req.query.idFinalizador;
    var razon = req.query.razon;
    connection((db) => {
            db.eval("finalizarRonda("+idPartida+","+ronda+","+idFinalizador+",'"+razon+"')", function(error, result) { response.data=result;res.json(response.data) });
    });
});

// Get getChatlog
router.get('/getChatlog', (req, res) => {
    idOne   = req.query.idOne;
    idTwo   = req.query.idTwo;
    connection((db) => {
            db.eval("getChatLog("+idOne+","+idTwo+")", function(error, result) { 
                response.data=[];
                var fechaOne;
                var fechaTwo;

                while(Object.keys(result[0].log).length>0 || Object.keys(result[1].log).length>0){
                    if(Object.keys(result[0].log).length>0 && Object.keys(result[1].log).length>0){
                        fechaOne = Date.parse(result[0].log[0]);
                        fechaTwo = Date.parse(result[1].log[0]);
                        if(fechaOne<fechaTwo)
                            response.data.unshift([0,result[0].log.shift()[1]]);
                        else
                            response.data.unshift([1,result[1].log.shift()[1]]);
                    }
                    else if(Object.keys(result[0].log).length>0){
                        while(Object.keys(result[0].log).length>0)
                            response.data.unshift([0,result[0].log.shift()[1]]);
                    }
                    else{
                        while(Object.keys(result[1].log).length>0)
                            response.data.unshift([1,result[1].log.shift()[1]]);
                    }
                }
                res.json(response.data.reverse()) });
    });
});

// Get getGamelog
router.get('/getGamelog', (req, res) => {
    idPartida = req.query.idPartida;
    ronda = req.query.ronda;
    connection((db) => {
            db.eval("getChatLog("+idPartida+","+ronda+")", function(error, result) { response.data=result;res.json(response.data) });
    });
});

// Get getInfoPartida
router.get('/getInfoPartida', (req, res) => {
    var idPartida = req.query.idPartida;
    connection((db) => {
            db.eval("getInfoPartida("+idPartida+")", function(error, result) { response.data=result;res.json(response.data) });
    });
});

// Get getInfoRonda
router.get('/getInfoRonda', (req, res) => {
    var idPartida=req.query.idPartida;
    var ronda=req.query.ronda;
    connection((db) => {
            db.eval("getInfoRonda("+idPartida+","+ronda+")", function(error, result) { response.data=result;res.json(response.data) });
    });
});

// Get getTablero
router.get('/getTablero', (req, res) => {
    var idPartida=req.query.idPartida;
    var ronda=req.query.ronda;
    connection((db) => {
            db.eval("getTablero("+idPartida+","+ronda+")", function(error, result) { response.data=result;res.json(response.data) });
    });
});

// Post jugada
router.post('/jugada', (req, res) => {
    var idPartida=req.query.idPartida;
    var ronda=req.query.ronda;
    var fila = req.query.fila;
    var columna = req.query.columna;
    connection((db) => {
            db.eval("jugada("+idPartida+","+ronda+","+fila+","+columna+")", function(error, result) { response.data=result;res.json(response.data) });
    });
});

// Post linkUsuarioPartida
router.post('/linkUsuarioPartida', (req, res) => {
    var idPartida=req.query.idPartida;
    var idUsuario=req.query.idUsuario;
    var color=req.query.color;
    connection((db) => {
            db.eval("linkUsuarioPartida("+idPartida+","+idUsuario+",'"+color+"')", function(error, result) { response.data=result;res.json(response.data) });
    });
});

// Post nuevaSesion
router.post('/nuevaSesion', (req, res) => {
    var idJ1 = req.query.idJ1;
    var color1 = req.query.color1;
    var idJ2 = req.query.idJ2;
    var color2 = req.query.color2;
    var size = req.size;
    var lineSize = req.lineSize;
    var nRondas = req.nRondas;
    connection((db) => {
            db.eval("nuevaSesion("+idJ1+",'"+color1+"',"+idJ2+",'"+color2+"',"+size+","+lineSize+","+nRondas+")", function(error, result) { response.data=result;res.json(response.data) });
    });
});

// Post uDetalles
router.post('/uDetalles', (req, res) => {
    var idUsuario = req.query.idUsuario;
    var det = req.query.det;
    connection((db) => {
            db.eval("uDetalles("+idUsuario+",'"+det+"')", function(error, result) { response.data=result;res.json(response.data) });
    });
});

// Post uNickname
router.post('/uNickname', (req, res) => {
    var idUsuario = req.query.idUsuario;
    var nick = req.query.nick;
    connection((db) => {
            db.eval("uNickname("+idUsuario+",'"+nick+"')", function(error, result) { response.data=result;res.json(response.data) });
    });
});
module.exports = router;