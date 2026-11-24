/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A3-08 · Rama: feature/a3-exploracion · Turno 3 (fecha máxima: viernes 20 de noviembre)
 * Commit: "feat(exploracion): endpoint POST /api/exploracion"
 * ═══════════════════════════════════════════════════════════════════ */
// POST /api/exploracion → no recibe datos: el servidor sabe dónde está el jugador y decide el resultado.
import { explorar as explorarZona } from '../services/exploracion.js';

export async function explorar(req, res) {
  res.json(await explorarZona(req.personajeId));
}
