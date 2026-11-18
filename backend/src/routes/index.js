/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): servidor con ruta de salud"
 * ═══════════════════════════════════════════════════════════════════ */
// Punto de entrada de todas las rutas de la API (se monta en /api).
// Cada módulo nuevo agrega aquí su línea con su prefijo.
import { Router } from 'express';
import catalogo from './catalogo.js';

const router = Router();

// GET /api/salud → comprueba que la API responde
router.get('/salud', (req, res) => {
  res.json({ estado: 'ok', fecha: new Date().toISOString() });
});

router.use('/catalogo', catalogo); // público: no requiere usuario

export default router;
