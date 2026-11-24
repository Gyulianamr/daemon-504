/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Dinora Padilla
 * Tarea A3-08 · Rama: feature/a3-exploracion · Turno 3 (fecha máxima: viernes 20 de noviembre)
 * Commit: "feat(exploracion): funciones de azar en el servidor"
 * ═══════════════════════════════════════════════════════════════════ */
// Funciones de azar del servidor (las mismas de frontend/src/js/utils/azar.js).
// En el servidor deciden de verdad qué pasa al explorar: el navegador ya no puede elegir el resultado.

// Elige un elemento con probabilidad proporcional a su propiedad "peso".
export function elegirPonderado(lista) {
  const total = lista.reduce((suma, item) => suma + item.peso, 0);
  let tirada = Math.random() * total;
  for (const item of lista) {
    tirada -= item.peso;
    if (tirada < 0) return item;
  }
  return lista[lista.length - 1];
}

export const elegirAlAzar = (lista) => lista[Math.floor(Math.random() * lista.length)];

// Entero entre min y max, incluidos.
export const numeroEntre = (min, max) => min + Math.floor(Math.random() * (max - min + 1));
