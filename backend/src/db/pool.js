/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-02 · Rama: feature/a3-base-datos · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(db): conexión a PostgreSQL y transacciones"
 * ═══════════════════════════════════════════════════════════════════ */
// Conexión a PostgreSQL (Supabase). Las consultas que solo leen usan pool directamente;
// las acciones que cambian la partida usan transaccion() para guardar todo junto o nada.
import pg from 'pg';
import { config } from '../config/config.js';

// PostgreSQL devuelve NUMERIC y BIGINT como texto para no perder precisión.
// En el juego son valores chicos (0.4, 1.5, conteos): se convierten a número de JavaScript.
pg.types.setTypeParser(pg.types.builtins.NUMERIC, parseFloat);
pg.types.setTypeParser(pg.types.builtins.INT8, Number);

export const pool = new pg.Pool({
  connectionString: config.baseDatos.url,
  // Supabase exige SSL. Su pooler usa un certificado que Node no reconoce por defecto,
  // por eso no se rechaza (la conexión igual va cifrada).
  ssl: config.baseDatos.ssl ? { rejectUnauthorized: false } : false,
  max: 10,
});

// Si una conexión inactiva se cae, se registra y el pool abre otra cuando haga falta.
pool.on('error', (err) => {
  console.error('Error en una conexión inactiva de PostgreSQL:', err.message);
});

// Ejecuta trabajo(db) dentro de una transacción: COMMIT si todo salió bien, ROLLBACK si algo falló.
// db es un cliente dedicado: todas las consultas de la acción ven y bloquean los mismos datos.
export async function transaccion(trabajo) {
  const db = await pool.connect();
  try {
    await db.query('BEGIN');
    const resultado = await trabajo(db);
    await db.query('COMMIT');
    return resultado;
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  } finally {
    db.release();
  }
}

// UPDATE parametrizado de una fila por id, solo con los campos permitidos.
// campos traduce el nombre de JavaScript a la columna: { zonaActual: 'zona_actual', bytes: 'bytes' }.
// Lo que venga en cambios y no esté en campos se ignora. Devuelve cuántas filas cambiaron.
export async function actualizarFila(db, tabla, campos, id, cambios) {
  if (!/^[a-z_]+$/.test(tabla)) throw new Error(`Nombre de tabla inválido: ${tabla}`);
  const columnas = [];
  const valores = [];
  for (const [nombre, columna] of Object.entries(campos)) {
    if (cambios[nombre] === undefined) continue;
    valores.push(cambios[nombre]);
    columnas.push(`${columna} = $${valores.length}`);
  }
  if (columnas.length === 0) return 0;
  valores.push(id);
  const { rowCount } = await db.query(
    `UPDATE ${tabla} SET ${columnas.join(', ')} WHERE id = $${valores.length}`,
    valores,
  );
  return rowCount;
}
