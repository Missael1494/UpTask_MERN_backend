import generarId from "../helpers/generarId.js";
import Usuario from "../models/Usuario.js";
import generarJWT from "../helpers/generarJWT.js";
import { emailOlvidePassword, emailRegistro } from "../helpers/email.js";


const registrar = async (req, res) => {
    //console.log(req.body); //req es la informacion que envio
    // Evitar registros duplicados
    const { email } = req.body;
    const existeUsuario = await Usuario.findOne({ email }); //email: email

    //console.log(existeUsuario);
    if(existeUsuario) {
        const error = new Error('Usuario ya registrado');
        return res.status(400).json({msg: error.message});
    }

    try {
        const usuario = new Usuario(req.body);
        usuario.token = generarId();
        //const usuarioAlmacenado = await usuario.save();
        await usuario.save();

        // Enviar el email de confirmación
        //console.log(usuario);
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token,
        })

        //res.json(usuarioAlmacenado);
        res.json({msg: "Usuario Creado Correctamente, Revisa tu Email para confirmar tu cuenta"});
        //res.json({msg: "Creando Usuario"});
    } catch (error) {
        console.log(error);
    }
}

const autenticar = async (req, res) => {

    const { email, password } = req.body;
    // COMPROBAR SI EL USUARIO EXISTE
    const usuario = await Usuario.findOne({ email });
    console.log(usuario);
    if(!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message})
    }

    // Comprobar si el usuario esta confirmado
    if(!usuario.confirmado) {
        const error = new Error("Tu cuenta no ha sido confirmada");
        return res.status(403).json({msg: error.message})
    }
    // Comprobar su password
    if(await usuario.comprobarPassword(password)) { // por eso podemos acceder con this.password porque ya tenemos al usuario encontrado
        //console.log("Es correcto");
        res.json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    } else {
        const error = new Error("El password es incorrecto");
        return res.status(403).json({msg: error.message})
    }
};

const confirmar = async (req, res) => {
    //console.log("routing dinamico")
    //console.log(req.params.token); // express la genera dinamicamente 
    const { token } = req.params
    const usuarioConfirmar = await Usuario.findOne({ token });

    if(!usuarioConfirmar) {
        const error = new Error("Token no valido");
        return res.status(403).json({msg: error.message});
    }
    
    try {
        //console.log(usuarioConfirmar);
        usuarioConfirmar.confirmado = true;
        usuarioConfirmar.token = "";  //token de un solo uso para confirmar la cuenta
        await usuarioConfirmar.save();
        res.json({msg: 'Usuario Confirmado correctamente'})
    } catch (error) {
        console.log(error);
    }

    console.log(usuarioConfirmar);

}

const olvidePassword = async (req, res) => {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email });
    //console.log(usuario);
    if(!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({msg: error.message})
    }

    try {
        usuario.token = generarId();
        await usuario.save();

        // Enviar email 
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token,
        })
        res.json({msg: 'Hemos enviado un email con las instrucciones'})
    } catch (error) {
        console.log(error);
    }
}

const comprobarToken = async (req, res) => { 
    const { token } = req.params;

    const tokenValido = await Usuario.findOne({ token });

    if(tokenValido) {
        //console.log("token valido");
        res.json({ msg: 'Token válido y el Usuario existe'})
    } else {
        //console.log("Token no valido");
        const error = new Error("token no valido");
        return res.status(404).json({ msg: error.message });
    }
}


const nuevoPassword = async (req, res) => { 
    const { token } = req.params;
    const { password } = req.body;

    //console.log(token);
    //console.log(password);

    const usuario = await Usuario.findOne({ token });

    if(usuario) {
        //console.log("token valido");
        usuario.password = password;
        usuario.token = ''
        

        try {
            await usuario.save()
            res.json({msg: 'Password Modificado correctamente'})
        } catch (error) {
            console.log(error)
        }
    } else {
        //console.log("Token no valido");
        const error = new Error("token no valido");
        return res.status(404).json({ msg: error.message });
    }
}

const perfil = async (req, res) => {
    console.log('desde perfil...')
    const { usuario } = req;

    res.json(usuario);
}

export { registrar, autenticar, confirmar, olvidePassword, comprobarToken, nuevoPassword, perfil };


// si se envia propiedades que no soporta el modelo 
//te va insertar lo que requiere