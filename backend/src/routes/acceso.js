// Rutas de /api/acceso. Registro, inicio y cierre son públicas; /sesion exige token.
import { Router } from 'express';
import * as c from '../controllers/acceso.js';
import { requiereSesion } from '../middleware/sesion.js';

const router = Router();

router.post('/registro', c.registro);
router.post('/iniciar-sesion', c.iniciarSesion);
router.post('/cerrar-sesion', c.cerrarSesion);
router.get('/sesion', requiereSesion, c.sesion);

export default router;
