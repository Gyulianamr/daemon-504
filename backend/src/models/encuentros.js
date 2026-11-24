/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-03 · Rama: feature/a3-jugador · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(db): modelo de encuentros"
 * ═══════════════════════════════════════════════════════════════════ */
// Consultas del combate activo (máximo uno por personaje). Devuelve la misma forma que
// partida.encuentro del Front-End: { id, rival: { criaturaId, nivel, vida }, guardianId, activaId, turno }.
import { actualizarFila } from '../db/pool.js';

const COLUMNAS = `id, rival_criatura_id AS "criaturaId", rival_nivel AS nivel, rival_vida AS vida,
  guardian_id AS "guardianId", activa_id AS "activaId", turno`;

// Campos que se pueden cambiar con actualizar(): nombre en JavaScript → columna.
const CAMPOS = { rivalVida: 'rival_vida', activaId: 'activa_id', turno: 'turno' };

const aEncuentro = ({ id, criaturaId, nivel, vida, guardianId, activaId, turno }) => ({
  id,
  rival: { criaturaId, nivel, vida },
  guardianId,
  activaId,
  turno,
});

export async function buscarPorPersonaje(db, personajeId) {
  const { rows } = await db.query(`SELECT ${COLUMNAS} FROM encuentros WHERE personaje_id = $1`, [personajeId]);
  return rows[0] ? aEncuentro(rows[0]) : null;
}

// rival: { criaturaId, nivel, vida }; guardianId = null si es salvaje. Empieza en el turno 1.
export async function crear(db, personajeId, { rival, guardianId = null, activaId }) {
  const { rows } = await db.query(
    `INSERT INTO encuentros (personaje_id, rival_criatura_id, rival_nivel, rival_vida, guardian_id, activa_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING ${COLUMNAS}`,
    [personajeId, rival.criaturaId, rival.nivel, rival.vida, guardianId, activaId],
  );
  return aEncuentro(rows[0]);
}

// cambios: { rivalVida?, activaId?, turno? }. Devuelve cuántas filas cambiaron.
export const actualizar = (db, id, cambios) => actualizarFila(db, 'encuentros', CAMPOS, id, cambios);

// Al terminar el combate (victoria, derrota, huida o captura) el encuentro se borra.
export async function eliminar(db, id) {
  const { rowCount } = await db.query('DELETE FROM encuentros WHERE id = $1', [id]);
  return rowCount;
}
