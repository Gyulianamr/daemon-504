
export default function Mensaje({
  tipo = 'info',
  children,
  alCerrar,
}) {
  if (!children) {
    return null;
  }

  return (
    <div
      className={`mensaje mensaje--${tipo}`}
      role={tipo === 'error' ? 'alert' : 'status'}
    >
      <div className="mensaje__contenido">
        {children}
      </div>

      {alCerrar && (
        <button
          type="button"
          className="mensaje__cerrar"
          onClick={alCerrar}
          aria-label="Cerrar mensaje"
        >
          ×
        </button>
      )}
    </div>
  );
}
