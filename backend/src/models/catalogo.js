/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-02 · Rama: feature/a3-base-datos · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(catalogo): leer el catálogo desde la base de datos"
 * ═══════════════════════════════════════════════════════════════════ */
// Lee el catálogo (datos fijos del juego) y lo arma con la MISMA forma que los JSON del Front-End
// (criaturas, zonas, objetos, tipos, eventos). Como no cambia, se lee una vez y queda en memoria.
import { pool } from '../db/pool.js';

let catalogoEnMemoria = null;

export async function obtenerCatalogo(db = pool) {
  if (catalogoEnMemoria) return catalogoEnMemoria;

  const [criaturas, zonas, guardianes, conexiones, apariciones, tienda, objetos, tipos, efectividades, eventos] =
    await Promise.all([
      db.query(`SELECT id, nombre, tipo, rol, hp, ataque, defensa, facilidad_captura AS "facilidadCaptura", descripcion
                FROM criaturas ORDER BY id`),
      db.query(`SELECT id, nombre, tipo, descripcion, nivel_min AS "nivelMin", nivel_max AS "nivelMax", requiere,
                       peso_nada AS nada, peso_criatura AS criatura, peso_objeto AS objeto, peso_evento AS evento
                FROM zonas ORDER BY orden`),
      db.query(`SELECT id, zona_id AS "zonaId", criatura_id AS "criaturaId", nivel, sello, recompensa, abre
                FROM guardianes`),
      db.query('SELECT origen, destino FROM conexiones ORDER BY origen, orden'),
      db.query(`SELECT zona_id AS "zonaId", criatura_id AS "criaturaId", peso
                FROM apariciones ORDER BY zona_id, orden`),
      db.query('SELECT zona_id AS "zonaId", objeto_id AS "objetoId" FROM tienda ORDER BY zona_id, objeto_id'),
      db.query(`SELECT id, nombre, tipo, valor, precio, peso_hallazgo AS "pesoHallazgo", descripcion
                FROM objetos ORDER BY id`),
      db.query('SELECT nombre FROM tipos ORDER BY orden'),
      db.query('SELECT atacante, defensor FROM efectividades ORDER BY atacante, orden'),
      db.query('SELECT texto FROM eventos ORDER BY id'),
    ]);

  const deZona = (filas, zonaId) => filas.rows.filter((f) => f.zonaId === zonaId);

  catalogoEnMemoria = {
    criaturas: criaturas.rows.map(({ hp, ataque, defensa, ...c }) => ({
      id: c.id,
      nombre: c.nombre,
      tipo: c.tipo,
      rol: c.rol,
      base: { hp, ataque, defensa },
      facilidadCaptura: c.facilidadCaptura,
      descripcion: c.descripcion,
    })),
    zonas: zonas.rows.map((z) => {
      const guardian = guardianes.rows.find((g) => g.zonaId === z.id);
      return {
        id: z.id,
        nombre: z.nombre,
        tipo: z.tipo,
        descripcion: z.descripcion,
        nivelMin: z.nivelMin,
        nivelMax: z.nivelMax,
        conexiones: conexiones.rows.filter((c) => c.origen === z.id).map((c) => c.destino),
        requiere: z.requiere,
        tienda: deZona(tienda, z.id).map((t) => t.objetoId),
        guardian: guardian
          ? {
              id: guardian.id,
              criaturaId: guardian.criaturaId,
              nivel: guardian.nivel,
              sello: guardian.sello,
              recompensa: guardian.recompensa,
              abre: guardian.abre,
            }
          : null,
        eventos: { nada: z.nada, criatura: z.criatura, objeto: z.objeto, evento: z.evento },
        apariciones: deZona(apariciones, z.id).map(({ criaturaId, peso }) => ({ criaturaId, peso })),
      };
    }),
    objetos: objetos.rows,
    tipos: {
      fuerteContra: Object.fromEntries(
        tipos.rows.map(({ nombre }) => [
          nombre,
          efectividades.rows.filter((e) => e.atacante === nombre).map((e) => e.defensor),
        ]),
      ),
    },
    eventos: eventos.rows.map((e) => e.texto),
  };
  return catalogoEnMemoria;
}

// Búsquedas sobre el catálogo ya cargado (mismos nombres que js/datos.js del Front-End).
export const buscarCriatura = (catalogo, id) => catalogo.criaturas.find((c) => c.id === id) ?? null;
export const buscarZona = (catalogo, id) => catalogo.zonas.find((z) => z.id === id) ?? null;
export const buscarObjeto = (catalogo, id) => catalogo.objetos.find((o) => o.id === id) ?? null;
export const guardianes = (catalogo) => catalogo.zonas.filter((z) => z.guardian).map((z) => z.guardian);
