/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): middleware de registro, ruta no encontrada y errores"
 * ═══════════════════════════════════════════════════════════════════ */
// Se monta después de todas las rutas: si ninguna respondió, la ruta no existe (404 en JSON).
export function noEncontrada(req, res) {
  const ruta = req.originalUrl.split('?')[0];
  res.status(404).json({ error: `No existe la ruta ${req.method} ${ruta}.` });
}
