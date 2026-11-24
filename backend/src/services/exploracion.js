/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A3-08 · Rama: feature/a3-exploracion · Turno 3 (fecha máxima: viernes 20 de noviembre)
 * Commit: "feat(exploracion): explorar con eventos ponderados y encuentros"
 * ═══════════════════════════════════════════════════════════════════ */
// Acción Explorar. El servidor decide el resultado: primero QUÉ pasa según los pesos de la zona
// (nada / criatura / objeto / evento) y, si sale criatura, CUÁL según la tabla de aparición de la zona.
import { transaccion } from '../db/pool.js';
import { obtenerCatalogo, buscarZona, buscarCriatura, buscarObjeto } from '../models/catalogo.js';
import * as personajes from '../models/personajes.js';
import * as encuentros from '../models/encuentros.js';
import * as criaturas from '../models/criaturasJugador.js';
import { sumar } from '../models/inventario.js';
import { equipoActivo } from './equipo.js';
import { estadisticas } from './reglas.js';
import { registrar } from './historial.js';
import { elegirPonderado, elegirAlAzar, numeroEntre } from './azar.js';
import { fallar } from '../middleware/ErrorApi.js';

// Crea el encuentro con el rival a vida completa. La primera criatura del equipo con vida es la que pelea.
// También la usa el combate para desafiar a un guardián.
export async function iniciarEncuentro(db, catalogo, personajeId, criaturaId, nivel, guardianId = null) {
  const activa = equipoActivo(await criaturas.listar(db, personajeId)).find((c) => c.vida > 0);
  if (!activa) fallar(409, 'Tu equipo está debilitado. Cúralo en el santuario de una localidad.');
  const { vidaMax } = estadisticas(buscarCriatura(catalogo, criaturaId), nivel);
  const rival = { criaturaId, nivel, vida: vidaMax };
  return encuentros.crear(db, personajeId, { rival, guardianId, activaId: activa.id });
}

// POST /api/exploracion
export const explorar = (personajeId) =>
  transaccion(async (db) => {
    const personaje = await personajes.bloquear(db, personajeId);
    if (await encuentros.buscarPorPersonaje(db, personajeId)) fallar(409, 'Tienes un combate pendiente.');
    const equipo = equipoActivo(await criaturas.listar(db, personajeId));
    if (!equipo.some((c) => c.vida > 0)) fallar(409, 'Tu equipo está debilitado. Cúralo en el santuario de una localidad.');

    const catalogo = await obtenerCatalogo();
    const zona = buscarZona(catalogo, personaje.zonaActual);
    const pesos = Object.entries(zona.eventos).map(([tipo, peso]) => ({ tipo, peso }));
    const { tipo } = elegirPonderado(pesos);

    if (tipo === 'criatura' && zona.apariciones.length > 0) {
      const { criaturaId } = elegirPonderado(zona.apariciones);
      const nivel = numeroEntre(zona.nivelMin, zona.nivelMax);
      const encuentro = await iniciarEncuentro(db, catalogo, personajeId, criaturaId, nivel);
      const texto = `¡Un ${buscarCriatura(catalogo, criaturaId).nombre} salvaje (Nv ${nivel}) apareció!`;
      await registrar(db, personajeId, 'ENCUENTRO', `${texto} · ${zona.nombre}`);
      return { tipo, texto, encuentroId: encuentro.id };
    }
    if (tipo === 'objeto') {
      const { id } = elegirPonderado(catalogo.objetos.map((o) => ({ id: o.id, peso: o.pesoHallazgo })));
      const objeto = buscarObjeto(catalogo, id);
      await sumar(db, personajeId, objeto.id, 1);
      const texto = `Encontraste 1 ${objeto.nombre}.`;
      await registrar(db, personajeId, 'OBJETO', `${texto} · ${zona.nombre}`);
      return { tipo, texto };
    }
    if (tipo === 'evento') {
      const texto = elegirAlAzar(catalogo.eventos);
      await registrar(db, personajeId, 'EXPLORACION', `${texto} · ${zona.nombre}`);
      return { tipo, texto };
    }
    await registrar(db, personajeId, 'EXPLORACION', `Exploraste ${zona.nombre} sin encontrar nada.`);
    return { tipo: 'nada', texto: 'Exploraste la zona, pero no encontraste nada.' };
  });