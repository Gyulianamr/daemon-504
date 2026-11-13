/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA INTEGRA: Jenifer Padilla
 * Tarea A2-05 · Rama: feature/a2-mundo · Fecha límite: viernes 13 de noviembre
 * Commit: "feat(mundo): zona actual, destinos y movimiento"
 * ═══════════════════════════════════════════════════════════════════ */

import { conPartida, fallar } from '../partida.js';
import { buscarCriatura, buscarZona, guardianes } from '../datos.js';
import { registrar } from './historial.js';


export function estaBloqueada(zona, partida) {
  return Boolean(zona.requiere) && !partida.sellos.includes(zona.requiere);
}


function nombreSello(datos, guardianId) {
  const guardian = guardianes(datos).find((g) => g.id === guardianId);
  return guardian ? guardian.sello : null;
}


function vistaMundo(datos, partida) {
  const zona = buscarZona(datos, partida.zonaActual);
  const guardian = zona.guardian
    ? {
        nombre: buscarCriatura(datos, zona.guardian.criaturaId).nombre,
        nivel: zona.guardian.nivel,
        sello: zona.guardian.sello,
        derrotado: partida.sellos.includes(zona.guardian.id),
      }
    : null;

  const destinos = zona.conexiones.map((id) => {
    const destino = buscarZona(datos, id);
    const bloqueada = estaBloqueada(destino, partida);
    return {
      id: destino.id,
      nombre: destino.nombre,
      nivelMin: destino.nivelMin,
      nivelMax: destino.nivelMax,
      bloqueada,
      requisito: bloqueada ? nombreSello(datos, destino.requiere) : null,
    };
  });

  return {
    zona: {
      id: zona.id,
      nombre: zona.nombre,
      tipo: zona.tipo,
      descripcion: zona.descripcion,
      nivelMin: zona.nivelMin,
      nivelMax: zona.nivelMax,
      tieneTienda: zona.tienda.length > 0,
      guardian,
    },
    destinos,
    combatePendiente: Boolean(partida.encuentro),
  };
}


export function obtenerZonaActual() {
  return conPartida(({ datos, partida }) => vistaMundo(datos, partida));
}


export function moverA(destinoId) {
  return conPartida(({ datos, partida }) => {
    const origen = buscarZona(datos, partida.zonaActual);
    const destino = buscarZona(datos, destinoId);

    if (partida.encuentro) fallar(409, 'No puedes viajar durante un combate.');
    if (!destino || !origen.conexiones.includes(destino.id)) {
      fallar(400, 'Ese lugar no está conectado con tu ubicación actual.');
    }
    if (estaBloqueada(destino, partida)) {
      fallar(403, `Ese camino está bloqueado. Necesitas el ${nombreSello(datos, destino.requiere)}.`);
    }

    partida.zonaActual = destino.id;
    if (destino.tipo === 'localidad') partida.ultimaLocalidad = destino.id;
    registrar(partida, 'MOVIMIENTO', `Viajaste a ${destino.nombre}.`);

    return vistaMundo(datos, partida);
  });
}
