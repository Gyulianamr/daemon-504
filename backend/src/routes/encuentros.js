import { Router } from 'express';
import * as c from '../controllers/encuentros.js';
import { capturar } from '../controllers/captura.js';

const router = Router();

router.get('/actual', c.obtenerActual);
router.post('/guardian', c.desafiarGuardian);
router.post('/:id/atacar', c.atacar);
router.post('/:id/curar', c.curar);
router.post('/:id/huir', c.huir);
router.post('/:id/capturar', capturar); 

export default router;
