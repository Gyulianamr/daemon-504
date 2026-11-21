/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-06 · Rama: feature/a3-inventario · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(inventario): endpoints de /api/inventario"
 * ═══════════════════════════════════════════════════════════════════ */
// Lee y valida el formato de la solicitud (objetoId y criaturaId) y llama al servicio.
import * as servicio from '../services/inventario.js';
import { enteroPositivo } from '../middleware/validar.js';

// GET /api/inventario
export async function listar(req, res) {
  res.json(await servicio.listarInventario(req.personajeId));
}

// POST /api/inventario/usar { objetoId, criaturaId }
export async function usar(req, res) {
  const objetoId = enteroPositivo(req.body?.objetoId, 'El id del objeto debe ser un número entero mayor que 0.');
  const criaturaId = enteroPositivo(req.body?.criaturaId, 'El id de la criatura debe ser un número entero mayor que 0.');
  res.json(await servicio.usarObjeto(req.personajeId, objetoId, criaturaId));
}
