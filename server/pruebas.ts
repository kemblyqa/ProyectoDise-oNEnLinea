import gameModel from './models/game.model';
import { callbackify } from 'util';
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
let modelo : gameModel = new gameModel([[-1,-1,-1,-1],[-1,-1,-1,-1],[-1,-1,0,-1],[-1,1,0,-1]],3);
let res = modelo.AIMove(0,1);
modelo.charGrid.forEach(x =>{
    console.log(x);
})
console.log(res);