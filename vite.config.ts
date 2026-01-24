import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    // Minificación automática (ofusca y comprime el código)
    minify: true,
    // Deshabilita source maps en producción (muy importante para seguridad)
    sourcemap: false,
  },
})
