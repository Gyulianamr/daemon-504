/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-02 · Rama: feature/a3-base-datos · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(catalogo): endpoint GET /api/catalogo"
 * ═══════════════════════════════════════════════════════════════════ */
// Rutas de /api/catalogo.
import { Router } from 'express';
import * as c from '../controllers/catalogo.js';

const router = Router();

router.get('/', c.obtener); // GET /api/catalogo

export default router;
