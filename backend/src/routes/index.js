/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A4-01 · Rama: feature/a4-base · Fecha límite: miércoles 25 de noviembre
 * Commit: "feat(auth): endpoints de /api/acceso con sesión por token"
 * ═══════════════════════════════════════════════════════════════════ */
// Punto de entrada de todas las rutas de la API (se monta en /api).
// Cada módulo nuevo agrega aquí su línea con su prefijo.
import { Router } from 'express';
import { requiereSesion } from '../middleware/sesion.js';
import { exigirPersonaje } from '../middleware/exigirPersonaje.js';
import catalogo from './catalogo.js';
import acceso from './acceso.js';
import historial from './historial.js';
import equipo from './equipo.js';
import personaje from './personaje.js';
import inventario from './inventario.js';
import mundo from './mundo.js';
import exploracion from './exploracion.js';
import encuentros from './encuentros.js';
import tienda from './tienda.js';
import santuario from './santuario.js';



const router = Router();

// Rutas del jugador: exigen token Bearer (401) y personaje creado (404).
const jugador = [requiereSesion, exigirPersonaje];

// GET /api/salud → comprueba que la API responde
router.get('/salud', (req, res) => {
  res.json({ estado: 'ok', fecha: new Date().toISOString() });
});

router.use('/catalogo', catalogo); // público: no requiere usuario
router.use('/acceso', acceso); // público: registro e inicio de sesión
router.use('/historial', jugador, historial);
router.use('/equipo', jugador, equipo);
router.use('/personaje', personaje); // POST solo pide usuario; GET, PATCH y DELETE piden también personaje
router.use('/inventario', jugador, inventario);
router.use('/mundo', jugador, mundo);
router.use('/exploracion', jugador, exploracion);
router.use('/encuentros', jugador, encuentros);
router.use('/tienda', jugador, tienda);
router.use('/santuario', jugador, santuario);


export default router;
