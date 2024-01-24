import jwt from 'jsonwebtoken'
import Usuario from '../models/Usuario.js';

const checkAuth = async (req, res, next) =>{
    let token;
    const error = new Error('Hubo un error');
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.usuario = await Usuario.findById(decoded.id).select('-password -confirmado -token -createdAt -updatedAt -__v')
        } catch (error) {
            console.log(error)
            return res.status(404).json({msg: error.message})
        }
    }else{
        return res.status(403).json({msg: error.message})
    }

    next()
}

export default checkAuth