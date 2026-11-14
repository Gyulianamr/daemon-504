
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A2-06 · Rama: feature/a2-equipo · Fecha límite: viernes 13 de noviembre
 * Commit: "feat(equipo): administrar equipo activo y reserva"
 * ═══════════════════════════════════════════════════════════════════ */
// Equipo del jugador: máximo 6 criaturas activas.
// Las demás quedan en reserva (posición null).
import { conPartida, fallar } from '../partida.js';
import { buscarCriatura, estadisticas } from '../datos.js';

export const MAXIMO_EQUIPO = 6;

// Combina los datos de la especie con los datos de la criatura del jugador.
export function vistaCriatura(datos, c) {
  const base = buscarCriatura(datos, c.criaturaId);
  return {
    ...c,
    nombre: base.nombre,
    tipo: base.tipo,
    rol: base.rol,
    ...estadisticas(base, c.nivel),
  };
}

// Obtiene las criaturas activas ordenadas por posición.
export const equipoActivo = (partida) =>
  partida.criaturas
    .filter((c) => c.posicion !== null)
    .sort((a, b) => a.posicion - b.posicion);

// Crea una criatura con vida completa.
// Si hay espacio entra al equipo; si no, va a reserva.
export function crearCriatura(datos, partida, criaturaId, nivel) {
  const enEquipo = equipoActivo(partida).length;

  const nueva = {
    id: partida.siguienteId++,
    criaturaId,
    nivel,
    experiencia: 0,
    vida: estadisticas(
      buscarCriatura(datos, criaturaId),
      nivel
    ).vidaMax,
    posicion: enEquipo < MAXIMO_EQUIPO ? enEquipo + 1 : null,
  };

  partida.criaturas.push(nueva);
  return nueva;
}

// Renumera las posiciones del equipo desde 1.
const renumerar = (lista) =>
  lista.forEach((c, i) => {
    c.posicion = i + 1;
  });

// Comprueba que la criatura pertenezca al jugador
// y que no exista un combate activo.
function buscarPropia(partida, id) {
  const criatura = partida.criaturas.find((c) => c.id === id);

  if (!criatura) fallar(404, 'Esa criatura no es tuya.');
  if (partida.encuentro) {
    fallar(409, 'No puedes cambiar el equipo durante un combate.');
  }

  return criatura;
}

// Futuro: GET /api/equipo
export const listarEquipo = () =>
  conPartida(({ datos, partida }) => ({
    activo: equipoActivo(partida).map((c) =>
      vistaCriatura(datos, c)
    ),
    reserva: partida.criaturas
      .filter((c) => c.posicion === null)
      .map((c) => vistaCriatura(datos, c)),
    maximo: MAXIMO_EQUIPO,
  }));

// Futuro: PATCH /api/equipo/:id/activa
export const hacerActiva = (id) =>
  conPartida(({ partida }) => {
    const criatura = buscarPropia(partida, id);

    if (criatura.posicion === null) {
      fallar(409, 'Primero pásala al equipo.');
    }

    const resto = equipoActivo(partida).filter((c) => c.id !== id);
    renumerar([criatura, ...resto]);
  });

// Futuro: PATCH /api/equipo/:id/reserva
export const moverAReserva = (id) =>
  conPartida(({ partida }) => {
    const criatura = buscarPropia(partida, id);
    const activo = equipoActivo(partida);

    if (activo.length === 1) {
      fallar(409, 'Tu equipo debe tener al menos una criatura.');
    }

    criatura.posicion = null;
    renumerar(activo.filter((c) => c.id !== id));
  });

// Futuro: PATCH /api/equipo/:id/equipo
export const moverAlEquipo = (id) =>
  conPartida(({ partida }) => {
    const criatura = buscarPropia(partida, id);
    const activo = equipoActivo(partida);

    if (criatura.posicion !== null) {
      fallar(409, 'Esa criatura ya pertenece al equipo.');
    }

    if (activo.length >= MAXIMO_EQUIPO) {
      fallar(409, `El equipo ya tiene ${MAXIMO_EQUIPO} criaturas.`);
    }

    criatura.posicion = activo.length + 1;

    renumerar(equipoActivo(partida));
  });
