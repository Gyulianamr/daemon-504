import * as servicio from '../services/combate.js';
import { enteroPositivo } from '../middleware/validar.js';

export function leerAccion(req) {
  const encuentroId = enteroPositivo(
    req.params.id,
    'El id del encuentro debe ser un número entero mayor que 0.',
  );
  const turno = enteroPositivo(
    req.body?.turno,
    'El turno debe ser un número entero mayor que 0.',
  );
  return { encuentroId, turno };
}

export async function obtenerActual(req, res) {
  res.json(await servicio.obtenerEncuentro(req.personajeId));
}

export async function desafiarGuardian(req, res) {
  res.status(201).json(await servicio.desafiarGuardian(req.personajeId));
}

export async function atacar(req, res) {
  const { encuentroId, turno } = leerAccion(req);
  res.json(await servicio.atacar(req.personajeId, encuentroId, turno));
}

export async function curar(req, res) {
  const { encuentroId, turno } = leerAccion(req);
  res.json(await servicio.usarCuraball(req.personajeId, encuentroId, turno));
}

export async function huir(req, res) {
  const { encuentroId, turno } = leerAccion(req);
  res.json(await servicio.huir(req.personajeId, encuentroId, turno));
}
