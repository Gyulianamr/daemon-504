/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A3-07 · Rama: feature/a3-mundo · Turno 3 (fecha máxima: viernes 20 de noviembre)
 * Commit: "feat(mundo): zona actual y movimiento con zonas bloqueadas"
 * ═══════════════════════════════════════════════════════════════════ */
// El mundo son zonas conectadas. Una zona con "requiere" queda bloqueada hasta que el jugador tenga
// el sello de ese guardián. El servidor valida cada movimiento: conectada, desbloqueada y sin combate.
import { pool, transaccion } from '../db/pool.js';
import { obtenerCatalogo, buscarZona, buscarCriatura, guardianes } from '../models/catalogo.js';
import * as personajes from '../models/personajes.js';
import { buscarPorPersonaje as buscarEncuentro } from '../models/encuentros.js';
import { registrar } from './historial.js';
import { fallar } from '../middleware/ErrorApi.js';

export const estaBloqueada = (zona, sellos) => zona.requiere !== null && !sellos.includes(zona.requiere);
const nombreSello = (catalogo, guardianId) => guardianes(catalogo).find((g) => g.id === guardianId).sello;

function vistaZona(catalogo, zonaId, sellos, combatePendiente) {
  const zona = buscarZona(catalogo, zonaId);
  const g = zona.guardian;
  return {
    zona: {
      id: zona.id,
      nombre: zona.nombre,
      tipo: zona.tipo,
      descripcion: zona.descripcion,
      nivelMin: zona.nivelMin,
      nivelMax: zona.nivelMax,
      tieneTienda: zona.tienda.length > 0,
      guardian: g && {
        nombre: buscarCriatura(catalogo, g.criaturaId).nombre,
        nivel: g.nivel,
        sello: g.sello,
        derrotado: sellos.includes(g.id),
      },
    },
    destinos: zona.conexiones.map((id) => {
      const destino = buscarZona(catalogo, id);
      return {
        id,
        nombre: destino.nombre,
        nivelMin: destino.nivelMin,
        nivelMax: destino.nivelMax,
        bloqueada: estaBloqueada(destino, sellos),
        requisito: destino.requiere && nombreSello(catalogo, destino.requiere),
      };
    }),
    combatePendiente,
  };
}

// GET /api/mundo/actual
export async function obtenerZonaActual(personajeId) {
  const catalogo = await obtenerCatalogo();
  const personaje = await personajes.buscarPorId(pool, personajeId);
  const sellos = await personajes.listarSellos(pool, personajeId);
  const encuentro = await buscarEncuentro(pool, personajeId);
  return vistaZona(catalogo, personaje.zonaActual, sellos, encuentro !== null);
}

// POST /api/mundo/mover  { destino }
export const moverA = (personajeId, destinoId) =>
  transaccion(async (db) => {
    const personaje = await personajes.bloquear(db, personajeId);
    if (await buscarEncuentro(db, personajeId)) fallar(409, 'Termina el combate antes de moverte.');
    const catalogo = await obtenerCatalogo();
    const actual = buscarZona(catalogo, personaje.zonaActual);
    const destino = buscarZona(catalogo, destinoId);
    if (!destino || !actual.conexiones.includes(destinoId)) fallar(400, 'Esa zona no está conectada con tu ubicación.');
    const sellos = await personajes.listarSellos(db, personajeId);
    if (estaBloqueada(destino, sellos)) {
      fallar(403, `${destino.nombre} está bloqueada: necesitas el ${nombreSello(catalogo, destino.requiere)}.`);
    }

    const cambios = { zonaActual: destino.id };
    if (destino.tipo === 'localidad') cambios.ultimaLocalidad = destino.id; // a dónde vuelve si pierde un combate
    await personajes.actualizar(db, personajeId, cambios);
    await registrar(db, personajeId, 'MOVIMIENTO', `Viajaste a ${destino.nombre}.`);
    return vistaZona(catalogo, destino.id, sellos, false);
  });