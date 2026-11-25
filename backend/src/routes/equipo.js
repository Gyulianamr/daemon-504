/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-04 · Rama: feature/a3-equipo · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(equipo): endpoints de /api/equipo"
 * ═══════════════════════════════════════════════════════════════════ */
// Rutas de /api/equipo (se montan con requiereSesion y exigirPersonaje en routes/index.js).
import { Router } from 'express';
import * as c from '../controllers/equipo.js';

const router = Router();

router.get('/', c.listar); // GET /api/equipo
router.patch('/:id/activa', c.hacerActiva); // pasa la criatura a la posición 1
router.patch('/:id/reserva', c.moverAReserva);
router.patch('/:id/equipo', c.moverAlEquipo);
router.patch('/:id/apodo', c.ponerApodo); // { apodo }
router.delete('/:id', c.liberar); // libera la criatura

export default router;
