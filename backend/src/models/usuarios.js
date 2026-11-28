// Modelo Sequelize de la tabla usuarios: una cuenta por correo, con la contraseña cifrada.
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/sequelize.js';

export const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.UUID, primaryKey: true },
  correo: { type: DataTypes.TEXT, allowNull: false, unique: true },
  contrasenaHash: { type: DataTypes.TEXT, allowNull: false, field: 'contrasena_hash' },
}, { tableName: 'usuarios', timestamps: false });

export const buscarPorId = (id) =>
  Usuario.findByPk(id, { attributes: ['id', 'correo'], raw: true });

// Incluye el hash para poder verificar la contraseña; nunca se devuelve al navegador.
export const buscarPorCorreo = (correo, transaction) =>
  Usuario.findOne({ where: { correo }, raw: true, transaction });

export async function crear({ id, correo, contrasenaHash }, transaction) {
  const usuario = await Usuario.create({ id, correo, contrasenaHash }, { transaction });
  return { id: usuario.id, correo: usuario.correo };
}
