/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jenifer Padilla
 * Tarea A3-11 · Rama: feature/a3-captura · Turno 5 (fecha máxima: domingo 22 de noviembre)
 * Commit: "feat(captura): endpoint POST /api/encuentros/:id/capturar"
 * ═══════════════════════════════════════════════════════════════════ */
// Lee y valida el formato de la solicitud (id del encuentro, turno y esfera) y llama al servicio.
import { capturar as capturarCriatura } from '../services/captura.js';
import { leerAccion } from './encuentros.js';
import { enteroPositivo } from '../middleware/validar.js';

// POST /api/encuentros/:id/capturar { turno, objetoId }
export async function capturar(req, res) {
  const { encuentroId, turno } = leerAccion(req);
  const objetoId = enteroPositivo(req.body?.objetoId, 'El id de la esfera debe ser un número entero mayor que 0.');
  res.json(await capturarCriatura(req.personajeId, encuentroId, turno, objetoId));
}