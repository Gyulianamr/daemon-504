/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A3-08 · Rama: feature/a3-exploracion · Turno 3 (fecha máxima: viernes 20 de noviembre)
 * Commit: "feat(exploracion): endpoint POST /api/exploracion"
 * ═══════════════════════════════════════════════════════════════════ */
import { Router } from 'express';
import { explorar } from '../controllers/exploracion.js';

const router = Router();

router.post('/', explorar); // POST /api/exploracion

export default router;



