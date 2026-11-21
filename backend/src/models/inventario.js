/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-05 · Rama: feature/a3-personaje · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(inventario): modelo del inventario"
 * ═══════════════════════════════════════════════════════════════════ */
// Consultas de la tabla inventario: cuántas unidades de cada objeto tiene cada personaje.

// Objetos que el jugador tiene (cantidad mayor que 0): [{ objetoId, cantidad }].
export async function listar(db, personajeId) {
  const { rows } = await db.query(
    `SELECT objeto_id AS "objetoId", cantidad FROM inventario
     WHERE personaje_id = $1 AND cantidad > 0 ORDER BY objeto_id`,
    [personajeId],
  );
  return rows;
}

// Cantidad de un objeto (0 si no lo tiene).
export async function cantidad(db, personajeId, objetoId) {
  const { rows } = await db.query('SELECT cantidad FROM inventario WHERE personaje_id = $1 AND objeto_id = $2', [
    personajeId,
    objetoId,
  ]);
  return rows[0]?.cantidad ?? 0;
}

// Suma unidades; si el jugador nunca tuvo ese objeto, crea la fila.
export async function sumar(db, personajeId, objetoId, unidades = 1) {
  await db.query(
    `INSERT INTO inventario (personaje_id, objeto_id, cantidad) VALUES ($1, $2, $3)
     ON CONFLICT (personaje_id, objeto_id) DO UPDATE SET cantidad = inventario.cantidad + EXCLUDED.cantidad`,
    [personajeId, objetoId, unidades],
  );
}

// Resta unidades. Devuelve false (sin cambiar nada) si no tenía suficientes: la comprobación y la resta
// son una sola sentencia, así que dos solicitudes a la vez no pueden gastar la misma unidad.
export async function gastar(db, personajeId, objetoId, unidades = 1) {
  const { rowCount } = await db.query(
    `UPDATE inventario SET cantidad = cantidad - $3
     WHERE personaje_id = $1 AND objeto_id = $2 AND cantidad >= $3`,
    [personajeId, objetoId, unidades],
  );
  return rowCount === 1;
}
