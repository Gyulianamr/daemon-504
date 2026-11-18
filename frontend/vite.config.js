import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuración mínima de Vite. El plugin de React habilita JSX y la recarga en caliente.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});
