import { api } from '../api.js';

export const obtenerTienda = () => api.get('/tienda');

export async function comprar(objetoId, cantidad) {
  const { mensaje } = await api.post('/tienda/comprar', { objetoId, cantidad });
  return mensaje;
}

export async function curarEquipo() {
  const { mensaje } = await api.post('/santuario/curar');
  return mensaje;
}  