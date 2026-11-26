
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A4-06 · Rama: feature/a4-equipo
 * Commit: "feat(equipo): equipo, apodo y liberar con la API"
 * ═══════════════════════════════════════════════════════════════════ */
// Equipo activo (máximo 6) y reserva. Todas las acciones responden el equipo actualizado: { activo, reserva, maximo }.
import { api } from '../api.js';

// GET /api/equipo
export const listarEquipo = () => api.get('/equipo');

// PATCH /api/equipo/:id/activa → pasa a la posición 1
export const hacerActiva = (id) => api.patch(`/equipo/${id}/activa`);

// PATCH /api/equipo/:id/reserva
export const moverAReserva = (id) => api.patch(`/equipo/${id}/reserva`);

// PATCH /api/equipo/:id/equipo
export const moverAlEquipo = (id) => api.patch(`/equipo/${id}/equipo`);

// PATCH /api/equipo/:id/apodo { apodo } → un apodo vacío lo quita
export const cambiarApodo = (id, apodo) => api.patch(`/equipo/${id}/apodo`, { apodo });

// DELETE /api/equipo/:id → liberar la criatura
export const liberar = (id) => api.delete(`/equipo/${id}`);
