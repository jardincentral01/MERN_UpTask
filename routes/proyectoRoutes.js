import express from 'express'
import {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    agregarColaborador,
    eliminarColaborador,
    buscarColaborador
} from '../controllers/proyectoController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

// CRUD PROYECTOS
router.route('/')
    .get(checkAuth, obtenerProyectos) //Obtener Proyectos
    .post(checkAuth, nuevoProyecto) //Crear Proyecto

router.route('/:id')
    .get(checkAuth, obtenerProyecto) //Obtener Proyecto
    .put(checkAuth, editarProyecto) //Editar proyecto
    .delete(checkAuth, eliminarProyecto) //Eliminar Proyecto

// CRUD COLABORADORES Y BÚSQUEDA DE TAREAS DENTRO DEL PROYECTO
router.post('/colaboradores', checkAuth, buscarColaborador) //Agregar Colaborador
router.post('/colaboradores/:id', checkAuth, agregarColaborador) //Agregar Colaborador

    // Usamos post porque DELETE se usa cuando vas a eliminar un recurso completo, en este caso estamos eliminando una parte de un proyecto que sería un colaborador
router.post('/eliminar-colaborador/:id', checkAuth, eliminarColaborador) //Eliminar Colaborado
export default router