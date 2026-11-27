/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jenifer Padilla
 * Tarea A4-03 · Rama: feature/a4-mundo · Fecha límite: jueves 26 de noviembre
 * Commit: "feat(progreso): consultar el progreso en la API"
 * ═══════════════════════════════════════════════════════════════════ */
import { api } from '../api.js';

export const obtenerProgreso = () => api.get('/progreso');