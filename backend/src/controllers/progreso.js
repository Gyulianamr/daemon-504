/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A4-12 · Rama: feature/a4-progreso · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(progreso): endpoint GET /api/progreso"
 * ═══════════════════════════════════════════════════════════════════ */
// Controlador de GET /api/progreso. El jugador sale de la sesión, no del cliente.
import * as servicio from '../services/progreso.js';

export async function obtener(req, res) {
  res.json(await servicio.obtenerProgreso(req.personajeId));
}
