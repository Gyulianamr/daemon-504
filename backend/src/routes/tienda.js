/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Heysser Machado
 * Tarea A3-13 · Rama: feature/a3-tienda · Turno 6 (fecha máxima: lunes 23 de noviembre)
 * Commit: "feat(tienda): endpoints de /api/tienda y /api/santuario"
 * ═══════════════════════════════════════════════════════════════════ */
// Rutas de /api/tienda (se montan con requiereSesion y exigirPersonaje en routes/index.js).
import { Router } from 'express';
import * as c from '../controllers/tienda.js';

const router = Router();

router.get('/', c.obtener); // GET /api/tienda
router.post('/comprar', c.comprar); // POST /api/tienda/comprar { objetoId, cantidad }

export default router;
