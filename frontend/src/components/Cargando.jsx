
export default function Cargando({
  texto = 'Cargando…',
  pantalla = false,
}) {
  return (
    <div
      className={`cargando ${pantalla ? 'cargando--pantalla' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="cargando__puntos" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>

      <p className="cargando__texto">{texto}</p>
    </div>
  );
}
