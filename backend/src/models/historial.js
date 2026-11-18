/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-03 · Rama: feature/a3-jugador · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(historial): modelo del historial"
 * ═══════════════════════════════════════════════════════════════════ */
// Consultas del historial de cada personaje. tipo = null significa «todos los tipos».

export async function insertar(db, personajeId, tipo, texto) {
  await db.query('INSERT INTO historial (personaje_id, tipo, texto) VALUES ($1, $2, $3)', [personajeId, tipo, texto]);
}

// Del más nuevo al más viejo, igual que la pantalla Historial: { id, fecha, tipo, texto }.
export async function listar(db, personajeId, { tipo = null, limite, desplazamiento }) {
  const { rows } = await db.query(
    `SELECT id, fecha, tipo, texto FROM historial
     WHERE personaje_id = $1 AND ($2::text IS NULL OR tipo = $2)
     ORDER BY fecha DESC, id DESC
     LIMIT $3 OFFSET $4`,
    [personajeId, tipo, limite, desplazamiento],
  );
  return rows;
}

export async function contar(db, personajeId, tipo = null) {
  const { rows } = await db.query(
    'SELECT count(*) AS total FROM historial WHERE personaje_id = $1 AND ($2::text IS NULL OR tipo = $2)',
    [personajeId, tipo],
  );
  return rows[0].total;
}
