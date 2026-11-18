/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-03 · Rama: feature/a3-jugador · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(historial): endpoint GET /api/historial"
 * ═══════════════════════════════════════════════════════════════════ */
// Lee y valida el filtro y la página de la URL y responde con una página del historial.
import * as servicio from '../services/historial.js';
import { enteroPositivo } from '../middleware/validar.js';
import { fallar } from '../middleware/ErrorApi.js';

// GET /api/historial?tipo=CAPTURA&pagina=2  (los dos son opcionales; tipo vacío = todos)
export async function listar(req, res) {
  const { tipo, pagina } = req.query;
  if (tipo && !servicio.TIPOS.includes(tipo)) {
    fallar(400, `Tipo inválido. Usa uno de: ${servicio.TIPOS.join(', ')}.`);
  }
  const numeroPagina =
    pagina === undefined ? 1 : enteroPositivo(pagina, 'La página debe ser un número entero mayor que 0.');
  res.json(await servicio.listarHistorial(req.personajeId, { tipo: tipo || null, pagina: numeroPagina }));
}
