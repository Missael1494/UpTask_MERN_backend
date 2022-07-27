import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) => {
    //console.log("desde Checkauth.js");
    let token;
    //console.log(req.headers.authorization);
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {

        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            //console.log(token);
            //console.log(decoded);
            req.usuario = await Usuario.findById(decoded.id).select(//creadno una nueva variable req.usuario
                "-password -confirmado -token -__v")//select quita password

            console.log('reqUSUARIO', req.usuario)
            return next();
        } catch (error) {
            return res.status(404).json({msg: 'Hubo un error'});
        }
    }

    if(!token) {
        const error = new Error('Token no válido')
        return res.status(401).json({msg: error.message})
    }

    next()
}
 
export default checkAuth;