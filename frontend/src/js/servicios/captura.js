
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A4-06 · Rama: feature/a4-equipo · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(captura): capturar con la API"
 * ═══════════════════════════════════════════════════════════════════ */
// Captura. La probabilidad se calcula en el servidor; el navegador solo dice qué esfera lanza.
import { api } from '../api.js';

// POST /api/encuentros/:id/capturar  { turno, objetoId } → { mensajes, final, encuentro }
export const capturar = (encuentroId, turno, objetoId) => api.post(`/encuentros/${encuentroId}/capturar`, { turno, objetoId });
