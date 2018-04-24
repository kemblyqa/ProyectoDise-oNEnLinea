"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserController_1 = require("./routes/UserController");
var GameController_1 = require("./routes/GameController");
var express = require("express");
var bodyParser = require("body-parser");
var path = require('path');
var http = require('http');
//configuración del servidor node
var Server = (function () {
    function Server() {
        this.app = express();
        this.config();
        this.routes();
    }
    // application config
    Server.prototype.config = function () {
        // Angular DIST output folder
        this.app.use(express.static(path.join(__dirname, '../dist')));
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
    //rutas de frontend y backend
    Server.prototype.routes = function () {
        this.app.use('/user', UserController_1.default);
        this.app.use('/game', GameController_1.default);
        this.app.all('*', function (req, res) {
            res.sendFile(path.join(__dirname, '../dist/index.html'));
        });
    };
    return Server;
}());
// export
exports.default = new Server().app;
