/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-03 · Rama: feature/a3-jugador · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(historial): registrar y listar el historial"
 * ═══════════════════════════════════════════════════════════════════ */
// registrar() lo usan todos los servicios para anotar lo que pasa (dentro de su transacción);
// listarHistorial() lo usa GET /api/historial. Mismos tipos que el Front-End (js/servicios/historial.js).
import { pool } from '../db/pool.js';
import * as historial from '../models/historial.js';

export const TIPOS = ['MOVIMIENTO', 'EXPLORACION', 'ENCUENTRO', 'COMBATE', 'CAPTURA', 'OBJETO', 'CURACION', 'COMPRA', 'DESBLOQUEO'];
export const POR_PAGINA = 10;

// db es el cliente de la transacción del servicio que llama: si la acción falla, el evento tampoco se guarda.
export async function registrar(db, personajeId, tipo, texto) {
  // Un tipo desconocido es un error de programación, no del jugador: termina en 500.
  if (!TIPOS.includes(tipo)) throw new Error(`Tipo de historial desconocido: ${tipo}`);
  await historial.insertar(db, personajeId, tipo, texto);
}

// GET /api/historial?tipo=&pagina=  →  { eventos, pagina, totalPaginas, total }
export async function listarHistorial(personajeId, { tipo = null, pagina = 1 } = {}) {
  const total = await historial.contar(pool, personajeId, tipo);
  const eventos = await historial.listar(pool, personajeId, {
    tipo,
    limite: POR_PAGINA,
    desplazamiento: (pagina - 1) * POR_PAGINA,
  });
  return { eventos, pagina, totalPaginas: Math.max(1, Math.ceil(total / POR_PAGINA)), total };
}
