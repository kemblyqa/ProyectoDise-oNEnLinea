"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ControladorPersona_1 = require("./routes/ControladorPersona");
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var Server = /** @class */ (function () {
    function Server() {
        this.app = express();
        this.config();
        this.routes();
    }
    // application config
    Server.prototype.config = function () {
        var MONGO_URI = 'mongodb://localhost/WebsiteComunidad';
        mongoose.connect(MONGO_URI, {
            useMongoClient: true,
        });
        // express middleware
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());
        // cors
        this.app.use(function (req, res, next) {
            res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
            res.header('Access-Control-Allow-Credentials', 'true');
            next();
        });
    };
    // application routes
    Server.prototype.routes = function () {
        var router;
        router = express.Router();
        router.get('', function (req, res) {
            res.json({
                message: 'Ruta inicial del backend'
            });
        });
        this.app.use('/', router);
        this.app.use('/api', ControladorPersona_1.default);
    };
    return Server;
}());
// export
exports.default = new Server().app;
