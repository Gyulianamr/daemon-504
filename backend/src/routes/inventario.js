/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-06 · Rama: feature/a3-inventario · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(inventario): endpoints de /api/inventario"
 * ═══════════════════════════════════════════════════════════════════ */
// Rutas de /api/inventario (se montan con requiereSesion y exigirPersonaje en routes/index.js).
import { Router } from 'express';
import * as c from '../controllers/inventario.js';

const router = Router();

router.get('/', c.listar); // GET /api/inventario
router.post('/usar', c.usar); // { objetoId, criaturaId }

export default router;
