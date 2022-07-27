import mongoose from "mongoose";
import bcrypt from "bcrypt";

const usuarioSchema = mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    token: {
        type: String,
    },
    confirmado: {
        type: Boolean,
        default: false, //se genera por default cuando ingreso los datos que son requeridos
    }
    }, 
    {
        timestamps: true, // crea automaticamen en la based los datos de createdAt y updatedAt
    }
);

usuarioSchema.pre('save', async function(next) { //se ejecuta antes de ir a la base de datos para hashear el password
//await usuario.save => en Usuario.js en await usuario.save() 
    if(!this.isModified("password")){
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt); //genera el hash y se almacena en el password
})

usuarioSchema.methods.comprobarPassword = async function
    (passwordFormulario) {
        return await bcrypt.compare(passwordFormulario, this.password);  //comnparar los passwords
    }

// cuando se crea un usuario se genera automaticamente el id
const Usuario = mongoose.model("Usuario", usuarioSchema);
export default Usuario;