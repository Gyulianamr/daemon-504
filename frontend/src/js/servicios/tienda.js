// Tienda y santuario de las localidades. El precio SIEMPRE se lee del catálogo (objetos.json),
// nunca de lo que envíe la pantalla.
import { conPartida, fallar } from '../partida.js';
import { buscarZona, buscarObjeto } from '../datos.js';
import { vistaCriatura } from './equipo.js';
import { registrar } from './historial.js';

const CANTIDAD_MINIMA = 1;
const CANTIDAD_MAXIMA = 10;

// Futuro: GET /api/tienda
export const obtenerTienda = () =>
  conPartida(({ datos, partida }) => {
    const zona = buscarZona(datos, partida.zonaActual);
    return {
      zona: zona.nombre,
      esLocalidad: zona.tipo === 'localidad',
      bytes: partida.bytes,
      productos: zona.tienda.map((id) => ({ ...buscarObjeto(datos, id), tienes: partida.inventario[id] || 0 })),
    };
  });

// Futuro: POST /api/tienda/comprar  { objetoId, cantidad }
export function comprar(objetoId, cantidad) {
  return conPartida(({ datos, partida }) => {
    const zona = buscarZona(datos, partida.zonaActual);
    if (!zona.tienda.includes(objetoId)) fallar(400, 'Ese objeto no se vende aquí.');
    if (!Number.isInteger(cantidad) || cantidad < CANTIDAD_MINIMA || cantidad > CANTIDAD_MAXIMA) {
      fallar(400, `La cantidad debe estar entre ${CANTIDAD_MINIMA} y ${CANTIDAD_MAXIMA}.`);
    }
    const objeto = buscarObjeto(datos, objetoId);
    const total = objeto.precio * cantidad; // precio del catálogo, nunca de la pantalla
    if (partida.bytes < total) fallar(409, `Necesitas ${total} bytes y tienes ${partida.bytes}.`);

    partida.bytes -= total;
    partida.inventario[objetoId] = (partida.inventario[objetoId] || 0) + cantidad;
    const texto = `Compraste ${cantidad} ${objeto.nombre} por ${total} bytes.`;
    registrar(partida, 'COMPRA', texto);
    return texto;
  });
}

// Futuro: POST /api/santuario/curar
export function curarEquipo() {
  return conPartida(({ datos, partida }) => {
    const zona = buscarZona(datos, partida.zonaActual);
    if (zona.tipo !== 'localidad') fallar(403, 'El santuario solo está en las localidades.');
    if (partida.encuentro) fallar(409, 'Termina el combate primero.');

    partida.criaturas.forEach((c) => {
      c.vida = vistaCriatura(datos, c).vidaMax;
    });
    registrar(partida, 'CURACION', `Tu equipo fue curado en el santuario de ${zona.nombre}.`);
    return 'Tu equipo recuperó toda su vida.';
  });
}
