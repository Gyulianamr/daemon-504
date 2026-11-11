/* ═══════════════════════════════════════════════════════════════════
 * ESQUELETO (lo sube Genesis Medina en la tarea A2-01)
 * Lo reemplaza: Luis Felipe Ortiz en la tarea A2-03
 * ═══════════════════════════════════════════════════════════════════ */
import { createContext, useContext } from 'react';

const SesionContext = createContext(null);
const valor = { usuario: null, personaje: null, cargando: false, refrescar: async () => {} };

export function SesionProvider({ children }) {
  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export const useSesion = () => useContext(SesionContext);
