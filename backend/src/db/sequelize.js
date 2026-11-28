// Conexión Sequelize (ORM) a la misma base PostgreSQL. La usan los modelos de usuarios y sesiones;
// el resto del juego sigue con db/pool.js. Se limita a 2 conexiones porque el Session pooler de
// Supabase solo permite 15 para todo el equipo.
import { Sequelize } from 'sequelize';
import { config } from '../config/config.js';

export const sequelize = new Sequelize(config.baseDatos.url, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: config.baseDatos.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
  pool: { max: 2, min: 0, idle: 10000 },
});
