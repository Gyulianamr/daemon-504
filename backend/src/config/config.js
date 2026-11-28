// Lee la configuración desde backend/.env (o desde las variables del sistema) y la expone en un solo objeto.
// Ningún otro archivo usa process.env directamente: así las claves nunca quedan escritas en el código.
import 'dotenv/config';

const PUERTO_POR_DEFECTO = 3000;
const ORIGEN_POR_DEFECTO = 'http://localhost:5173';
const SESION_DIAS_POR_DEFECTO = 7;
const LIMITE_ACCESO_POR_DEFECTO = 20; // intentos de registro o inicio de sesión por IP cada 15 minutos
const POKEAPI_POR_DEFECTO = 'https://pokeapi.co/api/v2';
const TIEMPO_MAXIMO_API_EXTERNA_MS = 5000;

// Número entero positivo de una variable de entorno; si falta o no es válido, usa el valor por defecto.
function entero(valor, porDefecto) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : porDefecto;
}

export const config = {
  puerto: Number(process.env.PORT) || PUERTO_POR_DEFECTO,
  baseDatos: {
    url: process.env.DATABASE_URL ?? '',
    ssl: process.env.DB_SSL === 'true',
  },
  corsOrigen: process.env.CORS_ORIGEN || ORIGEN_POR_DEFECTO,
  sesionDias: entero(process.env.SESION_DIAS, SESION_DIAS_POR_DEFECTO),
  limiteAcceso: entero(process.env.LIMITE_ACCESO, LIMITE_ACCESO_POR_DEFECTO),
  apiExterna: {
    url: process.env.POKEAPI_URL || POKEAPI_POR_DEFECTO,
    tiempoMaximo: TIEMPO_MAXIMO_API_EXTERNA_MS,
  },
  registroEnArchivo: process.env.LOG_ARCHIVO === 'true',
};
