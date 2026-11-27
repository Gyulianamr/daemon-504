import { api } from '../api.js';
export const obtenerEncuentro = () => api.get('/encuentros/actual');
export const desafiarGuardian = () => api.post('/encuentros/guardian');
export const atacar = (encuentroId, turno) => api.post(`/encuentros/${encuentroId}/atacar`, { turno });
export const usarCuraball = (encuentroId, turno) => api.post(`/encuentros/${encuentroId}/curar`, { turno });
export const huir = (encuentroId, turno) => api.post(`/encuentros/${encuentroId}/huir`, { turno });