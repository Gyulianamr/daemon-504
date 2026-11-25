/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(datos): leer el catálogo desde la API"
 * ═══════════════════════════════════════════════════════════════════ */
// Carga los datos fijos del juego (criaturas, zonas, objetos, tipos y eventos) desde la API: GET /api/catalogo.
// Como el catálogo no cambia durante la partida, se pide una sola vez.
import { api } from './api.js';

let datosCargados = null;

export async function cargarDatos() {
  if (!datosCargados) datosCargados = await api.get('/catalogo');
  return datosCargados;
}

export const buscarCriatura = (datos, id) => datos.criaturas.find((c) => c.id === id);
export const buscarZona = (datos, id) => datos.zonas.find((z) => z.id === id);
export const buscarObjeto = (datos, id) => datos.objetos.find((o) => o.id === id);
export const guardianes = (datos) => datos.zonas.filter((z) => z.guardian).map((z) => z.guardian);

// Estadísticas de una criatura según su nivel. Regla simple: cada nivel suma 3 de vida, 1 de ataque y 1 de defensa.
export function estadisticas(criatura, nivel) {
  return {
    vidaMax: criatura.base.hp + nivel * 3,
    ataque: criatura.base.ataque + nivel,
    defensa: criatura.base.defensa + nivel,
  };
}
