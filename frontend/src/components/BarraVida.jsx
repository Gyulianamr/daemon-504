
export default function BarraVida({ vida, vidaMax }) {
  const porcentaje = vidaMax > 0
    ? Math.min(100, Math.max(0, (vida / vidaMax) * 100))
    : 0;

  let color = 'verde';

  if (porcentaje <= 20) {
    color = 'rojo';
  } else if (porcentaje <= 50) {
    color = 'amarillo';
  }

  return (
    <div className="barra-vida">
      <div
        className="barra-vida__relleno"
        style={{ width: `${porcentaje}%` }}
        data-color={color}
        role="progressbar"
        aria-valuenow={vida}
        aria-valuemin={0}
        aria-valuemax={vidaMax}
        aria-label="Vida de la criatura"
      />

      <span className="barra-vida__texto">
        {vida} / {vidaMax} HP
      </span>
    </div>
  );
}
