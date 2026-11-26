/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-02 · Rama: feature/a4-personaje · Fecha límite: jueves 26 de noviembre
 * Commit: "feat(personaje): crear y consultar el personaje en la API"
 * ═══════════════════════════════════════════════════════════════════ */
// Personaje del jugador. Los 300 bytes, los objetos iniciales y el nivel de la criatura los pone el servidor.
import { api } from '../api.js';

export const INICIALES = [1, 2, 3]; // Flamix, Aquabit, Terrox

// POST /api/personaje
export const crearPersonaje = (nombre, criaturaInicialId) => api.post('/personaje', { nombre, criaturaInicialId });

// GET /api/personaje → { nombre, bytes, zona, sellos, totalSellos }
export const obtenerPersonaje = () => api.get('/personaje');

// PATCH /api/personaje
export const renombrarPersonaje = (nombre) => api.patch('/personaje', { nombre });

// DELETE /api/personaje → borra la partida para empezar de nuevo
export const eliminarPersonaje = () => api.delete('/personaje');
