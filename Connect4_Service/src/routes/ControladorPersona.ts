//importar objetos desde express
import { Router, Request, Response } from "express";
import Persona from "../models/persona";

export class ControladorPersona{
    router : Router;
    constructor(){
        this.router = Router();
        this.routes();
    }

    private ObtenerPersonas(req: Request, res: Response): void{
        //no se estan enviando condiciones
        Persona.find({})
            .then(data =>{
                res.json(data)
            })
            .catch(err =>{
                let status = req.statusCode;
                res.json({
                    status,
                    err
                })
            })
    }
    private ObtenerPersona(req: Request, res: Response): void{
        let cedula = req.params.cedula;
        Persona.find({Cedula:cedula})
        .then(persona =>{
            res.json(persona)
        })
        .catch(err =>{
            const status = req.statusCode;
            res.json({
                status,
                err
            })
        })
    }
    private GuardarPersona(req: Request, res: Response): void{
        let nombre: string = req.body.nombre;
        let cedula: number = req.body.cedula;
        let apellidos : string = req.body.apellidos;
        let edad : number = req.body.edad;
        let direccion : string = req.body.direccion;
        let fechaNacimiento = req.body.fechaNacimiento;
        let hijos : Array<any> = req.body.hijos;

        const persona = new Persona
        ({
            cedula,
            nombre,
            apellidos,
            edad,
            direccion,
            fechaNacimiento,
            hijos
        });
        persona.save()
        .then(personaGuardada =>{
            res.json({message: 'Persona guardada'})
        })
        .catch(err=>{
            let statusCode = req.statusCode;
            res.json({
                codigo: statusCode,
                error: err
            })
        })
    }
    private BorrarPersona(req: Request, res: Response): void{
        let cedula = req.params.cedula;
        Persona.findOneAndRemove( {Cedula:cedula} )
        .then(personaBorrada =>{
            res.json({Message: personaBorrada})
        })
        .catch(err =>{
            let statusCode = req.statusCode;
            res.json({
                codigo: statusCode,
                error: err
            })
        })
    }
    public routes(): void{
        this.router.get('/getAll',this.ObtenerPersonas);
        this.router.get('/getOne:cedula',this.ObtenerPersona);
        this.router.post('/postPersona', this.GuardarPersona);
        this.router.post('/deletePersona:cedula',this.BorrarPersona)
    }
}
//export
const PersonaRoutes = new ControladorPersona();
PersonaRoutes.routes();

export default PersonaRoutes.router;
