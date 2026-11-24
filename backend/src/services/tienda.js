/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Heysser Machado
 * Tarea A3-13 · Rama: feature/a3-tienda · Turno 6 (fecha máxima: lunes 23 de noviembre)
 * Commit: "feat(tienda): comprar objetos y curar en el santuario"
 * ═══════════════════════════════════════════════════════════════════ */
// Tienda y santuario de las localidades. El precio SIEMPRE sale del catálogo (tabla objetos),
// nunca de lo que envíe el navegador, y el dinero se descuenta en la misma transacción que la compra.
// Mismas reglas que frontend/src/js/servicios/tienda.js; aquí el servidor es quien decide.
import { pool, transaccion } from '../db/pool.js';
import * as personajes from '../models/personajes.js';
import * as encuentros from '../models/encuentros.js';
import * as criaturasJugador from '../models/criaturasJugador.js';
import * as inventario from '../models/inventario.js';
import { obtenerCatalogo, buscarZona, buscarObjeto } from '../models/catalogo.js';
import { vistaCriatura } from './equipo.js';
import { registrar } from './historial.js';
import { fallar } from '../middleware/ErrorApi.js';

const CANTIDAD_MINIMA = 1;
const CANTIDAD_MAXIMA = 10;

// GET /api/tienda → { zona, esLocalidad, bytes, productos }
// Solo lee, así que usa el pool directamente (sin transacción).
export async function obtenerTienda(personajeId) {
  const catalogo = await obtenerCatalogo();
  const personaje = await personajes.buscarPorId(pool, personajeId);
  const zona = buscarZona(catalogo, personaje.zonaActual);
  const tiene = await inventario.listar(pool, personajeId);
  return {
    zona: zona.nombre,
    esLocalidad: zona.tipo === 'localidad',
    bytes: personaje.bytes,
    productos: zona.tienda.map((id) => ({
      ...buscarObjeto(catalogo, id),
      tienes: tiene.find((t) => t.objetoId === id)?.cantidad ?? 0,
    })),
  };
}

// POST /api/tienda/comprar { objetoId, cantidad } → { mensaje, bytes }
export const comprar = (personajeId, objetoId, cantidad) =>
  transaccion(async (db) => {
    const catalogo = await obtenerCatalogo();
    // 1. bloquear la partida: si llegan dos compras a la vez (doble clic), la segunda espera y ve los bytes ya descontados
    const personaje = await personajes.bloquear(db, personajeId);

    // 2. validar contra el estado de la partida (nunca confiar en lo que manda el navegador)
    const zona = buscarZona(catalogo, personaje.zonaActual);
    if (!zona.tienda.includes(objetoId)) fallar(400, 'Ese objeto no se vende aquí.');
    if (!Number.isInteger(cantidad) || cantidad < CANTIDAD_MINIMA || cantidad > CANTIDAD_MAXIMA) {
      fallar(400, `La cantidad debe estar entre ${CANTIDAD_MINIMA} y ${CANTIDAD_MAXIMA}.`);
    }
    const objeto = buscarObjeto(catalogo, objetoId);
    const total = objeto.precio * cantidad; // precio del catálogo, nunca del navegador
    if (personaje.bytes < total) fallar(409, `Necesitas ${total} bytes y tienes ${personaje.bytes}.`);

    // 3. guardar cambios: los bytes nunca quedan negativos porque se comprobó arriba
    const bytes = personaje.bytes - total;
    await personajes.actualizar(db, personajeId, { bytes });
    await inventario.sumar(db, personajeId, objetoId, cantidad);

    // 4. historial
    const mensaje = `Compraste ${cantidad} ${objeto.nombre} por ${total} bytes.`;
    await registrar(db, personajeId, 'COMPRA', mensaje);

    // 5. lo que recibe el cliente
    return { mensaje, bytes };
  });

// POST /api/santuario/curar → { mensaje }
// Cura gratis a TODO el equipo (activo y reserva). Solo en localidades y sin combate pendiente.
export const curarEquipo = (personajeId) =>
  transaccion(async (db) => {
    const catalogo = await obtenerCatalogo();
    const personaje = await personajes.bloquear(db, personajeId);

    const zona = buscarZona(catalogo, personaje.zonaActual);
    if (zona.tipo !== 'localidad') fallar(403, 'El santuario solo está en las localidades.');
    if (await encuentros.buscarPorPersonaje(db, personajeId)) fallar(409, 'Termina el combate primero.');

    const lista = await criaturasJugador.listar(db, personajeId);
    for (const criatura of lista) {
      const { vidaMax } = vistaCriatura(catalogo, criatura);
      if (criatura.vida !== vidaMax) await criaturasJugador.actualizar(db, criatura.id, { vida: vidaMax });
    }

    await registrar(db, personajeId, 'CURACION', `Tu equipo fue curado en el santuario de ${zona.nombre}.`);
    return { mensaje: 'Tu equipo recuperó toda su vida.' };
  });
