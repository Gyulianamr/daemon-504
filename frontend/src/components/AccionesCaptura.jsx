
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A2-11 · Rama: feature/a2-captura
 * Commit: "feat(captura): botones de captura por tipo de esfera"
 * ═══════════════════════════════════════════════════════════════════ */

import Boton from './Boton.jsx';
import Mensaje from './Mensaje.jsx';

export default function AccionesCaptura({
  esferas = [],
  alCapturar,
  deshabilitado = false,
}) {
  const hayEsferas = esferas.some((esfera) => esfera.cantidad > 0);

  if (!hayEsferas) {
    return (
      <Mensaje tipo="info">
        No tienes esferas de captura disponibles.
      </Mensaje>
    );
  }

  return (
    <div className="acciones-captura">
      {esferas.map((esfera) => (
        <Boton
          key={esfera.id}
          variante="principal"
          ancho
          disabled={deshabilitado || esfera.cantidad <= 0}
          onClick={() => alCapturar(esfera.id)}
        >
          Capturar con {esfera.nombre} ({esfera.cantidad})
        </Boton>
      ))}
    </div>
  );
}
