import { api } from '../api.js';

export const obtenerZonaActual = () => api.get('/mundo/actual');
export const moverA = (destinoId) => api.post('/mundo/mover', { destino: destinoId });
