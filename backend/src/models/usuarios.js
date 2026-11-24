/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-03 · Rama: feature/a3-jugador · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(db): modelos de usuarios y personajes"
 * ═══════════════════════════════════════════════════════════════════ */
// Consultas de la tabla usuarios. Por ahora solo se usa para identificar al jugador.

export async function buscarPorId(db, id) {
  const { rows } = await db.query('SELECT id, correo FROM usuarios WHERE id = $1', [id]);
  return rows[0] ?? null;
}
