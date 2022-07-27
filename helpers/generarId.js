
const generarId = () => {
    const random = Math.random().toString(32).substring(2); // el substrin quita los dos primeros caracteres
    const fecha = Date.now().toString(32);
    return ( random + fecha );
}
 
export default generarId;