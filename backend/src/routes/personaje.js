/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(auth): endpoints de /api/acceso con sesión por token"
 * ═══════════════════════════════════════════════════════════════════ */
// Rutas de /api/personaje. Crear solo necesita usuario (todavía no tiene personaje); las demás exigen también personaje.
import { Router } from 'express';
import { requiereSesion } from '../middleware/sesion.js';
import { exigirPersonaje } from '../middleware/exigirPersonaje.js';
import * as c from '../controllers/personaje.js';

const router = Router();
const jugador = [requiereSesion, exigirPersonaje];

router.post('/', requiereSesion, c.crear); // POST /api/personaje { nombre, criaturaInicialId }
router.get('/', jugador, c.consultar); // GET /api/personaje
router.patch('/', jugador, c.renombrar); // PATCH /api/personaje { nombre }
router.delete('/', jugador, c.eliminar); // DELETE /api/personaje

export default router;
