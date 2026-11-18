// Funciones de azar que usa la exploración.
// Elige un elemento según su peso.
export function elegirPonderado(lista) {
  const total = lista.reduce((suma, elemento) => suma + elemento.peso, 0);
  let numero = Math.random() * total;
  for (const elemento of lista) {
    numero -= elemento.peso;
    if (numero < 0) return elemento;
  }
  return lista[lista.length - 1];
}

// Elige un elemento cualquiera.
export const elegirAlAzar = (lista) => lista[Math.floor(Math.random() * lista.length)];

// Entero entre min y max, incluidos.
export const numeroEntre = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
