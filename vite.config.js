/**
 * Umuhinzi Connect — Vite build configuration.
 * plugin-react for fast refresh; the frontend talks to the backend through
 * VITE_API_URL (see .env.example).
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
