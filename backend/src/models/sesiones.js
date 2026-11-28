// Modelo Sequelize de la tabla sesiones: un token por inicio de sesión, con fecha de vencimiento.
import { DataTypes, Op } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export const Sesion = sequelize.define('Sesion', {
  token: { type: DataTypes.TEXT, primaryKey: true },
  usuarioId: { type: DataTypes.UUID, allowNull: false, field: 'usuario_id' },
  expiraEn: { type: DataTypes.DATE, allowNull: false, field: 'expira_en' },
}, { tableName: 'sesiones', timestamps: false });

export const crear = ({ token, usuarioId, expiraEn }, transaction) =>
  Sesion.create({ token, usuarioId, expiraEn }, { transaction });

// Devuelve el usuario_id si el token existe y no venció; si venció, borra la fila.
export async function buscarUsuarioId(token) {
  const sesion = await Sesion.findByPk(token);
  if (!sesion) return null;
  if (sesion.expiraEn <= new Date()) {
    await sesion.destroy();
    return null;
  }
  return sesion.usuarioId;
}

export const eliminar = (token) => Sesion.destroy({ where: { token } });

// Borra todas las sesiones vencidas (se llama al iniciar sesión para que la tabla no crezca sin fin).
export const limpiarVencidas = () => Sesion.destroy({ where: { expiraEn: { [Op.lte]: new Date() } } });
