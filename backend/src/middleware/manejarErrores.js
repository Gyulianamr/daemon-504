/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): middleware de registro, ruta no encontrada y errores"
 * ═══════════════════════════════════════════════════════════════════ */
// Último middleware: convierte cualquier error en { "error": mensaje }.
// Un ErrorApi conserva su código; un error inesperado se registra completo y el cliente recibe un 500 general.
import { ErrorApi } from './ErrorApi.js';

// eslint-disable-next-line no-unused-vars -- Express reconoce el manejador de errores por sus 4 parámetros.
export function manejarErrores(err, req, res, next) {
  if (err instanceof ErrorApi) {
    return res.status(err.status).json({ error: err.message });
  }
  // Cuerpo que no es JSON válido (lo detecta express.json()).
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido.' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Ocurrió un error inesperado en el servidor. Intenta de nuevo.' });
}
