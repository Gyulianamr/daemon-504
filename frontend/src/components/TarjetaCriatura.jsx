
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A4-06 · Rama: feature/a4-equipo
 * Commit: "feat(equipo): mostrar apodo y especie en la tarjeta"
 * ═══════════════════════════════════════════════════════════════════ */
import BarraVida from './BarraVida.jsx';

// Muestra una criatura del jugador o un rival. Se usa en Equipo y en Combate.
// "children" permite agregar botones (por ejemplo "Hacer activa").
// Si la criatura tiene apodo, se muestra el apodo y al lado su especie.
export default function TarjetaCriatura({ criatura, activa = false, children }) {
  const debilitada = criatura.vida === 0;
  const tieneApodo = criatura.especie && criatura.especie !== criatura.nombre;
  const clases = ['tarjeta-criatura', activa && 'tarjeta-criatura--activa', debilitada && 'tarjeta-criatura--debilitada'].filter(Boolean).join(' ');
  return (
    <article className={clases}>
      <div className="tarjeta-criatura__encabezado">
        <div>
          <h3 className="tarjeta-criatura__nombre">
            {activa && <span className="tarjeta-criatura__etiqueta">★</span>}
            {criatura.nombre}
            {tieneApodo && <span className="tarjeta-criatura__especie"> ({criatura.especie})</span>}
          </h3>
          <p className="tarjeta-criatura__detalle">
            <span className="tipo">{criatura.tipo}</span> {criatura.rol}
          </p>
        </div>
        <span className="tarjeta-criatura__nivel">Nv {criatura.nivel}</span>
      </div>
      <BarraVida vida={criatura.vida} vidaMax={criatura.vidaMax} />
      <p className="tarjeta-criatura__detalle">
        ATQ {criatura.ataque} · DEF {criatura.defensa}
        {criatura.experiencia !== undefined && ` · EXP ${criatura.experiencia}/100`}
        {debilitada && ' · Debilitada'}
      </p>
      {children && <div className="tarjeta-criatura__acciones">{children}</div>}
    </article>
  );
}
