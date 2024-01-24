import express from "express"
import dotenv from 'dotenv'
import conectarDB from "./config/db.js"
import usuarioRoutes from "./routes/usuarioRoutes.js"
import proyectoRoutes from "./routes/proyectoRoutes.js"
import tareaRoutes from "./routes/tareaRoutes.js"
import cors from 'cors'

const app = express()
app.use(express.json())
dotenv.config()

conectarDB()

// CORS
const whitelist = [
    process.env.FRONTEND_URL
]

const corsOptions = {
    origin: function(origin, callback){
        if(whitelist.includes(origin)){
            callback(null, true)
        }else{
            callback(new Error('CORS: Error'))
        }
    }
}

app.use(cors(corsOptions));

//ROUTING

//Usuarios
app.use('/api/usuarios', usuarioRoutes)

//Proyectos
app.use('/api/proyectos', proyectoRoutes)

//Proyectos
app.use('/api/tareas', tareaRoutes)


const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    console.log(`Servidor corriendo en ${PORT}`)
})

// Socket.io
import { Server } from 'socket.io'

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors:{
        origin: process.env.FRONTEND_URL
    }
})

io.on("connection", (socket) =>{
    console.log("Conectado a Socket.io")

    //Definir los eventos de Socket.io
    socket.on("abrir-proyecto", (id) =>{
        socket.join(`${id}`)
    })
    socket.on("nueva-tarea", (tarea) =>{
        socket.to(tarea.proyecto).emit("tarea-agregada", tarea)
    })
    socket.on("eliminar-tarea", (tarea) =>{
        socket.to(tarea.proyecto).emit("tarea-eliminada", tarea)
    })
    socket.on("editar-tarea", (tarea) =>{
        socket.to(tarea.proyecto._id).emit("tarea-editada", tarea)
    })
    socket.on("completar-tarea", (tarea) =>{
        socket.to(tarea.proyecto._id).emit("tarea-completada", tarea)
    })
})