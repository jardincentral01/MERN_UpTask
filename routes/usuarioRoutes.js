import express from 'express'
import { registrar, autenticar, confirmar, olvidePassword, comprobarToken, resetPassword, perfil } from '../controllers/usuarioController.js'
import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

// Autenticacion, registro y confirmación de usuarios
router.post('/', registrar) // Crea un nuevo usuario
router.post('/login', autenticar) // Autenticar usuario
router.get('/confirmar/:token', confirmar) // Confirmar Usuario
router.post('/olvide-password', olvidePassword) // Password Olvidada
router.route('/olvide-password/:token').get(comprobarToken).post(resetPassword) // Verifica token o reset pass

router.get('/perfil', checkAuth, perfil)


export default router