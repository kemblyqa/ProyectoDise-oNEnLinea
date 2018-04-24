import * as http from 'http';
import * as debug from 'debug';
//importar servidor
import Server from './server';

debug('ts-express:server');
//definir el puerto
const port = normalizePort(process.env.PORT || 3000);
Server.set('port', port);

console.log(`Server listening on port ${port}`);
//iniciar el servidor en modo escucha
const server = http.createServer(Server);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

//convertir el puerto a numero
function normalizePort(val: number|string): number|string|boolean {
    let port: number = (typeof val === 'string') ? parseInt(val, 10) : val;
    if (isNaN(port)) return val;
    else if (port >= 0) return port;
    else return false;
}

//manejo de errores
function onError(error: NodeJS.ErrnoException): void {
    if (error.syscall !== 'listen') throw error;
    let bind = (typeof port === 'string') ? 'Pipe ' + port : 'Port ' + port;
    switch(error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
}

//notificación de escucha
function onListening(): void {
    let addr = server.address();
    let bind = (typeof addr === 'string') ? `pipe ${addr}` : `port ${addr.port}`;
    debug(`Listening on ${bind}`);
}