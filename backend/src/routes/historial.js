/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-03 · Rama: feature/a3-jugador · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(historial): endpoint GET /api/historial"
 * ═══════════════════════════════════════════════════════════════════ */
// Rutas de /api/historial (se montan con requiereSesion y exigirPersonaje en routes/index.js).
import { Router } from 'express';
import * as c from '../controllers/historial.js';

const router = Router();

router.get('/', c.listar); // GET /api/historial?tipo=&pagina=

export default router;
