/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(auth): registro, inicio y cierre de sesión con token"
 * ═══════════════════════════════════════════════════════════════════ */
// Consultas de la tabla sesiones: un token por inicio de sesión.

export const crear = (db, { token, usuarioId, expiraEn }) =>
  db.query('INSERT INTO sesiones (token, usuario_id, expira_en) VALUES ($1, $2, $3)', [token, usuarioId, expiraEn]);

// Devuelve el usuario_id si el token existe y no venció; si venció, borra la fila.
export async function buscarUsuarioId(db, token) {
  const { rows } = await db.query(
    'SELECT usuario_id AS "usuarioId", expira_en AS "expiraEn" FROM sesiones WHERE token = $1',
    [token],
  );
  const sesion = rows[0];
  if (!sesion) return null;
  if (new Date(sesion.expiraEn) <= new Date()) {
    await db.query('DELETE FROM sesiones WHERE token = $1', [token]);
    return null;
  }
  return sesion.usuarioId;
}

export const eliminar = (db, token) => db.query('DELETE FROM sesiones WHERE token = $1', [token]);
