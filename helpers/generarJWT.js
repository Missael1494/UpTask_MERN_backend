import jwt from "jsonwebtoken";

const generarJWT = (id) => {
    return jwt.sign( { id }, process.env.JWT_SECRET, { //generar un json webtoken
        expiresIn: "30d",
    } )
}

export default generarJWT;