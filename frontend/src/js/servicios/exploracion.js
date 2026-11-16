// Explora la zona actual: decide que pasa y lo guarda en la partida.

import { conPartida, fallar } from '../partida.js';
import { buscarZona, buscarCriatura } from '../datos.js';
import { registrar } from './historial.js';
import { iniciarEncuentro } from './combate.js';
import { equipoActivo } from './equipo.js';
import { elegirPonderado, elegirAlAzar, numeroEntre } from '../utils/azar.js';

// Elige nada, criatura, objeto o evento segun los pesos de la zona.
function elegirTipo(zona) {
  const tipos = [
    { tipo: 'nada', peso: zona.eventos.nada },
    { tipo: 'criatura', peso: zona.eventos.criatura },
    { tipo: 'objeto', peso: zona.eventos.objeto },
    { tipo: 'evento', peso: zona.eventos.evento }
  ];
  return elegirPonderado(tipos).tipo;
}

// Crea un encuentro con una criatura salvaje de la zona.
function encontrarCriatura(datos, partida, zona) {
  const aparicion = elegirPonderado(zona.apariciones);
  const criatura = buscarCriatura(datos, aparicion.criaturaId);
  const nivel = numeroEntre(zona.nivelMin, zona.nivelMax);
  iniciarEncuentro(datos, partida, aparicion.criaturaId, nivel, null);
  return `Apareció ${criatura.nombre} (nivel ${nivel}).`;
}

// Suma 1 al inventario del objeto encontrado.
function encontrarObjeto(datos, partida) {
  const candidatos = datos.objetos.map((o) => ({ objeto: o, peso: o.pesoHallazgo }));
  const objeto = elegirPonderado(candidatos).objeto;
  partida.inventario[objeto.id] = (partida.inventario[objeto.id] || 0) + 1;
  return `Encontraste un objeto: ${objeto.nombre}.`;
}


export function explorar() {
  return conPartida(({ datos, partida }) => {
    if (partida.encuentro) fallar(409, 'Tienes un combate pendiente.');
    if (!equipoActivo(partida).some((c) => c.vida > 0)) fallar(409, 'Tu equipo está debilitado. Cúralo antes de explorar.');

    const zona = buscarZona(datos, partida.zonaActual);
    const tipo = elegirTipo(zona);
    let texto = 'No encontraste nada.';

    if (tipo === 'criatura') texto = encontrarCriatura(datos, partida, zona);
    if (tipo === 'objeto') texto = encontrarObjeto(datos, partida);
    if (tipo === 'evento') texto = elegirAlAzar(datos.eventos);

    registrar(partida, 'EXPLORACION', `${zona.nombre}: ${texto}`);
    return { tipo, texto };
  });
}