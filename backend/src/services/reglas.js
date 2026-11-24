/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-04 · Rama: feature/a3-equipo · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(equipo): reglas de estadísticas y máximo de equipo"
 * ═══════════════════════════════════════════════════════════════════ */
// Reglas del juego que comparten varios servicios (equipo, combate, captura, inventario).
// Son las mismas fórmulas de frontend/src/js/datos.js y servicios/equipo.js.

export const MAXIMO_EQUIPO = 6;
export const MAXIMO_APODO = 20;

const VIDA_POR_NIVEL = 3;

// Estadísticas de una especie según su nivel: cada nivel suma 3 de vida, 1 de ataque y 1 de defensa.
// criatura es la especie del catálogo (con su "base").
export function estadisticas(criatura, nivel) {
  return {
    vidaMax: criatura.base.hp + nivel * VIDA_POR_NIVEL,
    ataque: criatura.base.ataque + nivel,
    defensa: criatura.base.defensa + nivel,
  };
}
