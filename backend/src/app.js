/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): servidor con ruta de salud"
 * ═══════════════════════════════════════════════════════════════════ */
// Arma la aplicación Express en orden: middleware comunes → rutas de /api → ruta no encontrada → errores.
// Se separa de server.js para poder probar la app sin abrir un puerto.
import express from 'express';
import cors from 'cors';
import { config } from './config/config.js';
import routes from './routes/index.js';
import { registrarSolicitud } from './middleware/registrarSolicitud.js';
import { noEncontrada } from './middleware/noEncontrada.js';
import { manejarErrores } from './middleware/manejarErrores.js';

const app = express();

app.use(registrarSolicitud); // primero, para que quede registrada toda solicitud (incluso las que fallan)
app.use(cors({ origin: config.corsOrigen }));
app.use(express.json());

app.use('/api', routes);

app.use(noEncontrada);
app.use(manejarErrores);

export default app;
