/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A3-06 · Rama: feature/a3-inventario · Turno 2 (fecha máxima: jueves 19 de noviembre)
 * Commit: "feat(inventario): usar objetos y listar inventario"
 * ═══════════════════════════════════════════════════════════════════ */
// Inventario: lista lo que el jugador tiene y permite usar objetos de curación fuera de combate.
// Mismas reglas que frontend/src/js/servicios/inventario.js; aquí el servidor es quien decide.
import { pool, transaccion } from '../db/pool.js';
import * as personajes from '../models/personajes.js';
import * as encuentros from '../models/encuentros.js';
import * as criaturasJugador from '../models/criaturasJugador.js';
import * as inventario from '../models/inventario.js';
import { obtenerCatalogo, buscarObjeto } from '../models/catalogo.js';
import { vistaCriatura } from './equipo.js';
import { registrar } from './historial.js';
import { fallar } from '../middleware/ErrorApi.js';

// GET /api/inventario → los objetos del catálogo que el jugador tiene, con su cantidad.
export async function listarInventario(personajeId) {
  const catalogo = await obtenerCatalogo();
  const tiene = await inventario.listar(pool, personajeId);
  return tiene.map(({ objetoId, cantidad }) => ({ ...buscarObjeto(catalogo, objetoId), cantidad }));
}

// POST /api/inventario/usar { objetoId, criaturaId } → { mensaje }
export const usarObjeto = (personajeId, objetoId, criaturaId) =>
  transaccion(async (db) => {
    const catalogo = await obtenerCatalogo();
    // Se bloquea la partida: dos solicitudes iguales a la vez no pueden gastar la misma unidad.
    await personajes.bloquear(db, personajeId);

    if (await encuentros.buscarPorPersonaje(db, personajeId)) {
      fallar(409, 'Durante un combate usa los objetos desde la pantalla de combate.');
    }
    const objeto = buscarObjeto(catalogo, objetoId);
    if (!objeto || objeto.tipo !== 'curacion') fallar(400, 'Ese objeto no se puede usar aquí.');
    if ((await inventario.cantidad(db, personajeId, objetoId)) < 1) fallar(409, `No tienes ${objeto.nombre}.`);

    const criatura = await criaturasJugador.buscar(db, personajeId, criaturaId);
    if (!criatura) fallar(404, 'Esa criatura no es tuya.');
    const { nombre, vidaMax } = vistaCriatura(catalogo, criatura);
    if (criatura.vida === 0) fallar(409, `${nombre} está debilitada: llévala al santuario.`);
    if (criatura.vida >= vidaMax) fallar(409, `${nombre} ya tiene la vida completa.`);

    const vida = Math.min(vidaMax, criatura.vida + objeto.valor);
    await inventario.gastar(db, personajeId, objetoId);
    await criaturasJugador.actualizar(db, criatura.id, { vida });
    await registrar(db, personajeId, 'CURACION', `Usaste ${objeto.nombre} en ${nombre}.`);
    return { mensaje: `${nombre} ahora tiene ${vida}/${vidaMax} HP.` };
  });
