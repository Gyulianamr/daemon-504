/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): configuración desde variables de entorno"
 * ═══════════════════════════════════════════════════════════════════ */
// Lee la configuración desde backend/.env (o desde las variables del sistema) y la expone en un solo objeto.
// Ningún otro archivo usa process.env directamente: así las claves nunca quedan escritas en el código.
import 'dotenv/config';

const PUERTO_POR_DEFECTO = 3000;
const ORIGEN_POR_DEFECTO = 'http://localhost:5173';

export const config = {
  puerto: Number(process.env.PORT) || PUERTO_POR_DEFECTO,
  baseDatos: {
    url: process.env.DATABASE_URL ?? '',
    ssl: process.env.DB_SSL === 'true',
  },
  corsOrigen: process.env.CORS_ORIGEN || ORIGEN_POR_DEFECTO,
};
