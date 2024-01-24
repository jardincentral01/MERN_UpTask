import Usuario from "../models/Usuario.js"
import generarId from "../helpers/generarId.js"
import generarJWT from "../helpers/generarJWT.js"
import { emailPassword, emailRegistro } from "../helpers/emails.js"
import { generarError } from "../helpers/generarError.js"

const registrar = async (req, res) =>{

    //Evitar registros duplicados
    const { email } = req.body
    const usuarioRepetido = await Usuario.findOne({email})
    if(usuarioRepetido){
        const error = new Error('Ese correo ya está ocupado.') 
        return res.status(409).json({msg: error.message, error: true})
    } 

    try {
        const usuario = new Usuario(req.body)
        usuario.token = generarId();
        await usuario.save()
        //Enviar Email de Confirmacion
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })
        res.json({
            msg: 'Usuario Creado Con Éxito. Revisa Tu Email para confirmar tu cuenta',
            error: false
        })
    } catch (error) {
        console.log(error)
    }
}

const autenticar = async (req, res) =>{
    const {email, password} = req.body
    const error = new Error();
    //Comprobar que el usuario existe
    const usuario = await Usuario.findOne({email})
    if(!usuario){
        error.message = "Oops, parece que no hay ninguna cuenta vinculada a ese correo electrónico."
        return res.status(404).json({msg: error.message, error: true})
    }
    //Comprobar que esta confirmado
    if(!usuario.confirmado){
        error.message = 'Este usuario no ha sido confirmado mediante correo electrónico.'
        return res.status(403).json({msg: error.message, error: true})
    }

    //Comprobar el password
    if(await usuario.comprobarPassword(password)){
        res.status(201).json({
            _id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    }else{
        error.message = 'Correo electrónico o Contraseña son incorrectos. Vuelve a intentarlo.'
        res.status(403).json({msg: error.message, error: true})
    }
}

const confirmar = async (req, res) =>{
    const { token } = req.params
    const error = new Error();
    const usuarioConfirmar = await Usuario.findOne({token})
    // Confirmar que existe usuarios con ese token
    if(!usuarioConfirmar || usuarioConfirmar.confirmado == true){
        error.message = 'Token No Válido.'
        return res.status(403).json({msg: error.message, error: true})
    }

    try {
        // Resetear el token y confirmar usuario
        usuarioConfirmar.token = ''
        usuarioConfirmar.confirmado = true
        await usuarioConfirmar.save()
        res.status(201).json({msg: 'Usuario Confirmado Correctamente.'})
    } catch (error) {
        error.message = 'Hubo un error.'
        return res.status(403).json({msg: error.message,error: true})
    }
}

const olvidePassword = async (req, res) =>{
    const { email } = req.body;
    const usuario = await Usuario.findOne({email})
    //Confirma que existe usuario con ese email
    if(!usuario){
        return generarError(404, "Oops, parece que no hay ninguna cuenta vinculada a ese correo electrónico.", res)
    }
    try {
        usuario.token = generarId();
        await usuario.save()
        emailPassword({email, nombre: usuario.nombre, token: usuario.token})
        res.status(201).json({msg: "Revisa tu correo electrónico para restablecer tu contraseña. ¡Verifica también la carpeta de spam!"})
    } catch (error) {
        return generarError(403, 'Hubo un error.', res)
    }
}

const comprobarToken = async (req, res) => {
    const { token } = req.params
    const error = new Error()
    const usuario = await Usuario.findOne({token})
    if(!usuario){
        error.message = 'Hubo un error.'
        return res.status(404).json({msg: error.message, error: true})
    }
 
    res.status(201).json({msg: "Verficación Completada."})
}

const resetPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    const error = new Error()
    const usuario = await Usuario.findOne({token})
    if(!usuario){
        error.message = 'Hubo un error.'
        return res.status(404).json({msg: error.message,error: true})
    }

    usuario.password = password
    usuario.token = ''

    try {
        await usuario.save()
        res.status(201).json({msg: "¡Tu contraseña ha sido actualizada con éxito!"})
    } catch (error) {
        error.message = 'Error Interno.'
        return res.status(403).json({msg: error.message,error: true})
    }
}

const perfil = async (req, res) =>{
    const { usuario } = req;

    res.json(usuario)
}

export {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    resetPassword,
    perfil
}