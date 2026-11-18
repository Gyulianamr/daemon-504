/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-03 · Rama: feature/a3-jugador · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(db): modelos de usuarios y personajes"
 * ═══════════════════════════════════════════════════════════════════ */
// Consultas de personajes y de sus sellos (guardianes vencidos).
import { actualizarFila } from '../db/pool.js';

const COLUMNAS = `id, usuario_id AS "usuarioId", nombre, bytes,
  zona_actual AS "zonaActual", ultima_localidad AS "ultimaLocalidad"`;

// Campos que se pueden cambiar con actualizar(): nombre en JavaScript → columna.
const CAMPOS = { nombre: 'nombre', bytes: 'bytes', zonaActual: 'zona_actual', ultimaLocalidad: 'ultima_localidad' };

export async function buscarPorUsuario(db, usuarioId) {
  const { rows } = await db.query(`SELECT ${COLUMNAS} FROM personajes WHERE usuario_id = $1`, [usuarioId]);
  return rows[0] ?? null;
}

export async function buscarPorId(db, id) {
  const { rows } = await db.query(`SELECT ${COLUMNAS} FROM personajes WHERE id = $1`, [id]);
  return rows[0] ?? null;
}

// SELECT … FOR UPDATE: bloquea la fila hasta que termine la transacción.
// Si llegan dos acciones a la vez (doble clic), la segunda espera a la primera y ve sus cambios.
export async function bloquear(db, id) {
  const { rows } = await db.query(`SELECT ${COLUMNAS} FROM personajes WHERE id = $1 FOR UPDATE`, [id]);
  return rows[0] ?? null;
}

export async function crear(db, { usuarioId, nombre, bytes, zonaActual, ultimaLocalidad }) {
  const { rows } = await db.query(
    `INSERT INTO personajes (usuario_id, nombre, bytes, zona_actual, ultima_localidad)
     VALUES ($1, $2, $3, $4, $5) RETURNING ${COLUMNAS}`,
    [usuarioId, nombre, bytes, zonaActual, ultimaLocalidad],
  );
  return rows[0];
}

// cambios: { nombre?, bytes?, zonaActual?, ultimaLocalidad? }. Devuelve cuántas filas cambiaron.
export const actualizar = (db, id, cambios) => actualizarFila(db, 'personajes', CAMPOS, id, cambios);

// Borra el personaje y, por ON DELETE CASCADE, toda su partida.
export async function eliminar(db, id) {
  const { rowCount } = await db.query('DELETE FROM personajes WHERE id = $1', [id]);
  return rowCount;
}

// Ids de los guardianes vencidos, por ejemplo ['g1'] (igual que partida.sellos del Front-End).
export async function listarSellos(db, personajeId) {
  const { rows } = await db.query(
    'SELECT guardian_id AS "guardianId" FROM sellos WHERE personaje_id = $1 ORDER BY obtenido_en, guardian_id',
    [personajeId],
  );
  return rows.map((r) => r.guardianId);
}

// Devuelve true si el sello es nuevo y false si ya lo tenía.
export async function agregarSello(db, personajeId, guardianId) {
  const { rowCount } = await db.query(
    'INSERT INTO sellos (personaje_id, guardian_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
    [personajeId, guardianId],
  );
  return rowCount === 1;
}
