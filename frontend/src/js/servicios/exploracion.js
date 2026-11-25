/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A4-04 · Rama: feature/a4-exploracion · Fecha límite: jueves 26 de noviembre
 * Commit: "feat(exploracion): explorar con la API"
 * ═══════════════════════════════════════════════════════════════════ */
// Acción Explorar. El sorteo (qué pasa y qué criatura aparece) lo hace el servidor con los pesos de la zona.
import { api } from '../api.js';

// POST /api/exploracion → { tipo: 'nada' | 'criatura' | 'objeto' | 'evento', texto, encuentroId? }
export const explorar = () => api.post('/exploracion');