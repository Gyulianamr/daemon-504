/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A2-01 · Rama: feature/a2-base · Fecha límite: miércoles 11 de noviembre
 * Commit: "feat(datos): cargar los datos del juego desde JSON"
 * ═══════════════════════════════════════════════════════════════════ */
// Carga los datos fijos del juego (criaturas, zonas, objetos, tipos y eventos) desde public/data/*.json.
// Se usa fetch, igual que cuando más adelante pidamos datos a la API.

const ARCHIVOS = ['criaturas', 'zonas', 'objetos', 'tipos', 'eventos'];
let datosCargados = null;

export async function cargarDatos() {
  if (datosCargados) return datosCargados; // solo se descargan una vez
  const respuestas = await Promise.all(ARCHIVOS.map((nombre) => fetch(`/data/${nombre}.json`).then((r) => r.json())));
  datosCargados = Object.fromEntries(ARCHIVOS.map((nombre, i) => [nombre, respuestas[i]]));
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
