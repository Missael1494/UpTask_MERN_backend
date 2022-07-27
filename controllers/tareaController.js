import Proyecto from "../models/Proyecto.js";
import Tarea from "../models/Tarea.js";


const agregarTarea = async (req, res) => {
    const { proyecto } = req.body;
    console.log('Proyecto', proyecto)
    console.log('REQ_USUARIO', req.usuario)

    const existeProyecto = await Proyecto.findById(proyecto);

    if(!existeProyecto) {
        const error = new Error("El Proyecto no existe");
        return res.status(404).json({msg: error.message});
    }

    if(existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los permisos para añadir tareas");
        return res.status(403).json({msg: error.message});
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body);
        // Almacenar el ID en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id);
        await existeProyecto.save();
        res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error);
    }
    console.log(existeProyecto);

};

const obtenerTarea = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto");
    //const { proyecto } = tarea;    //mejor usamos populate para no hacer dos consultas
    //const existeProyecto = await Proyecto.findById(proyecto);
    if(!tarea) {
        const error = new Error("Tarea no encontrada");
        return res.status(404).json({msg: error.message});
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no valida");
        return res.status(403).json({msg: error.message});
    }

    res.json(tarea);

    //console.log(id);
    //console.log(tarea);
    //console.log(existeProyecto);
};

const actualizarTarea = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto");
    
    if(!tarea) {
        const error = new Error("Tarea no encontrada");
        return res.status(404).json({msg: error.message});
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no valida");
        return res.status(403).json({msg: error.message});
    }

    tarea.nombre = req.body.nombre || tarea.nombre;
    tarea.descripcion = req.body.descripcion || tarea.descripcion;
    tarea.prioridad = req.body.prioridad || tarea.prioridad;
    tarea.fechaEntrega = req.body.fechaEntrega || tarea.fechaEntrega;

    try {
        const tareaAlmacenada = await tarea.save();
        res.json(tareaAlmacenada);
    } catch (error) {
        console.log(error)
    }

};

const eliminarTarea = async (req, res) => {
    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto");
    
    if(!tarea) {
        const error = new Error("Tarea no encontrada");
        return res.status(404).json({msg: error.message});
    }

    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Acción no valida");
        return res.status(403).json({msg: error.message});
    }

    try {
        //borramos la tarea en la base de datos de tareas pero tambien hay  que borrar esa tarea en proyectos
        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)
        //await proyecto.save()


        //await tarea.deleteOne();

        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])
        res.json({msg: "Tarea Eliminada"})
    } catch (error) {
        console.log(error)
    }
};

const cambiarEstado = async (req, res) => {
    console.log(req.params.id)

    const { id } = req.params;

    const tarea = await Tarea.findById(id).populate("proyecto")//.populate('completado');

    console.log(tarea)
    
    if(!tarea) {
        const error = new Error("Tarea no encontrada");
        return res.status(404).json({msg: error.message});
    }
    //console.log(tarea)


    if(tarea.proyecto.creador.toString() !== req.usuario._id.toString() && !tarea.proyecto.
    colaboradores.some( colaborador => colaborador._id.toString() === req.usuario._id.toString())
    ) {
        const error = new Error("Acción no valida");
        return res.status(403).json({msg: error.message});
    }

    tarea.estado = !tarea.estado;
    tarea.completado = req.usuario._id

    await tarea.save()

    const tareaAlmacenada = await Tarea.findById(id).populate("proyecto").populate('completado');

    res.json(tareaAlmacenada) // resuelve el apartado de "completado por: nombre"
    console.log(!tarea.estado)

};

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}