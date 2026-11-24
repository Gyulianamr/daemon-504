/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Heysser Machado
 * Tarea A3-13 · Rama: feature/a3-tienda · Turno 6 (fecha máxima: lunes 23 de noviembre)
 * Commit: "feat(tienda): endpoints de /api/tienda y /api/santuario"
 * ═══════════════════════════════════════════════════════════════════ */
// Controladores de /api/tienda y /api/santuario: leen el formato de la solicitud y llaman al servicio.
// El precio nunca se lee del cuerpo: aunque el navegador envíe "precio", se ignora.
import * as servicio from '../services/tienda.js';
import { enteroPositivo } from '../middleware/validar.js';

// GET /api/tienda
export async function obtener(req, res) {
  res.json(await servicio.obtenerTienda(req.personajeId));
}

// POST /api/tienda/comprar { objetoId, cantidad }
export async function comprar(req, res) {
  const objetoId = enteroPositivo(req.body?.objetoId, 'Indica qué objeto quieres comprar.');
  // La cantidad no se convierte con enteroPositivo: el servicio responde con el rango permitido (1 a 10).
  res.json(await servicio.comprar(req.personajeId, objetoId, Number(req.body?.cantidad)));
}

// POST /api/santuario/curar
export async function curar(req, res) {
  res.json(await servicio.curarEquipo(req.personajeId));
}
