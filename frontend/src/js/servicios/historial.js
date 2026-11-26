/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-02 · Rama: feature/a4-personaje · Fecha límite: jueves 26 de noviembre
 * Commit: "feat(historial): consultar el historial en la API"
 * ═══════════════════════════════════════════════════════════════════ */
// Historial de la partida. El servidor lo escribe en cada acción; aquí solo se consulta.
import { api } from '../api.js';

export const TIPOS = ['MOVIMIENTO', 'EXPLORACION', 'ENCUENTRO', 'COMBATE', 'CAPTURA', 'OBJETO', 'CURACION', 'COMPRA', 'DESBLOQUEO'];

// Temporal: los servicios que todavía usan la partida simulada (partida.js) siguen anotando con registrar().
// Cada uno la deja de usar al conectarse a la API; A4-09 borra esta función cuando ya nadie la importa.
export function registrar(partida, tipo, texto) {
  partida.historial.unshift({ id: Date.now() + Math.random(), fecha: new Date().toISOString(), tipo, texto });
  partida.historial = partida.historial.slice(0, 200);
}

// GET /api/historial?tipo=&pagina= → { eventos, pagina, totalPaginas, total }
export function listarHistorial({ tipo = '', pagina = 1 } = {}) {
  const consulta = new URLSearchParams({ pagina });
  if (tipo) consulta.set('tipo', tipo);
  return api.get(`/historial?${consulta}`);
}
