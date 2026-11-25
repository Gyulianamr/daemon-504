/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(auth): registro, inicio y cierre de sesión con token"
 * ═══════════════════════════════════════════════════════════════════ */
// Consultas de la tabla usuarios: buscar por id o por correo y crear la cuenta.

export async function buscarPorId(db, id) {
  const { rows } = await db.query('SELECT id, correo FROM usuarios WHERE id = $1', [id]);
  return rows[0] ?? null;
}

// Incluye el hash para poder verificar la contraseña; nunca se devuelve al navegador.
export async function buscarPorCorreo(db, correo) {
  const { rows } = await db.query(
    'SELECT id, correo, contrasena_hash AS "contrasenaHash" FROM usuarios WHERE correo = $1',
    [correo],
  );
  return rows[0] ?? null;
}

export async function crear(db, { id, correo, contrasenaHash }) {
  const { rows } = await db.query(
    'INSERT INTO usuarios (id, correo, contrasena_hash) VALUES ($1, $2, $3) RETURNING id, correo',
    [id, correo, contrasenaHash],
  );
  return rows[0];
}
