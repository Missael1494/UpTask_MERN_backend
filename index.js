//const express = require("express");
import express from 'express';
import conectarDB from './config/db.js';
import dotenv from 'dotenv';
import cors from 'cors' 
import usuarioRoutes from './routes/usuarioRoutes.js'
import proyectoRoutes from './routes/proyectoRoutes.js'
import tareaRoutes from './routes/tareaRoutes.js'


const app = express();
app.use(express.json());  // puede procesar la información de tipo json

dotenv.config();

conectarDB();

// Configurar CORS
const whitelist = [process.env.FRONTEND_URL];


const corsOptions = {
    origin: function (origin, callback) {
        //console.log(origin);
        if(whitelist.includes(origin)) { // sila url del frontend esta en la lista blanca permite acceder a las peticiones
            //Puede consultar la API
            callback(null, true);
        } else {
            // No esta permitido
            callback(new Error("Error de Cors"));
        }
    },
}

app.use(cors(corsOptions));


// Routing
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/proyectos', proyectoRoutes);
app.use('/api/tareas', tareaRoutes);


const PORT = 4000;
//console.log('Puerto', PORT)
// process.env.PORT ||
//console.log('desde index.js')

const servidor = app.listen(PORT, () => { //1
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})


// Socket.io 
import { Server } from "socket.io";

const io = new Server(servidor, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
})

io.on("connection", (socket) => {
    //console.log("conectado a socket io");

    //Definir los eventos de socket io
    /*socket.on('prueba', (proyectos) => {
        console.log("Prueba desde Socket io", proyectos)


        socket.emit('respuesta',  {nombre: "Misa"})
    })
    */

    socket.on('abrir proyecto', (proyecto) => {
     console.log("Desde el proyecto", proyecto); 
     socket.join(proyecto);  //entrar a cuarto

     socket.emit("respuesta", {nombre: "misa"})
    })

    socket.on('nueva tarea', tarea => {
        //console.log(tarea)
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on("actualizar tarea", (tarea) => {
        console.log(tarea) // toodo el objeto del proyecto
        const proyecto = tarea.proyecto._id;
        socket.to(proyecto).emit("tarea actualizada", tarea);
    })

    socket.on("cambiar estado", (tarea) => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    })
})