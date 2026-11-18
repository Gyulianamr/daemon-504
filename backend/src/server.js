/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): servidor con ruta de salud"
 * ═══════════════════════════════════════════════════════════════════ */
// Inicia el servidor HTTP de la API en el puerto configurado.
import app from './app.js';
import { config } from './config/config.js';

app.listen(config.puerto, () => {
  console.info(`API de DAEMON 504 escuchando en http://localhost:${config.puerto}/api`);
});
