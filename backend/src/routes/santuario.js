/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Heysser Machado
 * Tarea A3-13 · Rama: feature/a3-tienda · Turno 6 (fecha máxima: lunes 23 de noviembre)
 * Commit: "feat(tienda): endpoints de /api/tienda y /api/santuario"
 * ═══════════════════════════════════════════════════════════════════ */
// Rutas de /api/santuario (se montan con requiereSesion y exigirPersonaje en routes/index.js).
import { Router } from 'express';
import * as c from '../controllers/tienda.js';

const router = Router();

router.post('/curar', c.curar); // POST /api/santuario/curar

export default router;
