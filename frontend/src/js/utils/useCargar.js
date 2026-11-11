/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A2-01 · Rama: feature/a2-base · Fecha límite: miércoles 11 de noviembre
 * Commit: "feat(base): hook useCargar para pedir datos con estado de carga"
 * ═══════════════════════════════════════════════════════════════════ */
import { useCallback, useEffect, useState } from 'react';

// Pide datos a un servicio y devuelve { datos, cargando, error, recargar, setDatos }.
// Evita repetir el mismo useState + useEffect + try/catch en cada página.
export function useCargar(servicio) {
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const pedir = useCallback(servicio, []);

  const recargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      setDatos(await pedir());
    } catch (e) {
      setError(e);
    } finally {
      setCargando(false);
    }
  }, [pedir]);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { datos, cargando, error, recargar, setDatos };
}
