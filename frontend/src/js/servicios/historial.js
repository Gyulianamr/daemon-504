/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A2-01 · Rama: feature/a2-base · Fecha límite: miércoles 11 de noviembre
 * Commit: "feat(historial): registrar y consultar el historial"
 * ═══════════════════════════════════════════════════════════════════ */
// registrar() lo usan todos los servicios para anotar lo que pasa; listarHistorial() lo usa la pantalla Historial.
import { conPartida } from '../partida.js';

export const TIPOS = ['MOVIMIENTO', 'EXPLORACION', 'ENCUENTRO', 'COMBATE', 'CAPTURA', 'OBJETO', 'CURACION', 'COMPRA', 'DESBLOQUEO'];

export function registrar(partida, tipo, texto) {
  partida.historial.unshift({ id: Date.now() + Math.random(), fecha: new Date().toISOString(), tipo, texto });
  partida.historial = partida.historial.slice(0, 200); // se guardan los últimos 200
}

// Futuro endpoint: GET /api/historial?tipo=&pagina=
export function listarHistorial({ tipo = '', pagina = 1, porPagina = 10 } = {}) {
  return conPartida(({ partida }) => {
    const lista = tipo ? partida.historial.filter((h) => h.tipo === tipo) : partida.historial;
    const totalPaginas = Math.max(1, Math.ceil(lista.length / porPagina));
    return { eventos: lista.slice((pagina - 1) * porPagina, pagina * porPagina), pagina, totalPaginas };
  });
}
