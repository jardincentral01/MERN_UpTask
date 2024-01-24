import Tarea from "../models/Tarea.js";
import Proyecto from "../models/Proyecto.js";
import mongoose from "mongoose";
import { generarError } from "../helpers/generarError.js";

const agregarTarea = async (req, res) =>{
    const error = new Error()
    const { proyecto } = req.body
    const { usuario } = req
    if(!mongoose.Types.ObjectId.isValid(proyecto)){
        error.message = 'Id No Válido.'
        return res.status(404).json({msg: error.message, error: true})
    }
    const existeProyecto = await Proyecto.findById(proyecto)
    if(!existeProyecto){
        error.message = 'Proyecto no existente.'
        return res.status(404).json({msg: error.message, error: true})
    }
    if(existeProyecto.creador.toString() !== usuario._id.toString()){
        error.message = 'Oops, no tienes permisos para añadir tareas.'
        return res.status(403).json({msg: error.message, error: true})
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body)
        //Almacenar el ID en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()
        res.json(tareaAlmacenada)
    } catch (error) {
        error.message = 'Error Interno.'
        return res.status(403).json({msg: error.message, error: true})
    }
}

const obtenerTarea = async (req, res) =>{
    const error = new Error()
    const { id } = req.params
    const { usuario } = req

    if(!mongoose.Types.ObjectId.isValid(id)){
        error.message = 'Id No Válido.'
        return res.status(403).json({msg: error.message, error: true})
    }

    const tarea = await Tarea.findById(id).populate('proyecto', '-__v');
    if(!tarea){
        error.message = 'Tarea no existente.'
        return res.status(404).json({msg: error.message, error: true})
    }
    if(tarea.proyecto.creador.toString() !== usuario._id.toString()){
        error.message = 'Oops, no tienes permisos para acceder a esta tarea.'
        return res.status(403).json({msg: error.message, error: true})
    }

    res.json(tarea)
}

const actualizarTarea = async (req, res) =>{
    const error = new Error()
    const { id } = req.params
    const { usuario } = req

    if(!mongoose.Types.ObjectId.isValid(id)){
        error.message = 'Id No Válido.'
        return res.status(403).json({msg: error.message, error: true})
    }

    const tarea = await Tarea.findById(id).populate('proyecto', '-__v');
    if(!tarea){
        error.message = 'Tarea no existente.'
        return res.status(404).json({msg: error.message, error: true})
    }
    if(tarea.proyecto.creador.toString() !== usuario._id.toString()){
        error.message = 'Oops, no tienes permisos para acceder a esta tarea.'
        return res.status(403).json({msg: error.message, error: true})
    }

    tarea.nombre = req.body.nombre || tarea.nombre
    tarea.descripcion = req.body.descripcion || tarea.descripcion
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega
    tarea.prioridad = req.body.prioridad || tarea.prioridad

    try {
        const tareaActualizada = await tarea.save()
        res.json(tareaActualizada)
    } catch (error) {
        error.message = 'Error Interno.'
        return res.status(403).json({msg: error.message, error: true})
    }
}

const eliminarTarea = async (req, res) =>{
    const error = new Error()
    const { id } = req.params
    const { usuario } = req

    if(!mongoose.Types.ObjectId.isValid(id)){
        error.message = 'Id No Válido.'
        return res.status(403).json({msg: error.message, error: true})
    }

    const tarea = await Tarea.findById(id).populate('proyecto', '-__v');
    if(!tarea){
        error.message = 'Tarea no existente.'
        return res.status(404).json({msg: error.message, error: true})
    }
    if(tarea.proyecto.creador.toString() !== usuario._id.toString()){
        error.message = 'Oops, no tienes permisos para acceder a esta tarea.'
        return res.status(403).json({msg: error.message, error: true})
    }

    const proyecto = await Proyecto.findById(tarea.proyecto._id)
    proyecto.tareas.pull(tarea._id)

    try {
        await Promise.allSettled([ await tarea.deleteOne(), await proyecto.save() ])
        res.json({msg: 'Tarea Eliminada.'})
    } catch (error) {
        return generarError(403, "Error Interno.", res)
    }
}

const cambiarEstado = async (req, res) =>{
    const { id } = req.params
    const { usuario } = req
    if(!mongoose.Types.ObjectId.isValid(id)) return generarError(403, 'Id No Válido.', res)

    const tarea = await Tarea.findById(id).populate('proyecto', '-__v')
    if(!tarea) return generarError(404, 'Tarea no existente.', res)
    if(tarea.proyecto.creador.toString() !== usuario._id.toString() && !tarea.proyecto.colaboradores.some(colaborador => colaborador.toString() == usuario._id.toString())) return generarError(403, 'Oops, no tienes permisos para acceder a esta tarea.', res)

    if(tarea.estado == false && tarea.completado == null){
        tarea.estado = !tarea.estado
        tarea.completado = usuario._id
    }else if(tarea.completado.toString() == usuario._id.toString() && tarea.estado == true){
        tarea.estado = !tarea.estado
        tarea.completado = null
    }else{
        return generarError(403, "No puedes descompletar la tarea.", res)
    }

    try {
        const nuevaTarea = await tarea.save()
        res.json(await nuevaTarea.populate("completado", "nombre"))
    } catch (error) {
        return generarError(403, "Error Interno.", res)
    }
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado,
}