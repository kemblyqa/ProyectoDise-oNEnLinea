export class BuildTablero{
    tablero:Array<any>;
    tam:number = 10;

    constructor(){
        this.tablero = [];
    }

    llenar() {
        for (let index = 0; index < this.tam; index++) {
            this.tablero.push(0);
        }
        console.log(this.tam);
    }

    tamTablero(){
        return this.tablero;
    }
}