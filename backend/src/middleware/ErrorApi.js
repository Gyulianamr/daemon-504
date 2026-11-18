/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): errores y validaciones comunes"
 * ═══════════════════════════════════════════════════════════════════ */
// Error con código HTTP. Los servicios lo lanzan con fallar() y el middleware manejarErrores
// lo convierte en la respuesta { "error": mensaje } con ese código (igual que ErrorJuego del Front-End).
export class ErrorApi extends Error {
  constructor(status, mensaje) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.status = status;
  }
}

export function fallar(status, mensaje) {
  throw new ErrorApi(status, mensaje);
}
