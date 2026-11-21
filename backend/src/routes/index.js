/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): servidor con ruta de salud"
 * ═══════════════════════════════════════════════════════════════════ */
// Punto de entrada de todas las rutas de la API (se monta en /api).
// Cada módulo nuevo agrega aquí su línea con su prefijo.
import { Router } from 'express';
import { identificarJugador } from '../middleware/identificarJugador.js';
import { exigirPersonaje } from '../middleware/exigirPersonaje.js';
import catalogo from './catalogo.js';
import historial from './historial.js';
import equipo from './equipo.js';
import personaje from './personaje.js';
import inventario from './inventario.js';

const router = Router();

// Rutas del jugador: exigen X-Usuario-Id (401) y personaje creado (404).
const jugador = [identificarJugador, exigirPersonaje];

// GET /api/salud → comprueba que la API responde
router.get('/salud', (req, res) => {
  res.json({ estado: 'ok', fecha: new Date().toISOString() });
});

router.use('/catalogo', catalogo); // público: no requiere usuario
router.use('/historial', jugador, historial);
router.use('/equipo', jugador, equipo);
router.use('/personaje', personaje); // POST solo pide usuario; GET, PATCH y DELETE piden también personaje
router.use('/inventario', jugador, inventario);

export default router;
