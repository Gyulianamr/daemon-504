/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-05 · Rama: feature/a3-personaje · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(personaje): endpoints de /api/personaje"
 * ═══════════════════════════════════════════════════════════════════ */
// Rutas de /api/personaje. Crear solo necesita usuario (todavía no tiene personaje); las demás exigen también personaje.
import { Router } from 'express';
import { identificarJugador } from '../middleware/identificarJugador.js';
import { exigirPersonaje } from '../middleware/exigirPersonaje.js';
import * as c from '../controllers/personaje.js';

const router = Router();
const jugador = [identificarJugador, exigirPersonaje];

router.post('/', identificarJugador, c.crear); // POST /api/personaje { nombre, criaturaInicialId }
router.get('/', jugador, c.consultar); // GET /api/personaje
router.patch('/', jugador, c.renombrar); // PATCH /api/personaje { nombre }
router.delete('/', jugador, c.eliminar); // DELETE /api/personaje

export default router;
