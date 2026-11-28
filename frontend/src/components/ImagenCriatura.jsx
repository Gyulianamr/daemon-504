/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A4-08 · Rama: feature/a4-imagenes · Fecha límite: jueves 26 de noviembre
 * Commit: "feat(imagenes): componente de imagen de criatura"
 * ═══════════════════════════════════════════════════════════════════ */
import { useState } from 'react';
import '../css/imagen-criatura.css';

// Imagen de una especie. Los archivos están en public/img/criaturas/ y se llaman como el id
// de la criatura en el catálogo: 1.svg, 2.svg… Si una imagen no existe, no se muestra nada
// y la tarjeta sigue funcionando solo con texto.
export default function ImagenCriatura({ id, nombre }) {
  const [falta, setFalta] = useState(false);
  if (!id || falta) return null;
  return <img className="imagen-criatura" src={`/img/criaturas/${id}.svg`} alt={`Imagen de ${nombre}`} loading="lazy" onError={() => setFalta(true)} />;
}
