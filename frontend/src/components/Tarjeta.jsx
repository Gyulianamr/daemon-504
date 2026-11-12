
export default function Tarjeta({
  titulo,
  subtitulo,
  extra,
  destacada = false,
  children,
}) {
  return (
    <section className={`tarjeta ${destacada ? 'tarjeta--destacada' : ''}`}>
      {(titulo || subtitulo || extra) && (
        <header className="tarjeta__encabezado">
          <div>
            {titulo && <h2 className="tarjeta__titulo">{titulo}</h2>}
            {subtitulo && (
              <p className="tarjeta__subtitulo">{subtitulo}</p>
            )}
          </div>

          {extra && <div className="tarjeta__extra">{extra}</div>}
        </header>
      )}

      <div className="tarjeta__contenido">
        {children}
      </div>
    </section>
  );
}
