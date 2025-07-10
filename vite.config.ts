import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Configuración para GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/combustiblegestor/' : '/',
});
