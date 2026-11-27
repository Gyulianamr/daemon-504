/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A4-12 · Rama: feature/a4-progreso · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(progreso): endpoint GET /api/progreso"
 * ═══════════════════════════════════════════════════════════════════ */
import { Router } from 'express';
import * as c from '../controllers/progreso.js';

const router = Router();

router.get('/', c.obtener); // GET /api/progreso

export default router;
