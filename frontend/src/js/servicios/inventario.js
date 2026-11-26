
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A4-06 · Rama: feature/a4-equipo · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(inventario): inventario con la API"
 * ═══════════════════════════════════════════════════════════════════ */
// Inventario. El servidor comprueba que el jugador tenga el objeto y que la criatura sea suya.
import { api } from '../api.js';

// GET /api/inventario → objetos con su cantidad
export const listarInventario = () => api.get('/inventario');

// POST /api/inventario/usar { objetoId, criaturaId } → devuelve el mensaje para mostrar
export async function usarObjeto(objetoId, criaturaId) {
  const { mensaje } = await api.post('/inventario/usar', { objetoId, criaturaId });
  return mensaje;
}
