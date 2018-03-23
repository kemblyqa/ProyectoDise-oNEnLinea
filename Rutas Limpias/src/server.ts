import UserController from './routes/UserController';
import GameController from './routes/GameController';
import * as express from 'express';
import * as bodyParser from 'body-parser';

class Server{
    public app: express.Application;
    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }
    // application config
    public config() {

        // express middleware
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(bodyParser.json());

        // cors
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Credentials');
            res.header('Access-Control-Allow-Credentials', 'true');
            next();
        });
    }

    // application routes
    public routes(): void {

        let router: express.Router;
        router = express.Router();
        router.get('', (req, res) => {
            res.json({
                message: 'Ruta inicial del backend'
            })
        });
        this.app.use('/', router);
        this.app.use('/user', UserController);
        this.app.use('/game', GameController);
    }
}

// export
export default new Server().app;
