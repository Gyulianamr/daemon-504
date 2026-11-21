/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-04 · Rama: feature/a3-equipo · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(equipo): modelo de criaturas del jugador"
 * ═══════════════════════════════════════════════════════════════════ */
// Consultas de criaturas_jugador. posicion 1..6 = equipo activo; NULL = reserva.
// TODA búsqueda filtra por personaje_id: una criatura de otro jugador simplemente no se encuentra (404).
import { actualizarFila } from '../db/pool.js';

const COLUMNAS = 'id, criatura_id AS "criaturaId", apodo, nivel, experiencia, vida, posicion';

// Campos que se pueden cambiar con actualizar(): nombre en JavaScript → columna.
const CAMPOS = { apodo: 'apodo', nivel: 'nivel', experiencia: 'experiencia', vida: 'vida' };

// Todas las criaturas del jugador: primero el equipo en orden y después la reserva.
export async function listar(db, personajeId) {
  const { rows } = await db.query(
    `SELECT ${COLUMNAS} FROM criaturas_jugador WHERE personaje_id = $1 ORDER BY posicion NULLS LAST, id`,
    [personajeId],
  );
  return rows;
}

export async function buscar(db, personajeId, id) {
  const { rows } = await db.query(
    `SELECT ${COLUMNAS} FROM criaturas_jugador WHERE personaje_id = $1 AND id = $2`,
    [personajeId, id],
  );
  return rows[0] ?? null;
}

// posicion = null para la reserva.
export async function crear(db, personajeId, { criaturaId, nivel, vida, posicion }) {
  const { rows } = await db.query(
    `INSERT INTO criaturas_jugador (personaje_id, criatura_id, nivel, vida, posicion)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNAS}`,
    [personajeId, criaturaId, nivel, vida, posicion],
  );
  return rows[0];
}

// cambios: { apodo?, nivel?, experiencia?, vida? }. La criatura ya debe haberse comprobado con buscar().
export const actualizar = (db, id, cambios) => actualizarFila(db, 'criaturas_jugador', CAMPOS, id, cambios);

// Deja a estas criaturas, en este orden, como el equipo activo (posiciones 1, 2, 3…).
// Es una sola sentencia y la restricción de posición única se revisa al final de la transacción,
// así que se pueden reordenar sin chocar a mitad del cambio.
export async function fijarEquipo(db, personajeId, ids) {
  await db.query(
    `UPDATE criaturas_jugador AS c SET posicion = v.posicion
     FROM unnest($2::int[]) WITH ORDINALITY AS v(id, posicion)
     WHERE c.personaje_id = $1 AND c.id = v.id`,
    [personajeId, ids],
  );
}

export async function enviarAReserva(db, personajeId, id) {
  await db.query('UPDATE criaturas_jugador SET posicion = NULL WHERE personaje_id = $1 AND id = $2', [personajeId, id]);
}

// Libera (borra) la criatura. Devuelve cuántas filas se borraron.
export async function eliminar(db, personajeId, id) {
  const { rowCount } = await db.query('DELETE FROM criaturas_jugador WHERE personaje_id = $1 AND id = $2', [
    personajeId,
    id,
  ]);
  return rowCount;
}
