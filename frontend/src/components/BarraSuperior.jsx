/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA INTEGRA: Jenifer Padilla
 * Tarea A2-05 · Rama: feature/a2-mundo · Fecha límite: viernes 13 de noviembre
 * Commit: "feat(layout): barra superior con datos del personaje"
 * ═══════════════════════════════════════════════════════════════════ */

import Boton from './Boton.jsx';
import { useSesion } from '../js/sesion/SesionContext.jsx';

export default function BarraSuperior() {
  const { personaje, cerrarSesion } = useSesion();

  if (!personaje) return null;

  return (
    <header className="barra-superior">
      <div className="barra-superior__contenido">
        <p className="barra-superior__titulo">DAEMON 504</p>
        <dl className="barra-superior__datos">
          <div className="barra-superior__dato">
            <dt>Guardián</dt>
            <dd>{personaje.nombre}</dd>
          </div>
          <div className="barra-superior__dato">
            <dt>Bytes</dt>
            <dd>{personaje.bytes}</dd>
          </div>
          <div className="barra-superior__dato">
            <dt>Zona</dt>
            <dd>{personaje.zona}</dd>
          </div>
          <div className="barra-superior__dato">
            <dt>Sellos</dt>
            <dd>
              {personaje.sellos}/{personaje.totalSellos}
            </dd>
          </div>
        </dl>
        <Boton variante="secundario" pequeno onClick={cerrarSesion}>
          Salir
        </Boton>
      </div>
    </header>
  );
}
