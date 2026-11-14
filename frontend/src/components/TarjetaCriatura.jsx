
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A2-06 · Rama: feature/a2-equipo · Fecha límite: viernes 13 de noviembre
 * Commit: "feat(equipo): tarjeta de criatura"
 * ═══════════════════════════════════════════════════════════════════ */
import BarraVida from './BarraVida.jsx';

export default function TarjetaCriatura({
  criatura,
  activa,
  children,
}) {
  const debilitada = criatura.vida <= 0;

  const clases = [
    'tarjeta-criatura',
    activa ? 'tarjeta-criatura--activa' : '',
    debilitada ? 'tarjeta-criatura--debilitada' : '',
  ].filter(Boolean).join(' ');

  return (
    <article className={clases}>
      <header className="tarjeta-criatura__encabezado">
        <div>
          <h2 className="tarjeta-criatura__nombre">
            {activa && '★ '}
            {criatura.nombre}
          </h2>

          <p className="tarjeta-criatura__tipo">
            {criatura.tipo} · {criatura.rol}
          </p>
        </div>

        <span className="tarjeta-criatura__nivel">
          Nivel {criatura.nivel}
        </span>
      </header>

      <BarraVida
        vida={criatura.vida}
        vidaMax={criatura.vidaMax}
      />

      <div className="tarjeta-criatura__estadisticas">
        <span>ATQ: {criatura.ataque}</span>
        <span>DEF: {criatura.defensa}</span>
        <span>EXP: {criatura.experiencia}</span>
      </div>

      {children && (
        <div className="tarjeta-criatura__acciones">
          {children}
        </div>
      )}
    </article>
  );
}
