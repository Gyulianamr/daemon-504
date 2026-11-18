/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): middleware de registro, ruta no encontrada y errores"
 * ═══════════════════════════════════════════════════════════════════ */
// Anota en la consola del servidor cada solicitud al terminar: método, ruta, código y tiempo.
// Ejemplo: GET /api/salud → 200 (3 ms)
export function registrarSolicitud(req, res, next) {
  const inicio = Date.now();
  res.on('finish', () => {
    console.info(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - inicio} ms)`);
  });
  next();
}
