
/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Jatniel Oliva
 * Tarea A2-02 · Rama: feature/a2-componentes
 * Commit: "feat(componentes): botón reutilizable"
 * ═══════════════════════════════════════════════════════════════════ */

// Botón reutilizable para las acciones del juego.
export default function Boton({
  variante = 'principal',
  pequeno = false,
  ancho = false,
  cargando = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...props
}) {
  const clases = [
    'boton',
    `boton--${variante}`,
    pequeno && 'boton--pequeno',
    ancho && 'boton--ancho',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={clases}
      disabled={cargando || disabled}
      aria-busy={cargando}
      {...props}
    >
      {cargando ? 'Procesando…' : children}
    </button>
  );
}
