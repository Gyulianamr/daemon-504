/* ═══════════════════════════════════════════════════════════════════
 * ESTA PARTE LA TIENE QUE INTEGRAR: Genesis Medina
 * Tarea A3-01 · Rama: feature/a3-servidor · Turno 1 (fecha máxima: miércoles 18 de noviembre)
 * Commit: "chore(api): crear proyecto Node con Express"
 * ═══════════════════════════════════════════════════════════════════ */
import js from '@eslint/js';
import globals from 'globals';

// Reglas de calidad del Back-End: npm run lint debe pasar antes de integrar a develop.
export default [
  { ignores: ['node_modules'] },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: globals.node,
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
      // Se permite registrar información y errores; console.log de depuración no.
      'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    },
  },
];
