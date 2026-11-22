/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A3-07 · Rama: feature/a3-mundo · Turno 3 (fecha máxima: viernes 20 de noviembre)
 * Commit: "feat(mundo): endpoints de /api/mundo"
 * ═══════════════════════════════════════════════════════════════════ */
// Controladores de /api/mundo.
import * as servicio from '../services/mundo.js';
import { textoRequerido } from '../middleware/validar.js';

export async function obtenerActual(req, res) {
  res.json(await servicio.obtenerZonaActual(req.personajeId));
}

export async function mover(req, res) {
  const destino = textoRequerido(req.body?.destino, 'Indica a qué zona quieres ir.');
  res.json(await servicio.moverA(req.personajeId, destino));
}
