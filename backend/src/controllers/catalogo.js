/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-02 · Rama: feature/a3-base-datos · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(catalogo): endpoint GET /api/catalogo"
 * ═══════════════════════════════════════════════════════════════════ */
// Responde con el catálogo completo del juego. No requiere usuario: son datos públicos y fijos.
import { obtenerCatalogo } from '../models/catalogo.js';

// GET /api/catalogo
export async function obtener(req, res) {
  res.json(await obtenerCatalogo());
}
