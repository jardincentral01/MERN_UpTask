import mongoose from "mongoose";
import Proyecto from "../models/Proyecto.js";
import Usuario from "../models/Usuario.js";
import { generarError } from "../helpers/generarError.js";

const obtenerProyectos = async (req, res) =>{
    const { usuario } = req
    try{
        const proyectos = await Proyecto.find({
            '$or': [
                {'colaboradores': {$in: usuario}},
                {'creador': {$in: usuario}},
            ]
        }).select("nombre cliente creador")
        res.status(200).json(proyectos)
    }catch(error){
        error.message = 'Hubo un error.'
        return res.status(403).json({msg: error.message, error: true})
    }
    
}
const obtenerProyecto = async (req, res) =>{
    const error = new Error();
    const { usuario } = req
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        error.message = 'ID No Válido.'
        return res.status(403).json({msg: error.message, error: true})
    } 

    const proyecto = await Proyecto.findById(id).populate({
        path: "tareas",
        select: "-createdAt -updatedAt -__v",
        populate: {path: "completado", select: "nombre"}
    }).populate("colaboradores", "nombre email")
    if(!proyecto){
        error.message = 'Recurso No Existente.'
        return res.status(403).json({msg: error.message, error: true})
    } 

    if(proyecto.creador.toString() != usuario._id.toString() && !proyecto.colaboradores.some(colaborador => colaborador._id.toString() == usuario._id.toString())){
        error.message = 'Oops, no tienes permisos para este proyecto.'
        return res.status(403).json({msg: error.message, error: true})
    } 


    res.status(200).json(proyecto)
}

const nuevoProyecto = async (req, res) =>{
    const { usuario } = req
    const nuevoProyecto = new Proyecto(req.body)
    nuevoProyecto.creador = usuario._id

    try {
        const proyectoAlmacenado = await nuevoProyecto.save()
        res.status(201).json(proyectoAlmacenado)
    } catch (error) {
        error.message = 'Hubo un error.'
        return res.json({msg: error.message, error: true})
    }
}

const editarProyecto = async (req, res) =>{
    const error = new Error();
    const { usuario } = req
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        error.message = 'ID No Válido.'
        return res.status(403).json({msg: error.message, error: true})
    } 

    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        error.message = 'Recurso No Existente.'
        return res.status(403).json({msg: error.message, error: true})
    } 

    if(proyecto.creador.toString() != usuario._id.toString()){
        error.message = 'Oops, no tienes permisos para este proyecto.'
        return res.status(403).json({msg: error.message, error: true})
    } 

    //Usamos el operador || porque evita undefined, null, '', 0 
        // el operador ?? solo evita undefined y null
    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoEditado = await proyecto.save()
        res.json(proyectoEditado)

    } catch (error) {
        error.message = 'Error Interno: No se pudo editar el proyecto :('
        return res.status(403).json({msg: error.message, error: true})
    }
}

const eliminarProyecto = async (req, res) =>{
    const error = new Error();
    const { usuario } = req
    const { id } = req.params;
    if(!mongoose.Types.ObjectId.isValid(id)){
        error.message = 'ID No Válido.'
        return res.status(403).json({msg: error.message, error: true})
    } 

    const proyecto = await Proyecto.findById(id)
    if(!proyecto){
        error.message = 'Proyecto no existente.'
        return res.status(403).json({msg: error.message, error: true})
    } 

    if(proyecto.creador.toString() != usuario._id.toString()){
        error.message = 'Oops, no tienes permisos para este proyecto.'
        return res.status(403).json({msg: error.message, error: true})
    }

    try {
        await proyecto.deleteOne()
        res.json({msg: "Proyecto Eliminado Correctamente"})
    } catch (error) {
        error.message = 'Error Interno: No se pudo eliminar el proyecto :('
        return res.status(403).json({msg: error.message, error: true})
    }
}

const buscarColaborador = async (req, res) =>{
    const { email } = req.body
    const { usuario } = req
    const usuarioBusqueda = await Usuario.findOne({email}).select('_id email nombre')
    if(!usuarioBusqueda) return generarError(404, "No encontramos a un usuario con ese email. Verifica el email.", res)
    if(usuario._id.toString() == usuarioBusqueda._id.toString()) return generarError(400, "El creador del proyecto no puede agregarse como colaborador.", res)

    res.json(usuarioBusqueda)
}

const agregarColaborador = async (req, res) =>{
    const { email } = req.body
    const { usuario } = req
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return generarError(403, "Id No Válido.", res)

    const proyecto = await Proyecto.findById(req.params.id)
    if(!proyecto) return generarError(404, "Proyecto No Encontrado", res)
    if(usuario._id.toString() != proyecto.creador.toString()) return generarError(403, "No Tienes Permisos Para Añadir Colaboradores.", res)

    const usuarioBusqueda = await Usuario.findOne({email}).select('_id email nombre')
    if(!usuarioBusqueda) return generarError(404, "No encontramos a un usuario con ese email. Verifica el email.", res)
    if(proyecto.creador.toString() == usuarioBusqueda._id.toString()) return generarError(400, "El creador del proyecto no puede agregarse como colaborador.", res)

    if(proyecto.colaboradores.includes(usuarioBusqueda._id)) return generarError(400, "Ese Email Ya Se Encuentra En Tu Equipo De Colaboradores.", res)

    proyecto.colaboradores.push(usuarioBusqueda._id)
    await proyecto.save()

    res.json({msg: '¡Colaborador Añadido Correctamente!'})
}

const eliminarColaborador = async (req, res) =>{
    const { id } = req.body
    const { usuario } = req
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) return generarError(403, "Id No Válido.", res)

    const proyecto = await Proyecto.findById(req.params.id)
    if(!proyecto) return generarError(404, "Proyecto No Encontrado", res)
    if(usuario._id.toString() != proyecto.creador.toString()) return generarError(403, "No Tienes Permisos Para Eliminar Colaboradores.", res)

    proyecto.colaboradores.pull(id)
    await proyecto.save()

    res.json({msg: '¡Colaborador Eliminado Correctamente!'})
}


export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
}