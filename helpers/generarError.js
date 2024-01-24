
const generarError = (status, mensaje, res) => {
    const error = new Error(mensaje)
    res.status(status || 200).json({msg: error.message, error: true})
}

export {
    generarError
}