/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "feat(api): errores y validaciones comunes"
 * ═══════════════════════════════════════════════════════════════════ */
// Validaciones de formato que usan los controladores antes de llamar a un servicio.
// Si el dato no sirve, responden 400 con el mensaje que se les pasa.
import { fallar } from './ErrorApi.js';

// Entero mayor que 0 (ids, cantidades, turnos). Acepta número o texto numérico: "5" → 5.
export function enteroPositivo(valor, mensaje) {
  const texto = typeof valor === 'string' ? valor.trim() : valor;
  const numero = texto === '' || texto === null || typeof texto === 'boolean' ? NaN : Number(texto);
  if (!Number.isInteger(numero) || numero <= 0) fallar(400, mensaje);
  return numero;
}

// Texto no vacío, sin espacios sobrantes al inicio ni al final.
export function textoRequerido(valor, mensaje) {
  if (typeof valor !== 'string' || valor.trim() === '') fallar(400, mensaje);
  return valor.trim();
}
