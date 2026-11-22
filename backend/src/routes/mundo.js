/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A3-07 · Rama: feature/a3-mundo · Turno 3 (fecha máxima: viernes 20 de noviembre)
 * Commit: "feat(mundo): endpoints de /api/mundo"
 * ═══════════════════════════════════════════════════════════════════ */
import { Router } from 'express';
import * as c from '../controllers/mundo.js';

const router = Router();

router.get('/actual', c.obtenerActual); // GET /api/mundo/actual
router.post('/mover', c.mover); // POST /api/mundo/mover { destino }

export default router;


